from fastapi import APIRouter, Request
import requests
import threading
import logging
import time
import serial
from pydantic import BaseModel


router = APIRouter()

# ============================================================
# SHARED STATUS PARSER
# ============================================================

def parse_status(raw: str):
    if not raw:
        return {}

    keys = [
        "Active ID:",
        "Position:",
        "Device Mode:",
        "Voltage:",
        "Load:",
        "Speed:",
        "Temper:",
        "Speed Set:",
        "ID to Set:",
        "Mode:",
        "Torque"
    ]
    numeric_keys = ["Position", "Voltage", "Load", "Speed", "Temper", "Speed Set"]

    status = {}
    text = raw.replace("<p>", " ")

    for key in keys:
        if key not in text:
            continue

        start = text.find(key) + len(key)
        end = len(text)
        for next_key in keys:
            if next_key == key:
                continue
            idx = text.find(next_key, start)
            if idx != -1:
                end = min(end, idx)

        value = text[start:end].strip()
        clean_key = key.replace(":", "").replace(" ", "_").lower()

        try:
            status[clean_key] = float(value) if key.replace(":", "") in numeric_keys else value
        except:
            status[clean_key] = value

    return status


# ============================================================
# BASE CLASS (LOGIC ONLY)
# ============================================================

class ST3020Base:
    def __init__(self):
        self.status = {}

    def select_id(self, servo_index):
        return self.send_command(0, servo_index)

    def set_mode(self, mode):
        mode_case = 12 if mode == "servo" else 13
        return self.send_command(1, mode_case)

    def connect(self, servo_index=1, mode="motor"):
        try:
            self.select_id(servo_index)
            time.sleep(0.1)
            self.set_mode(mode)
            time.sleep(0.1)
            self.status = self.get_status() or {}
            return True
        except Exception as e:
            logging.error(f"Connect failed: {e}")
            return False

    # MUST be implemented by subclasses
    def send_command(self, *args, **kwargs):
        raise NotImplementedError

    def get_status(self):
        raise NotImplementedError


# ============================================================
# WIFI IMPLEMENTATION
# ============================================================

class ST3020WiFi(ST3020Base):
    def __init__(self, ip="192.168.4.1"):
        super().__init__()
        self.ip = ip

    def send_command(self, arg0, arg1, arg2=0, arg3=0):
        r = requests.get(
            f"http://{self.ip}/cmd",
            params={"arg0": arg0, "arg1": arg1, "arg2": arg2, "arg3": arg3},
            timeout=2
        )
        r.raise_for_status()
        return r.text

    def get_status(self):
        r = requests.get(f"http://{self.ip}/readSTS", timeout=2)
        self.status = parse_status(r.text)
        return self.status


# ============================================================
# SERIAL IMPLEMENTATION
# ============================================================

class ST3020Serial(ST3020Base):
    def __init__(self, port="COM4", baud=115200):
        super().__init__()
        self.port = port
        self.baud = baud
        self.ser = None

    def connect(self, servo_index=1, mode="motor"):
        self.ser = serial.Serial(self.port, self.baud, timeout=0.5)
        time.sleep(2)  # ESP32 reset
        return super().connect(servo_index, mode)

    def send_command(self, arg0, arg1, arg2=0, arg3=0):
        if not self.ser or not self.ser.is_open:
            raise RuntimeError("Serial not connected")

        cmd = f"C:{arg0},{arg1},{arg2},{arg3}\n"
        self.ser.write(cmd.encode())
        self.ser.flush()

    def get_status(self):
        if not self.ser or not self.ser.is_open:
            return {}

        self.ser.reset_input_buffer()
        self.ser.write(b"STATUS\n")
        time.sleep(0.2)

        raw = ""
        while self.ser.in_waiting:
            raw += self.ser.read(self.ser.in_waiting).decode(errors="ignore")

        self.status = parse_status(raw)
        return self.status


# ============================================================
# ACTIVE SERVO (CHOSEN AT RUNTIME)
# ============================================================

servo: ST3020Base | None = None


@router.post("/connect")
async def connect(req: Request):
    global servo
    body = await req.json()

    # method = body.get("method", "wifi")  # "wifi" or "serial"
    method = "serial"

    if method == "wifi":
        servo = ST3020WiFi(ip=body.get("ip", "192.168.4.1"))
    elif method == "serial":
        servo = ST3020Serial(
            port=body.get("port", "COM4"),
            baud=body.get("baud", 115200)
        )
    else:
        return {"connected": False, "error": "Invalid method"}

    connected = servo.connect(
        servo_index=body.get("servo_index", 1),
        mode=body.get("mode", "motor")
    )

    return {
        "connected": connected,
        "method": method,
        "status": servo.get_status()
    }


# ============================================================
# CONTROL ENDPOINTS
# ============================================================

def run_motor_for(duration_s: float, command: int):
    """
    Run motor command for duration, then stop.
    """
    try:
        servo.send_command(1, command)
        time.sleep(duration_s)
        servo.send_command(1, 2)  # stop
    except Exception as e:
        logging.error(f"Motor run failed: {e}")


class GripperCommand(BaseModel):
    time_s: float = 2.0
    speed: int = 1000


@router.post("/gripper_open")
def gripper_open(cmd: GripperCommand):
    print('gripper_open()')
    threading.Thread(
        target=run_motor_for,
        args=(cmd.time_s, 1),
        daemon=True
    ).start()

    return {
        "ok": True,
        "action": "open",
        "time_s": cmd.time_s,
        "speed": cmd.speed
    }


@router.post("/gripper_close")
def gripper_close(cmd: GripperCommand):
    threading.Thread(
        target=run_motor_for,
        args=(cmd.time_s, 6),
        daemon=True
    ).start()

    return {
        "ok": True,
        "action": "close",
        "time_s": cmd.time_s,
        "speed": cmd.speed
    }


@router.post("/speed_up")
def speed_up():
    servo.send_command(1, 7)
    return {"ok": True}


@router.post("/speed_down")
def speed_down():
    servo.send_command(1, 8)
    return {"ok": True}


@router.get("/get_status")
def get_status():
    return servo.get_status() if servo else {}
