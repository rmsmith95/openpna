from sections.utils import Connection
import logging
import time
import serial


class Arduino:
    def __init__(self):
        pass

    def connect(self, method, ip, port, com, baud, timeout=3):
        self.connection = Connection(method, ip, port, com, baud, timeout)
        logging.warning(f'{self.connection}')
        if self.connection.serial is not None and self.connection.serial.is_open:
            self.connection.serial.close()

        self.connection = serial.Serial(com, baud, timeout=timeout)
        logging.info(f"Connected to TinyG on {com}")
        return {"status": "connected", "com": com, "baud": baud}


    def screw(self, command: str, duration: float = 0.5, speed: float = 100):
        if not self.is_connected():
            raise RuntimeError("TinyG not connected")

        self.connection.reset_input_buffer()
        self.connection.write((command + "\n").encode())

        lines = []
        while self.connection.in_waiting:
            lines.append(
                self.connection.readline().decode(errors="ignore").strip()
            )
        return lines
