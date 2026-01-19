from fastapi import APIRouter, Request, HTTPException
from pydantic import BaseModel

router = APIRouter(tags=["gantry"])

# ============================================================
# API MODELS
# ============================================================

class ConnectRequest(BaseModel):
    com: str
    baud: int = 115200
    timeout: float = 1.0


class SetPositionRequest(BaseModel):
    x: float
    y: float
    z: float
    a: float


class MoveXYZRequest(BaseModel):
    x: float
    y: float
    z: float
    a: float
    speed: float  # mm/min


class UnlockRequest(BaseModel):
    time_s: float


class RawCommandRequest(BaseModel):
    command: str
    delay: float = 0.05


# ============================================================
# ROUTES
# ============================================================

@router.post("/connect")
def connect(req: ConnectRequest, request: Request):
    gantry = request.app.state.factory.machines['gantry']
    try:
        gantry.connect(req.servo_id, req.mode, req.ip, req.port, req.com, req.baud)
        return {"status": "connected", "device": "gantry"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/get_info")
def get_info(request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        return {"connected": False}

    try:
        info = gantry.get_info()
        return {
            "connected": True,
            **info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/set_position")
def set_position(req: SetPositionRequest, request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        raise HTTPException(400, "Gantry not connected")

    gantry.set_position(req.x, req.y, req.z, req.a)
    return {"status": "ok"}


@router.post("/goto")
def goto(req: MoveXYZRequest, request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        raise HTTPException(400, "Gantry not connected")

    gantry.goto(req.x, req.y, req.z, req.a, req.speed)
    return {
        "status": "ok",
        "target": req.dict()
    }


@router.post("/step")
def step(req: MoveXYZRequest, request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        raise HTTPException(400, "Gantry not connected")

    gantry.step(req.x, req.y, req.z, req.a, req.speed)
    return {
        "status": "ok",
        "delta": req.dict()
    }


@router.post("/unlock")
def unlock(req: UnlockRequest, request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        raise HTTPException(400, "Gantry not connected")

    gantry.unlock(req.time_s)
    return {"status": "completed"}


@router.post("/send")
def send_raw(req: RawCommandRequest, request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        raise HTTPException(400, "Gantry not connected")

    response = gantry.send(req.command, req.delay)
    return {
        "status": "ok",
        "response": response
    }


@router.post("/reset")
def reset(request: Request):
    gantry = request.app.state.factory.machines['gantry']
    if not gantry:
        raise HTTPException(400, "Gantry not connected")

    gantry.reset()
    return {"status": "ok"}
