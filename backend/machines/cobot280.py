import logging
from pydantic import BaseModel
from fastapi import APIRouter
import serial
import socket

router = APIRouter()
connection: serial.Serial | None = None
# current_joints: list[float] = [0, 0, 0, 0, 0, 0]  # track joint angles

# --- Models ---
class SerialConnectRequest(BaseModel):
    port: str
    baud: int = 115200

class NetworkConnectRequest(BaseModel):
    ip: str
    port: int = 115200  # optional, default same as serial baud rate if you need

class MoveJointRequest(BaseModel):
    joint: int       # 0–5
    direction: str   # "left" or "right"
    delta: float = 5
    speed: int = 50

# --- Serial connect ---
@router.post("/connect_serial")
def connect_serial(req: SerialConnectRequest):
    global connection
    try:
        connection = serial.Serial(req.port, req.baud, timeout=1)
        logging.info(f"Connected to Cobot280 on {req.port} at {req.baud} baud")
        return {"status": "connected", "method": "serial"}
    except Exception as e:
        logging.error(f"Serial connect failed: {e}")
        return {"status": "error", "message": str(e)}

# --- Network connect ---
@router.post("/connect_network")
def connect_network(req: NetworkConnectRequest):
    global connection
    try:
        # test TCP connection to given IP
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)
        sock.connect((req.ip, 8000))  # port 8000 for cobot Python service
        sock.close()
        logging.info(f"Network connect success to {req.ip}")
        return {"status": "connected", "method": "network", "ip": req.ip}
    except Exception as e:
        logging.error(f"Network connect failed: {e}")
        return {"status": "error", "message": str(e)}

# --- Move specific joint ---
@router.post("/move_joint")
def move_joint(req: MoveJointRequest):

    joint_angles: list[float] = [0, 0, 0, 0, 0, 0]
    if req.direction == "left":
        joint_angles[req.joint] -= req.delta
    elif req.direction == "right":
        joint_angles[req.joint] += req.delta
    else:
        return {"error": "Invalid direction, must be 'left' or 'right'"}

    try:
        connection.send_angles(joint_angles, req.speed)
        return {
            "status": "ok",
            "joints": joint_angles,
            "moved_joint": req.joint,
            "direction": req.direction,
            "speed": req.speed,
        }
    except Exception as e:
        logging.error(f"Move failed: {e}")
        return {"error": str(e)}
