
import serial
import logging
import json
from fastapi import APIRouter

router = APIRouter()
connection = None  # type: serial.Serial | None

@router.post("/connect")
def connect(port: str, baud: int = 115200):
    global connection
    try:
        connection = serial.Serial(port, baud, timeout=1)
        return {"status": "connected", "device": "liteplacer"}
    except Exception as e:
        logging.error(f"LitePlacer connect failed: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/disconnect")
def disconnect():
    global connection
    if connection and connection.is_open:
        connection.close()
    connection = None
    return {"status": "disconnected", "device": "liteplacer"}

@router.get("/get_positions")
def get_positions():
    if not connection or not connection.is_open:
        return {"error": "LitePlacer not connected"}
    try:
        connection.write(b"?\n")
        line = connection.readline().decode().strip()
        data = json.loads(line)  # TinyG JSON
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

@router.post("/move_xyz")
def move_xyz(axis: str, delta: float):
    """Send movement command to LitePlacer"""
    if not connection or not connection.is_open:
        return {"error": "LitePlacer not connected"}
    # TinyG expects G-code moves: G0 X... Y... Z...
    cmd = f"G91\nG0 {axis}{delta}\nG90\n".encode()
    connection.write(cmd)
    return {"status": "ok", "command": cmd.decode()}
