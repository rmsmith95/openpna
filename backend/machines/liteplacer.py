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

# --- TinyG command helpers ---
def tinyg_send(command: str, delay: float = 0.05):
    """Send a raw command to TinyG and optionally wait a bit."""
    logging.info(f"tinyg_send {command}")
    if not connection or not connection.is_open:
        logging.warning("TinyG not connected")
        return {"error": "LitePlacer not connected"}
    try:
        connection.reset_input_buffer()
        connection.write((command + "\n").encode())
        time.sleep(delay)
        # Read any available response
        lines = []
        while connection.in_waiting:
            line = connection.readline().decode(errors="ignore").strip()
            if line:
                lines.append(line)
        return {"status": "ok", "response": lines}
    except Exception as e:
        logging.error(f"Error sending TinyG command '{command}': {e}")
        return {"error": str(e)}

@router.post("/soft_reset")
def soft_reset():
    """Soft reset TinyG (Ctrl+X)."""
    if not connection or not connection.is_open:
        logging.warning("TinyG not connected")
        return {"error": "LitePlacer not connected"}
    try:
        connection.write(b"\x18")  # Ctrl+X
        logging.info("Sent TinyG soft reset (Ctrl+X)")
        time.sleep(0.1)
        return {"status": "ok"}
    except Exception as e:
        logging.error(f"TinyG soft reset error: {e}")
        return {"error": str(e)}


def tinyg_feed_hold():
    """Pause motion (!)."""
    return tinyg_send("!")


def tinyg_cycle_start():
    """Resume motion (~)."""
    return tinyg_send("~")


def tinyg_home_all():
    """Home all axes ($H)."""
    return tinyg_send("$H")


def tinyg_set_position(x=0, y=0, z=0, a=0):
    """Set current position (G92)."""
    gcode = f"G92 X{x} Y{y} Z{z} A{a}"
    return tinyg_send(gcode)

# --- Get full TinyG status ---
@router.get("/get_info")
def get_info():
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

        # Try to parse JSON lines from TinyG (some lines may be plain text)
        status_list = []
        for line in lines:
            try:
                import json
                status_list.append(json.loads(line))
            except Exception:
                # If line is not JSON, just include as raw string
                status_list.append({"raw": line})

        return {"status": status_list}

    except Exception as e:
        logging.error(f"LitePlacer get_positions error: {e}")
        return {"error": str(e)}


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
    # Form G-code command (G0 = rapid move)
    gcode = f"G0 X{req.x} Y{req.y} Z{req.z} A{req.a} F{req.speed}\n"
    tinyg_send(gcode)
