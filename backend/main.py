import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from machines.tinyg import router as tinyg_router
from machines.cobot280 import router as cobot280_router
from machines.gripper import router as gripper_router
from machines.arduino import router as arduino_router
from sections.factory import Factory

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

app.include_router(tinyg_router, prefix="/tinyg")
app.include_router(cobot280_router, prefix="/cobot280")
app.include_router(gripper_router, prefix="/gripper")
app.include_router(arduino_router, prefix="/arduino")

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
    factory = Factory().load_factory('examples/factory1.json')
    app.state.factory = factory 
    print(f"factory has {len(factory.jobs)} jobs")
    print(f"factory has {len(factory.parts)} parts")
    print(f"factory has {len(factory.machines)} machines")
    logging.info(f"factory1 loaded: {factory}")
    return {"status": "Factory initialized"}

@app.get("/factory_status")
def factory_status():
    return {"factory_initialized": app.state.factory is not None}

# --- Parts ---

@app.get("/get_parts")
def get_parts():
    """ Return all parts as a dict: partId -> part """
    return app.state.factory.parts

# --- Jobs ---
class UpdateJobRequest(BaseModel):
    job_id: str
    job: dict

@app.post("/update_job")
def update_job(req: UpdateJobRequest):
    job_id = app.state.factory.update_job(req.job_id, req.job)
    return {"status": "ok", "job_id": job_id}

class DeleteJobRequest(BaseModel):
    job_id: str

@app.post("/delete_job")
def delete_job(req: DeleteJobRequest):
    deleted = app.state.factory.delete_job(req.job_id)
    return {"status": "ok", "deleted": deleted}
    

@app.get("/get_jobs")
def get_jobs():
    """Return all jobs as a dict: jobId -> job"""
    return app.state.factory.jobs

@app.get("/get_machines")
def get_machines():
    """Return all machines as a dict: machineId -> machine"""
    return app.state.factory.machines

@app.get("/get_tools")
def get_tools():
    """Return all tools as a dict: toolId -> tool"""
    return app.state.factory.tools

# --- Run Job ---

@app.get("/run_job")
def run_job(job_id: str):
    app.state.factory.run_job(job_id)
    return {"status": "ok"}
