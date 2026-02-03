import requests
import threading
import time
import logging
from sections.utils import Connection
logging.basicConfig(level=logging.INFO)

# ============================================================
# STATUS PARSER
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
        except Exception:
            status[clean_key] = value

    return status


# ============================================================
# SINGLE GRIPPER CLASS
# ============================================================

class ST3020Gripper:
    def __init__(self):
        self.connection = Connection()
        self.status = {}
        self.servo_id = None

    def connect(self, method, ip, port, com, baud, timeout=10 ):
        self.connection = Connection(method, ip, port, com, baud, timeout)
        logging.warning(f'{self.connection}')
        if self.connection.serial is not None and self.connection.serial.is_open:
            self.connection.serial.close()
        
        try:
            self.select_id(1)
            time.sleep(0.1)
            self.set_mode("motor")
            time.sleep(0.1)

            for _ in range(5):
                if self.get_status():
                    self.connected = True
                    break
                time.sleep(0.2)
            return self.connected

        except Exception as e:
            logging.error(f"Connect failed: {e}")
            self.connected = False
            return False
        

    def is_connected(self) -> bool:
        if self.connection:
            return self.connection.connected
            # self.connection.connected = self.connection.serial is not None and self.connection.serial.is_open
            # return self.connection.connected
        return False
    
    def send_command(self, arg0, arg1, arg2=0, arg3=0):
        r = requests.get(
            f"http://{self.connection.ip}/cmd",
            params={"arg0": arg0, "arg1": arg1, "arg2": arg2, "arg3": arg3},
            timeout=2
        )
        r.raise_for_status()
        return r.text

    def get_status(self):
        if not self.connection or self.connection.ip == '':
            return {'status': False}
        r = requests.get(f"http://{self.connection.ip}/readSTS", timeout=2)
        self.status = parse_status(r.text)
        return self.status

    def select_id(self, servo_id: int):
        self.servo_id = servo_id
        self.send_command(0, servo_id)

    def set_mode(self, mode: str):
        cmd = 12 if mode == "servo" else 13
        self.send_command(1, cmd)

    def _run_motor_for(self, duration_s: float, command: int):
        try:
            self.send_command(1, command)
            time.sleep(duration_s)
            self.send_command(1, 2)  # stop
        except Exception as e:
            logging.error(f"Motor run failed: {e}")

    def open(self, time_s: float):
        threading.Thread(
            target=self._run_motor_for,
            args=(time_s, 1),
            daemon=True
        ).start()

    def close(self, time_s: float):
        threading.Thread(
            target=self._run_motor_for,
            args=(time_s, 6),
            daemon=True
        ).start()

    # -------------------------
    # SPEED
    # -------------------------
    def speed_up(self):
        self.send_command(1, 7)

    def speed_down(self):
        self.send_command(1, 8)

    def set_speed(self, speed: int):
        self.send_command(1, 4)


