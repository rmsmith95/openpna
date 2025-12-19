# backend/machines/tool_changer.py
import serial
import time
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()
arduino = None  # global persistent serial object

class ConnectRequest(BaseModel):
    port: str
    baud: int = 9600

@router.post("/connect")
def connect(req: ConnectRequest):
    global arduino
    try:
        if arduino is None or not arduino.is_open:
            arduino = serial.Serial(req.port, req.baud, timeout=1)
            time.sleep(2)
        return {"status": "connected", "port": req.port}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to connect: {e}")

def send_cmd(cmd: str):
    if arduino is None or not arduino.is_open:
        raise HTTPException(status_code=400, detail="Arduino not connected")
    arduino.write((cmd + "\n").encode())
    time.sleep(0.05)


class UnlockRequest(BaseModel):
    time_s: float  # seconds to unlock


@router.post("/unlock")
def unlock(req: UnlockRequest):
    send_cmd("ON")
    time.sleep(req.time_s)
    send_cmd("OFF")
    time.sleep(1)
    return {"status": "completed"}
