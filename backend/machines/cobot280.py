
import serial
import logging
from fastapi import APIRouter

router = APIRouter()
connection = None  # type: serial.Serial | None

@router.post("/connect")
def connect(port: str, baud: int = 115200):
    global connection
    try:
        connection = serial.Serial(port, baud, timeout=1)
        return {"status": "connected", "device": "cobot280"}
    except Exception as e:
        logging.error(f"Cobot280 connect failed: {e}")
        return {"status": "error", "message": str(e)}

@router.post("/disconnect")
def disconnect():
    global connection
    if connection and connection.is_open:
        connection.close()
    connection = None
    return {"status": "disconnected", "device": "cobot280"}

@router.get("/get_positions")
def get_positions():
    if not connection or not connection.is_open:
        return {"error": "Cobot 280 not connected"}
    try:
        connection.write(b"GET_POS\n")  # Replace with pymycobot if using it
        line = connection.readline().decode().strip()
        positions = {}
        for part in line.split(","):
            if ":" in part:
                k, v = part.split(":")
                positions[k.strip()] = float(v.strip())
        return {"positions": positions}
    except Exception as e:
        logging.error(f"Cobot280 get_positions error: {e}")
        return {"error": str(e)}

@router.post("/move_joint")
def move_joint(joint: int, delta: float):
    """Send movement command to MyCobot 280"""
    if not connection or not connection.is_open:
        return {"error": "Cobot 280 not connected"}
    cmd = f"MOVE_JOINT {joint} {delta}\n".encode()
    connection.write(cmd)
    return {"status": "ok", "command": cmd.decode()}
