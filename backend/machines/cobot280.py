import socket
import logging
import json
from typing import List
from sections.utils import Connection, Pose


class Cobot280:
    def __init__(self):
        self.connection = Connection()
        self.pose = None
        pass

    def send_command_to_pi(self, cmd: dict, ip: str, port: int, timeout: float = 3.0):
        """ Sends a JSON command to the Pi over TCP and returns the JSON response. """
        print(f"Sending command to Pi: {cmd} @ {ip}:{port}")
        try:
            with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
                s.settimeout(timeout)
                s.connect((ip, port))
                s.sendall((json.dumps(cmd) + "\n").encode())

                resp = s.recv(1024).decode().strip()
                return json.loads(resp)

        except Exception as e:
            logging.error(f"Failed to send command to Pi ({ip}:{port}): {e}")
            return {"status": "error", "message": str(e)}

    def connect_network(self, ip: str, port: int, timeout: float = 3.0):
        """ Test connection by requesting current positions. """
        cmd = {"command": "get_position"}
        return self.send_command_to_pi(cmd, ip, port, timeout)

    def get_position(self, ip: str, port: int, timeout: float = 3.0) -> List[float]:
        """ Returns current joint positions as a list of 6 floats. """
        cmd = {"command": "get_position"}
        resp = self.send_command_to_pi(cmd, ip, port, timeout)
        if resp.get("status") == "ok" and "angles" in resp:
            return resp["angles"]
        return []

    def set_angle(self, joint_index: int, delta_value: float, speed: float, ip: str, port: int):
        """ Increment a single joint by delta_value. """
        cmd = {
            "command": "set_angle",
            "jointIndex": joint_index,
            "deltaValue": delta_value,
            "speed": speed
        }
        return self.send_command_to_pi(cmd, ip, port)

    def set_angles(self, angles: List[float], speed: float, ip: str, port: int):
        """ Set all joints to the given angles. """
        if len(angles) != 6:
            return {"status": "error", "message": "'angles' must be a list of 6 values"}
        cmd = {
            "command": "set_angles",
            "angles": angles,
            "speed": speed
        }
        return self.send_command_to_pi(cmd, ip, port)

    def move_to(self, angles: List[float], speed: float, ip: str, port: int):
        """Alias for set_angles, for clarity. """
        return self.set_angles(angles, speed, ip, port)
