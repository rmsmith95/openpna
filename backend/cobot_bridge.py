# this files runs on a rpi cobot 280. it bridges the commands from the backend to the cobot controller.

import socket
from pymycobot.mycobot import MyCobot

HOST = "0.0.0.0"   # Listen on all interfaces
PORT = 8000        # Choose your port

# Initialize the myCobot
mc = MyCobot("/dev/ttyAMA0", 115200)

# Create a TCP socket server
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((HOST, PORT))
server.listen(1)

print(f"✅ Listening for cobot commands on {HOST}:{PORT}")

while True:
    client, addr = server.accept()
    print(f"📡 Connection from {addr}")

    with client:
        while True:
            data = client.recv(1024)
            if not data:
                break

            cmd = data.decode().strip()
            print(f"➡️ Received command: {cmd}")

            # Example commands
            if cmd.startswith("MOVEJ"):
                try:
                    # Example: MOVEJ 0 10 20 30 40 50
                    angles = list(map(float, cmd.split()[1:]))
                    mc.send_angles(angles, 50)
                    client.sendall(b"OK\n")
                except Exception as e:
                    client.sendall(f"ERR {e}\n".encode())

            elif cmd == "GETPOS":
                pos = mc.get_coords()
                client.sendall(f"{pos}\n".encode())

            elif cmd == "STOP":
                mc.stop()
                client.sendall(b"STOPPED\n")

            else:
                client.sendall(b"UNKNOWN COMMAND\n")
