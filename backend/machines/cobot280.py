import logging
import socket
from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()
sock: socket.socket | None = None  # will hold the network connection


# --- Models ---
class NetworkConnectRequest(BaseModel):
    ip: str
    port: int = 8000


class MoveJointRequest(BaseModel):
    joint: int
    direction: str   # "left" or "right"
    delta: float = 5
    speed: int = 50


# --- Connect to Raspberry Pi cobot server ---
@router.post("/connect_network")
def connect_network(req: NetworkConnectRequest):
    global sock
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((req.ip, req.port))
        sock.settimeout(3)
        logging.info(f"Connected to cobot server at {req.ip}:{req.port}")
        return {"status": "connected", "ip": req.ip, "port": req.port}
    except Exception as e:
        logging.error(f"Network connect failed: {e}")
        sock = None
        return {"status": "error", "message": str(e)}


# --- Move a specific joint ---
@router.post("/move_joint")
def move_joint(req: MoveJointRequest):
    global sock
    if sock is None:
        return {"error": "Not connected to cobot server"}

    # Build joint angle command string
    joint_angles = [0, 0, 0, 0, 0, 0]
    if req.direction == "left":
        joint_angles[req.joint] -= req.delta
    elif req.direction == "right":
        joint_angles[req.joint] += req.delta
    else:
        return {"error": "Direction must be 'left' or 'right'"}

    cmd = f"MOVEJ {' '.join(map(str, joint_angles))}\n"

    try:
        sock.sendall(cmd.encode())
        response = sock.recv(1024).decode().strip()
        return {
            "status": "sent",
            "command": cmd.strip(),
            "response": response,
        }
    except Exception as e:
        logging.error(f"Failed to send MOVEJ: {e}")
        return {"error": str(e)}


# --- Get current position ---
@router.get("/getpos")
def get_position():
    global sock
    if sock is None:
        return {"error": "Not connected"}

    try:
        sock.sendall(b"GETPOS\n")
        response = sock.recv(1024).decode().strip()
        return {"status": "ok", "coords": response}
    except Exception as e:
        logging.error(f"Get position failed: {e}")
        return {"error": str(e)}
