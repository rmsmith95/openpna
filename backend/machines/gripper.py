from fastapi import APIRouter
from fastapi import Request
import requests
import threading
import logging
import time


# --- CONFIG ---
router = APIRouter()


class ST3020Servo:
    """ arg2 = 1, 2, 7, 8
requests.get("http://192.168.4.1/cmd",params={"arg0": 1, "arg1": 2, "arg2": 0, "arg3": 0}, timeout=2) 
r=requests.get("http://192.168.4.1/readSTS")
# r.raise_for_status()
r.text
    """
    def __init__(self, ssid="ESP32_DEV", password="12345678", ip="192.168.4.1"):
        self.ssid = ssid
        self.password = password
        self.ip = ip
        self.status	= {}

    def connect(self, servo_index=1, mode="motor", retries=2, delay=1.0):
        """
        Connect to the servo, select ID and set mode.
        Retries if it fails.
        Returns True if successful, False otherwise.
        """
        for attempt in range(1, retries + 1):
            try:
                print(f"Attempt {attempt} to connect to servo...")
                self.select_id(servo_index)
                time.sleep(0.2)

                self.set_mode(mode)
                time.sleep(0.2)

                status = self.get_status()
                logging.warning(f"status:{status}")
                current_mode = status.get("mode", "").strip().lower()
                if current_mode == mode.lower():
                    print(f"Servo connected. Mode: {current_mode}")
                    return True
                else:
                    print(f"Mode not set yet: {current_mode}")
            except Exception as e:
                print("Connect attempt error:", e)

            time.sleep(delay)

        print("Failed to connect to servo after retries.")
        return False

    def send_command(self, cmd_type, cmd_value, extra1=0, extra2=0):
        """Send a command to the ESP32 via HTTP GET."""
        url = f"http://{self.ip}/cmd"
        params = {
            "arg0": cmd_type,
            "arg1": cmd_value,
            "arg2": extra1,
            "arg3": extra2
        }
        try:
            r = requests.get(url, params=params, timeout=5)
            r.raise_for_status()
            return r.text
        except requests.RequestException as e:
            print("Error sending command:", e)
            return None

    def select_id(self, servo_index):
        """Select active servo by index (arg0=0)."""
        return self.send_command(0, servo_index)

    def set_mode(self, mode):
        """Set mode: 'servo' or 'motor'"""
        mode_case = 12 if mode == "servo" else 13  # 12=servo, 13=motor
        return self.send_command(1, mode_case)

    def set_speed(self, target_speed):
        """Set speed (steps/sec) by stepping +100/-100 until target"""
        # Read current speed
        status = self.get_status()
        print("status:", status)
        speed = status['set_speed']
        if not speed:
            print("Cannot read speed")
            return

        if target_speed == speed:
            return

        case = 7 if target_speed > speed else 8
        # while speed != target_speed:
        self.send_command(1, case)
        time.sleep(0.1)

    def get_status(self):
        url = f"http://{self.ip}/readSTS"
        try:
            r = requests.get(url, timeout=2)
            raw = r.text
            parsed = parse_status(raw)
            self.status = parsed
            return parsed
        except requests.RequestException as e:
            print("Error reading status:", e)
            return {}


# --- SETUP SERVO ---
servo = ST3020Servo()


@router.post("/connect")
async def connect(req: Request):
    """ Connect to the servo gripper """
    body = await req.json()
    servo_index = body.get("servo_index", 1)
    success = servo.connect(servo_index=servo_index, mode='motor', retries=0, delay=1)
    status = servo.get_status()
    return {"connected": success, "status": status}


@router.post("/set_speed")
def set_speed(speed):
    # print("Set speed: ", speed)
    result = servo.send_command(1, 7)
    return result


@router.post("/speed_up")
def speed_up():
    result = servo.send_command(1, 7)
    return result


@router.post("/speed_down")
def speed_down():
    result = servo.send_command(1, 8)
    return result


def run_motor_for(duration, command):
    """Run motor for duration (s), then stop"""
    servo.send_command(1, command)
    time.sleep(duration)
    servo.send_command(1, 2)


# --- STATUS PARSER ---
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

    status_dict = {}
    text = raw.replace("<p>", " ")

    for i, key in enumerate(keys):
        start = text.find(key)
        if start == -1:
            continue

        end = len(text)
        for j in range(i + 1, len(keys)):
            next_idx = text.find(keys[j], start + len(key))
            if next_idx != -1:
                end = next_idx
                break

        value = text[start + len(key):end].strip()
        clean_key = key.replace(":", "").replace(" ", "_").lower()
        if key.split(":")[0] in numeric_keys:
            try:
                status_dict[clean_key] = float(value)
            except:
                status_dict[clean_key] = value
        else:
            status_dict[clean_key] = value

        # Remove parsed section
        text = text[:start] + text[end:]

    return status_dict


@router.post("/gripper_open")
def open_gripper(time_s: float = 2, speed: int = 1000):
    # servo.set_speed(speed)
    threading.Thread(target=run_motor_for, args=(time_s, 1), daemon=True).start()
    return {"status": "ok", "action": "open", "time_s": time_s, "speed": speed}


@router.post("/gripper_close")
def close_gripper(time_s: float = 2, speed: int = 1000):
    # servo.set_speed(speed)
    threading.Thread(target=run_motor_for, args=(time_s, 6), daemon=True).start()
    return {"status": "ok", "action": "close", "time_s": time_s, "speed": speed}


# --- STATUS ENDPOINT ---
@router.get("/get_status")
def get_status():
    """Return cleaned servo status as JSON"""
    status = servo.get_status()
    return status
