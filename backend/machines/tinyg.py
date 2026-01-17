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
def connect(connect: ConnectRequest, request: Request):
    global connection
    try:
        # Close existing connection if open
        if connection and connection.is_open:
            try:
                connection.close()
                logging.info("Closed previous TinyG connection")
            except Exception as e:
                logging.warning(f"Failed to close previous connection: {e}")

        # Open new connection
        connection = serial.Serial(connect.port, connect.baud, timeout=1)
        logging.info(f"Connected to TinyG on {connect.port} at {connect.baud} baud")

        # --- Set positions in TinyG from factory JSON ---
        pos = request.app.state.factory.machines['gantry']['objects']['toolend']['position']
        gcode = f"G92 X{pos['x']} Y{pos['y']} Z{pos['z']} A{pos['a']}"
        try:
            cmd = TinyGCommand(command=gcode)
            tinyg_send(cmd)
            logging.info(f"Set TinyG toolend position to {pos}")
        except Exception as e:
            logging.error(f"Failed to set TinyG toolend position: {e}")

        return {"status": "connected", "device": "gantry"}

    except Exception as e:
        logging.error(f"Failed to connect: {e}")
        connection = None
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
        return {"error": "Gantry not connected"}
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
        return {
            "connected": False,
            "x": 0, 
            "y": 0,
            "z": 0,
            "a": 0,
            "feedrate": 0,
            "velocity": 0,
            "machine_state": None,
        }

    try:
        connection.reset_input_buffer()
        connection.write(b"?\n")

        lines = []
        timeout = time.time() + 1.0
        while time.time() < timeout:
            while connection.in_waiting:
                line = connection.readline().decode(errors="ignore").strip()
                if line:
                    lines.append(line)
            if lines:
                break
            time.sleep(0.01)

        logging.info("tinyg getinfo: %s", lines)

        info = {
            "connected": True,
            "x": 0.0, 
            "y": 0.0, 
            "z": 0.0, 
            "a": 0.0,
            "feedrate": 0.0,
            "velocity": 0.0,
            "machine_state": None,
        }

        for line in lines:
            if line.startswith("X position"):
                info["x"] = float(re.findall(r"[-\d.]+", line)[0])
            elif line.startswith("Y position"):
                info["y"] = float(re.findall(r"[-\d.]+", line)[0])
            elif line.startswith("Z position"):
                info["z"] = float(re.findall(r"[-\d.]+", line)[0])
            elif line.startswith("A position"):
                info["a"] = float(re.findall(r"[-\d.]+", line)[0])
            elif line.startswith("Feed rate"):
                info["feedrate"] = float(re.findall(r"[-\d.]+", line)[0])
            elif line.startswith("Velocity"):
                info["velocity"] = float(re.findall(r"[-\d.]+", line)[0])
            elif line.startswith("Machine state"):
                info["machine_state"] = line.split(":", 1)[1].strip()

        request.app.state.factory.machines['gantry']['objects']['toolend']['position'] = \
            {"x": info["x"], "y": info["y"], "z": info["z"], "a": info["a"]}
        request.app.state.factory.machines['gantry']['objects']['toolend']['speed'] = info['velocity']
        request.app.state.factory.save_factory()
        return info

    except Exception as e:
        logging.error("get_info error: %s", e, exc_info=True)
        return {
            "connected": False,
            "error": str(e)
        }


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
        # te = request.app.state.factory.machines['gantry']['objects']['toolend']
        # te['position'] = {"x": req.x, "y": req.y, "z": req.z, "a": req.a}
        # te.speed = req.speed
        return {
            "status": "ok",
            "target": {"x": req.x, "y": req.y, "z": req.z, "a": req.a, "speed": req.speed}
        }

    except Exception as e:
        logging.error(f"TinyG move_xyz error: {e}")
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
        logging.error(f"TinyG move_xyz error: {e}")
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