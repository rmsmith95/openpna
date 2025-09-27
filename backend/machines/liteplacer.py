# machine/liteplacer.py
import logging
from pydantic import BaseModel
from fastapi import APIRouter
import serial
import time
import re

router = APIRouter()
connection: serial.Serial | None = None

# --- Connect ---
class ConnectRequest(BaseModel):
    port: str
    baud: int = 115200

@router.post("/connect")
def connect(request: ConnectRequest):
    global connection
    try:
        # Close existing connection if it's open
        if connection and connection.is_open:
            try:
                connection.close()
                logging.info("Closed previous LitePlacer connection")
            except Exception as e:
                logging.warning(f"Failed to close previous connection: {e}")

        # Open new connection
        connection = serial.Serial(request.port, request.baud, timeout=1)
        logging.info(f"Connected to LitePlacer on {request.port} at {request.baud} baud")
        return {"status": "connected", "device": "liteplacer"}

    except Exception as e:
        logging.error(f"Failed to connect: {e}")
        connection = None  # clear the connection so next attempt works
        return {"status": "error", "message": str(e)}

# --- Get position (plain-text parsing) ---
@router.get("/get_position")
def get_position():
    if not connection or not connection.is_open:
        return {"error": "LitePlacer not connected"}

    try:
        connection.reset_input_buffer()
        connection.write(b"?\n")
        time.sleep(0.05)  # wait for TinyG to respond

        # Read all available lines
        lines = []
        while connection.in_waiting:
            line = connection.readline().decode(errors="ignore").strip()
            if line:
                lines.append(line)

        if not lines:
            return {"error": "No response from TinyG"}

        logging.info("TinyG raw response:\n" + "\n".join(lines))

        # Parse X/Y/Z positions
        positions = {"X": 0.0, "Y": 0.0, "Z": 0.0, "A": 0.0}
        for line in lines:
            m = re.search(r"X position:\s*([-0-9.]+)", line)
            if m: positions["X"] = float(m.group(1))
            m = re.search(r"Y position:\s*([-0-9.]+)", line)
            if m: positions["Y"] = float(m.group(1))
            m = re.search(r"Z position:\s*([-0-9.]+)", line)
            if m: positions["Z"] = float(m.group(1))
            m = re.search(r"A position:\s*([-0-9.]+)", line)
            if m: positions["A"] = float(m.group(1))

        return {"positions": positions}

    except Exception as e:
        logging.error(f"LitePlacer get_positions error: {e}")
        return {"error": str(e)}

# --- Move gantry ---
class MoveXYZRequest(BaseModel):
    x: float
    y: float
    z: float
    a: float
    speed: float  # mm/min

@router.post("/move_xyz")
def move_xyz(req: MoveXYZRequest):
    if not connection or not connection.is_open:
        return {"error": "LitePlacer not connected"}

    try:
        # Form G-code command (G0 = rapid move)
        gcode = f"G0 X{req.x} Y{req.y} Z{req.z} A{req.a} F{req.speed}\n"
        connection.write(gcode.encode())
        logging.info(f"Sent G-code: {gcode.strip()}")

        return {
            "status": "ok",
            "target": {"x": req.x, "y": req.y, "z": req.z, "a": req.a, "speed": req.speed}
        }
    except Exception as e:
        logging.error(f"LitePlacer move_xyz error: {e}")
        return {"error": str(e)}
