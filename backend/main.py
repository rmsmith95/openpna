import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from machines.liteplacer import router as liteplacer_router
from machines.cobot280 import router as cobot280_router
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
    print(f"factory has {len(factory.jobs)} jobs")
    print(f"factory has {len(factory.parts)} parts")
    print(f"factory has {len(factory.machines)} machines")
    logging.info(f"factory1 loaded: {factory}")
    return {"status": "Factory initialized"}

@app.get("/factory_status")
def factory_status():
    global factory
    return {"factory_initialized": factory is not None}

# --- Parts ---

@app.get("/get_parts")
def get_parts():
    """
    Return all parts as a dict: partId -> part
    """
    global factory
    return factory.parts

# --- Jobs ---

@app.get("/get_jobs")
def get_jobs():
    """
    Return all jobs as a dict: jobId -> job
    """
    global factory
    return factory.jobs

# --- Machines ---

@app.get("/get_machines")
def get_machines():
    """
    Return all machines as a dict: machineId -> machine
    """
    global factory
    return factory.machines

# --- Run Job ---

@app.get("/run_job")
def run_job(job_id: str):
    global factory
    factory.run_job(job_id)
    return {"status": "ok"}
