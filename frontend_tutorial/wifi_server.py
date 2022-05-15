import socket
import subprocess as sp
import time
import picar_4wd as fc
from picar_4wd.motor import Motor
from picar_4wd.pwm import PWM
from picar_4wd.pin import Pin

########################################################
# Motors
speed = 50

left_front = Motor(PWM("P13"), Pin("D4"), is_reversed=True) # motor 1
right_front = Motor(PWM("P12"), Pin("D5"), is_reversed=True) # motor 2
left_rear = Motor(PWM("P8"), Pin("D11"), is_reversed=True) # motor 3
right_rear = Motor(PWM("P9"), Pin("D15"), is_reversed=True) # motor 4

def forward(power):
    left_front.set_power(power)
    left_rear.set_power(power)
    right_front.set_power(power)
    right_rear.set_power(power)

def backward(power):
    left_front.set_power(-power)
    left_rear.set_power(-power)
    right_front.set_power(-power)
    right_rear.set_power(-power)

def turn_left(power):
    left_front.set_power(-power)
    left_rear.set_power(-power)
    right_front.set_power(power)
    right_rear.set_power(power)

def turn_right(power):
    left_front.set_power(power)
    left_rear.set_power(power)
    right_front.set_power(-power)
    right_rear.set_power(-power)

def stop():
    left_front.set_power(0)
    left_rear.set_power(0)
    right_front.set_power(0)
    right_rear.set_power(0)

########################################################
# Wifi
HOST = "10.0.0.10" # IP address of your Raspberry PI
PORT = 65482          # Port to listen on (non-privileged ports are > 1023)
direction = "None"
with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
    s.bind((HOST, PORT))
    s.listen()

    try:
        while 1:
            client, clientInfo = s.accept()
            print("server recv from: ", clientInfo)
            data = client.recv(1024)      # receive 1024 Bytes of message in binary format
            if data != b"":
                print(data.decode())
                data = data.decode()
                if data == "F":
                    # move car forward
                    direction = "Forward"
                    forward(speed)
                elif data == "R":
                    # move car right
                    direction = "Right"
                    turn_right(speed)
                    time.sleep(1.4)
                    stop()
                    direction = "None"
                elif data == "L":
                    # move car left
                    direction = "Left"
                    turn_left(speed)
                    time.sleep(1.4)
                    stop()
                    direction = "None"
                elif data == "B":
                    # move car backwards
                    direction = "Backwards"
                    backward(speed)
                elif data == "S":
                    # stop car
                    direction = "None"
                    stop()
                elif data == "Stats":
                    # get car stats
                    stdoutdata = sp.getoutput("bluetoothctl paired-devices")
                    if "C0:3C:59:8C:17:BA" in stdoutdata.split():
                        paired = "C0:3C:59:8C:17:BA Bluetooth device is paired"
                    else:
                        paired = "C0:3C:59:8C:17:BA Bluetooth device not paired"
                    stats = str(speed)+","+direction+","+paired
                    print(stats)
                    lis = stats.encode()
                    client.sendall(lis) # Echo back to client
    except: 
        print("Closing socket")
        client.close()
        s.close()    