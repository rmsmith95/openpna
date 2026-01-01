import socket
import logging
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import json

router = APIRouter()

# --- Models ---
class ConnectRequest(BaseModel):
    ip: str = '10.163.187.60'
    port: int = 8000
    timeout: float = 3.0  # seconds

class SetAnglesRequest(BaseModel):
    angles: List[float]
    speed: int = 50
    ip: str       # Pi IP
    port: int = 8000  # optional override

# --- Helper to send command to Pi ---
def send_command_to_pi(cmd: dict, ip: str, port: int, timeout: float = 3.0):
    print(f'cmd: {cmd}, ip: {ip}:{port}')
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

# --- Test connection endpoint ---
@router.post("/connect_network")
def connect_network(req: ConnectRequest):
    test_cmd = {"command": "get_position"}
    return send_command_to_pi(test_cmd, req.ip, req.port, req.timeout)

# --- Set angles ---
@router.post("/set_angles")
def set_angles(req: SetAnglesRequest):
    if len(req.angles) != 6:
        return {"status": "error", "message": "'angles' must be a list of 6 values"}
    cmd = {"command": "set_angles", "angles": req.angles, "speed": req.speed}
    return send_command_to_pi(cmd, req.ip, req.port)

# --- Get current joint angles ---
class GetPositionRequest(BaseModel):
    ip: str
    port: int = 8000

@router.post("/get_position")
def get_position(req: GetPositionRequest):
    cmd = {"command": "get_position"}
    values =  send_command_to_pi(cmd, req.ip, req.port)
    print(values)
    return values
