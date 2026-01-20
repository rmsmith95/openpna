import serial
import time
import logging
import re
from sections.utils import Connection, Pose


class Gantry:
    def __init__(self):
        self.connection = Connection()
        self.pose = None

    # -------------------------
    # CONNECTION
    # -------------------------
    def connect(self, method, ip, port, com, baud, timeout=3):
        logging.warning(f'{self.connection}')
        if self.connection.serial is not None and self.connection.serial.is_open:
            self.connection.serial.close()

        self.connection = serial.Serial(com, baud, timeout=timeout)
        logging.info(f"Connected to TinyG on {com}")
        return True

    def is_connected(self) -> bool:
        return self.connection is not None and self.connection.is_open

    # -------------------------
    # LOW LEVEL
    # -------------------------
    def send(self, command: str, delay: float = 0.05):
        if not self.is_connected():
            raise RuntimeError("TinyG not connected")

        self.connection.reset_input_buffer()
        self.connection.write((command + "\n").encode())
        time.sleep(delay)

        lines = []
        while self.connection.in_waiting:
            lines.append(
                self.connection.readline().decode(errors="ignore").strip()
            )

        return lines

    # -------------------------
    # POSITION / STATUS
    # -------------------------
    def get_info(self):
        lines = self.send("?")

        info = {
            "x": 0.0, "y": 0.0, "z": 0.0, "a": 0.0,
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

        return info

    # -------------------------
    # MOTION
    # -------------------------
    def set_position(self, x, y, z, a):
        return self.send(f"G92 X{x} Y{y} Z{z} A{a}")

    def goto(self, x, y, z, a, speed):
        self.send("G90")
        return self.send(f"G1 X{x} Y{y} Z{z} A{a} F{speed}")

    def step(self, x, y, z, a, speed):
        self.send("G91")
        return self.send(f"G1 X{x} Y{y} Z{z} A{a} F{speed}")

    def unlock(self, time_s: float):
        self.send("M8")
        time.sleep(time_s)
        self.send("M9")

    def reset(self):
        self.connection.write(b"\x18")
        time.sleep(0.2)
