# machine/tinyg.py
import logging
from pydantic import BaseModel
from fastapi import APIRouter, Request
import serial
import time
import re
import random
import json
from simulation.liteplacer import sim


router = APIRouter()
connection: serial.Serial | None = None

# --- Connect ---
class ConnectRequest(BaseModel):
    port: str
    baud: int = 115200

@router.post("/connect")
def connect(request: ConnectRequest):
    """
curl -X POST http://localhost:8000/connect -H "Content-Type: application/json" -d '{"port": "/dev/ttyUSB0", "baud": 115200}'
import serial
connection = serial.Serial('COM10', 115200, timeout=1)
# connection.write(b"M8\n") # M9
"""
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

class TinyGCommand(BaseModel):
    command: str
    delay: float = 0.05

@router.post("/tinyg_send")
def tinyg_send(req: TinyGCommand):
    """Send a raw command to TinyG and optionally wait a bit."""
    command = req.command
    delay = req.delay

    if not connection or not connection.is_open:
        logging.info("Running simulation, TinyG not connected")
        return sim(command)
        # return {"error": "LitePlacer not connected"}

    logging.info(f"tinyg_send {command}")

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

@router.post("/reset")
def reset():
    """Soft reset TinyG (Ctrl+X)."""
    if not connection or not connection.is_open:
        logging.warning("TinyG not connected")
        return {"error": "LitePlacer not connected"}
    try:
        connection.write(b"\x18")  # Ctrl+X
        logging.info("Sent TinyG soft reset (Ctrl+X)")
        time.sleep(0.2)
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


class SetPositionRequest(BaseModel):
    x: float
    y: float
    z: float
    a: float

@router.post("/set_position")
def set_position(req: SetPositionRequest):
    """Set current position (G92)."""
    gcode = f"G92 X{req.x} Y{req.y} Z{req.z} A{req.a}"
    if not connection or not connection.is_open:
        return sim(gcode)
    try:
        cmd = TinyGCommand(command=gcode)
        result = tinyg_send(cmd)
        return result  # should be JSON
    except Exception as e:
        logging.error(f"set_position error: {e}")
        return {"status": "error", "message": str(e)}


@router.get("/get_info")
def get_info(request: Request):
    if not connection or not connection.is_open:
        return sim("?")

    try:
        connection.reset_input_buffer()
        connection.write(b"?\n")  # TinyG status request

        lines = []
        timeout = time.time() + 1.0  # 1-second timeout
        while time.time() < timeout:
            while connection.in_waiting:
                line = connection.readline().decode(errors="ignore").strip()
                if line:
                    lines.append(line)
            if lines:
                break
            time.sleep(0.01)

        if not lines:
            return {"error": "No response from TinyG"}

        # Initialize parsed values
        info = {
            "x": 0.0,
            "y": 0.0,
            "z": 0.0,
            "a": 0.0,
            "feedrate": 0.0,
            "machine_state": None,
            "planner_state": None,
            "raw_status": [],
        }

        for line in lines:
            info["raw_status"].append(line)
            try:
                data = json.loads(line)
            except Exception:
                continue

            # Extract current positions
            if "sr" in data:  # status report
                sr = data["sr"]
                info["machine_state"] = sr.get("stat")
                info["planner_state"] = sr.get("pstat")
                if "posx" in sr: info["x"] = sr["posx"]
                if "posy" in sr: info["y"] = sr["posy"]
                if "posz" in sr: info["z"] = sr["posz"]
                if "posa" in sr: info["a"] = sr["posa"]
                if "feedrate" in sr: info["feedrate"] = sr["feedrate"]

        request.app.state.factory.machines['m1'].objects['toolend'].position = {'x':info['x'], 'y': info['y'], 'z': info['z'], 'a': info['a']}
        return info

    except Exception as e:
        logging.error(f"LitePlacer get_info error: {e}")
        return {"error": str(e)}


# --- Move gantry ---
class MoveXYZRequest(BaseModel):
    x: float
    y: float
    z: float
    a: float
    speed: float  # mm/min

@router.post("/goto")
def goto(req: MoveXYZRequest, request: Request):
    gcode = f"G1 X{req.x} Y{req.y} Z{req.z} A{req.a} F{req.speed}\n"
    if not connection or not connection.is_open:
        sim("G90")
        return sim(gcode)

    try:
        tinyg_send(TinyGCommand(command="G90"))
        connection.write(gcode.encode())
        logging.info(f"Sent G-code: {gcode.strip()}")
        te = request.app.state.factory.machines['m1'].objects['toolend']
        te.location = {"x": req.x, "y": req.y, "z": req.z, "a": req.a}
        te.speed = req.speed
        return {
            "status": "ok",
            "target": {"x": req.x, "y": req.y, "z": req.z, "a": req.a, "speed": req.speed}
        }

    except Exception as e:
        logging.error(f"LitePlacer move_xyz error: {e}")
        return {"error": str(e)}


@router.post("/step")
def step(req: MoveXYZRequest):
    """ step relative to current position """
    gcode = f"G1 X{req.x} Y{req.y} Z{req.z} A{req.a} F{req.speed}\n"
    if not connection or not connection.is_open:
        sim("G91")
        return sim(gcode)

    try:
        tinyg_send(TinyGCommand(command="G91"))
        # g0 = max speed, g1 = controlled speed
        connection.write(gcode.encode())
        logging.info(f"Sent G-code: {gcode.strip()}")

        return {
            "status": "ok",
            "target": {"x": req.x, "y": req.y, "z": req.z, "a": req.a, "speed": req.speed}
        }
    except Exception as e:
        logging.error(f"LitePlacer move_xyz error: {e}")
        return {"error": str(e)}

class UnlockRequest(BaseModel):
    time_s: float  # seconds to unlock

@router.post("/unlock")
def unlock(req: UnlockRequest):
    tinyg_send(TinyGCommand(command="M8"))
    time.sleep(req.time_s)
    tinyg_send(TinyGCommand(command="M9"))
    time.sleep(1)
    return {"status": "completed"}