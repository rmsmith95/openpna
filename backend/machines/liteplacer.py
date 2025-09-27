
import logging
import json
from pydantic import BaseModel
from fastapi import APIRouter, Body
from sections.machines import LitePlacer
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

@router.get("/get_position")
def get_position():
    if not connection or not connection.is_open:
        return {"error": "LitePlacer not connected"}

    try:
        # Send status request
        connection.write(b"?\n")
        
        # Wait a short time for TinyG to respond
        import time
        time.sleep(0.05)
        
        # Read line
        line = connection.readline().decode().strip()
        if not line:
            return {"error": "No response from TinyG"}
        
        logging.info(f"TinyG raw response: {line}")

        # Parse JSON safely
        try:
            data = json.loads(line)
        except json.JSONDecodeError:
            return {"error": "Invalid JSON from TinyG", "raw": line}

        pos = data.get("sr", {})
        positions = {
            "X": pos.get("posx", 0),
            "Y": pos.get("posy", 0),
            "Z": pos.get("posz", 0)
        }
        return {"positions": positions}

    except Exception as e:
        logging.error(f"LitePlacer get_positions error: {e}")
        return {"error": str(e)}

class MoveXYZRequest(BaseModel):
    x: float
    y: float
    z: float
    speed: float  # now required

@router.post("/move_xyz")
def move_xyz(req: MoveXYZRequest):
    # Replace this with actual hardware code
    print(f"Moving gantry to X:{req.x}, Y:{req.y}, Z:{req.z} at speed {req.speed}")

    # Example: LitePlacer.move_to(x=req.x, y=req.y, z=req.z, speed=req.speed)

    return {"status": "ok", "target": {"x": req.x, "y": req.y, "z": req.z, "speed": req.speed}}