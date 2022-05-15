import bluetooth
import subprocess as sp
import picar_4wd as fc
from picar_4wd.motor import Motor
from picar_4wd.pwm import PWM
from picar_4wd.pin import Pin

########################################################
# Motors
speed = 100

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
# Bluetooth
hostMACAddress = "E4:5F:01:70:FC:F3" # The address of Raspberry PI Bluetooth adapter on the server. The server might have multiple Bluetooth adapters.
port = 1
backlog = 1
size = 1024
s = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
s.bind((hostMACAddress, port))
s.listen(backlog)
print("listening on port ", port)
try:
    client, clientInfo = s.accept()
    while 1:   
        print("server recv from: ", clientInfo)
        data = client.recv(size)
        if data:
            print(data)
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
            elif data == "L":
                # move car left
                direction = "Left"
                turn_left(speed)
                time.sleep(1.4)
                stop()
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
                    paried = "C0:3C:59:8C:17:BA Bluetooth device not paired"
                statsList = [str(speed),direction,paired]
                client.send(statsList) # Echo back to client
except: 
    print("Closing socket")
    client.close()
    s.close()
