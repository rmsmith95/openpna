import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import threading
from machines.liteplacer import router as liteplacer_router
from machines.cobot280 import router as cobot280_router
# from parse_xml import parse_xml_file
from sections.utils import Pose
from sections.factory import Factory
from examples.factory1 import get_factory1

logging.basicConfig(level=logging.INFO)

app = FastAPI()
factory = None  

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(liteplacer_router, prefix="/liteplacer")
app.include_router(cobot280_router, prefix="/cobot280")

@app.get("/")
def read_root():
    logging.info("OpenPnA backend running!")
    return {"message": "OpenPnA backend running!"}

@app.get("/health")
def health():
    return {"status": "ok"}

@app.on_event("startup")
def startup():
    logging.info("===== Initialise Factory1 =====")
    global factory
    factory = get_factory1()
    logging.info(f"factory1 loaded: {factory}")

    return {"status": "Factory initialized"}

@app.get("/factory_status")
def factory_status():
    global factory
    return {"factory_initialized": factory is not None}

class PartRequest(BaseModel):
    search: str = ""
    limit: int = 25
    offset: int = 0
    showParts: bool = True
    showJigs: bool = True
    showAssemblies: bool = True

@app.post("/get_parts")
def get_parts(req: PartRequest):
    global factory
    if factory is None:
        return {}

    # Filter by search
    result = {k: v for k, v in factory.parts.items() if req.search.lower() in k.lower()}

    # Filter by visibility
    def is_visible(part):
        part_type = v.get("type", "part")  # assuming parts have a "type" field: "part", "jig", "assembly"
        if part_type == "part" and not req.showParts:
            return False
        if part_type == "jig" and not req.showJigs:
            return False
        if part_type == "assembly" and not req.showAssemblies:
            return False
        return True

    filtered = {k: v for k, v in result.items() if is_visible(v)}
    # Apply offset and limit
    start = req.offset
    end = req.offset + req.limit
    limited = dict(list(filtered.items())[start:end])
    return limited


class JobRequest(BaseModel):
    search: str = ""
    limit: int = 25
    offset: int = 0  # new field for pagination

@app.post("/get_jobs")
def get_jobs(req: JobRequest):
    # Filter jobs by search
    result = {k: v for k, v in factory.jobs.items() if req.search.lower() in k.lower()}
    # Apply offset and limit
    start = req.offset
    end = req.offset + req.limit
    limited = dict(list(result.items())[start:end])
    return limited

@app.get("/get_machines")
def get_machines():
    return factory.machines

@app.get("/run_job")
def get_machines(job_id):
    job = factory.jobs[job_id]
