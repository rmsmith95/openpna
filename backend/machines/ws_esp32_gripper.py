import time
from fastapi import APIRouter
import requests
import threading


# --- CONFIG ---
PORT = "COM4"          # Change to your Arduino’s serial port
router = APIRouter()


class ST3020Servo:
    """
    requests.get("http://192.168.4.1/cmd",params={"arg0": 1, "arg1": 2, "arg2": 0, "arg3": 0}, timeout=2) 
    """
    def __init__(self, ssid="ESP32_DEV", password="12345678", ip="192.168.4.1"):
        self.ssid = ssid
        self.password = password
        self.ip = ip

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
            r = requests.get(url, params=params, timeout=2)
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
        if not status:
            print("Cannot read speed")
            return

        # Extract current speed
        current = 0
        try:
            for line in status.splitlines():
                if "Speed Set:" in line:
                    current = int(line.split("Speed Set:")[1])
                    break
        except:
            print("Failed to parse speed")
            return

        if target_speed == current:
            return

        case = 7 if target_speed > current else 8
        while current != target_speed:
            self.send_command(1, case)
            time.sleep(0.1)
            current += 100 if case == 7 else -100
            # clamp
            if (case == 7 and current > target_speed) or (case == 8 and current < target_speed):
                current = target_speed

    def get_status(self):
        """Get current servo status from /readSTS"""
        url = f"http://{self.ip}/readSTS"
        try:
            r = requests.get(url, timeout=2)
            r.raise_for_status()
            return r.text
        except requests.RequestException as e:
            print("Error reading status:", e)
            return None


# --- SETUP SERVO ---
servo = ST3020Servo()
servo.select_id(1)
servo.set_mode("motor")


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
    raw = servo.get_status()
    if not raw:
        return {}
    return parse_status(raw)
