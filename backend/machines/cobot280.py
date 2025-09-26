
import logging
import json
from pydantic import BaseModel
from fastapi import APIRouter, Body
import serial


router = APIRouter()
connection = None  # type: serial.Serial | None

class ConnectRequest(BaseModel):
    port: str
    baud: int = 115200

@router.post("/connect")
def connect(request: ConnectRequest):
    global connection
    try:
        connection = serial.Serial(request.port, request.baud, timeout=1)
        logging.info(f"Connected to LitePlacer on {request.port} at {request.baud} baud")
        return {"status": "connected", "device": "liteplacer"}
    except Exception as e:
        logging.error(f"Failed to connect to LitePlacer: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/move")
def move_joints(joints: list[float], speed: int = 50):
    """
    Move the cobot to the specified joint angles.

    Args:
        joints: [j1, j2, j3, j4, j5, j6] (degrees)
        speed: movement speed (1–100)
    """
    if not cobot:
        return {"error": "Cobot 280 not connected"}
    if len(joints) != 6:
        return {"error": "Must provide 6 joint angles"}
    try:
        cobot.send_angles(joints, speed)
        return {"status": "ok", "joints": joints, "speed": speed}
    except Exception as e:
        return {"error": str(e)}