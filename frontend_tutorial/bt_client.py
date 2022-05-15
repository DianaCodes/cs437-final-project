import bluetooth

host = "E4:5F:01:70:FC:F3" # The address of Raspberry PI Bluetooth adapter on the server.
port = 1
sock = bluetooth.BluetoothSocket(bluetooth.RFCOMM)
print("test")
sock.connect((host, port))
print("test1")
while 1:
    print("test2")
    text = input("Bluetooth communication\nType...\nF to move car forward\nR to move car right\nL to move car left\nB to move car backwards\nS to stop car\nStats to get car statistics\nQ to quit\nEnter your message: ") # Note change to the old (Python 2) raw_input
    if text == "Q":
        break
    sock.send(text)
    data = sock.recv(1024)
    print("from server: ", data)

sock.close()
