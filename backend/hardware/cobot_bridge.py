#!/usr/bin/env python3
import socket
import threading
import json
from pymycobot.mycobot import MyCobot

# --- MyCobot setup ---
PORT = "/dev/ttyAMA0"
BAUD = 115200
mc = MyCobot(PORT, BAUD)
print("✅ Connected to MyCobot 280 on", PORT)

# --- TCP server setup ---
HOST = "0.0.0.0"  # listen on all interfaces
PORT_TCP = 8000

def handle_client(conn, addr):
    print(f"🔌 Client connected: {addr}")
    try:
        while True:
            data = conn.recv(1024)
            if not data:
                break
            try:
                cmd = json.loads(data.decode())
                command = cmd.get("command")

                if command == "set_angles":
                    angles = cmd.get("angles")
                    if not angles or len(angles) != 6:
                        raise ValueError("Must provide 6 angles")
                    speed = int(cmd.get("speed", 50))
                    mc.send_angles(angles, speed)
                    resp = {"status": "ok", "angles": angles}
                
                elif command == "set_angle":
                    jointIndex = cmd.get("jointIndex")
                    deltaValue = cmd.get("deltaValue")
                    angles = mc.get_angles()
                    angles[jointIndex] += deltaValue
                    speed = int(cmd.get("speed", 50))
                    mc.send_angles(angles, speed)
                    resp = {"status": "ok", "angles": angles}

                elif command == "get_position":
                    angles = mc.get_angles()
                    resp = {"status": "ok", "angles": angles}

                elif command == "gripper_open":
                    mc.open_gripper()
                    resp = {"status": "ok"}

                elif command == "gripper_close":
                    mc.close_gripper()
                    resp = {"status": "ok"}

                else:
                    resp = {"status": "error", "message": f"Unknown command '{command}'"}

                conn.sendall(json.dumps(resp).encode())

            except Exception as e:
                conn.sendall(json.dumps({"status":"error","message": str(e)}).encode())

    finally:
        conn.close()
        print(f"❌ Client disconnected: {addr}")

# --- Start TCP server ---
sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
sock.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
sock.bind((HOST, PORT_TCP))
sock.listen(5)
print(f"🚀 Listening for commands on {HOST}:{PORT_TCP}")

while True:
    conn, addr = sock.accept()
    threading.Thread(target=handle_client, args=(conn, addr), daemon=True).start()
