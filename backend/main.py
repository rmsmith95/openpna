import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import threading
from .machines.liteplacer import router as liteplacer_router
from .machines.cobot280 import router as cobot280_router
# from parse_xml import parse_xml_file
from .sections.utils import Pose
from .sections.factory import Factory
from .examples.factory1 import get_factory1

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
    
    factory = get_factory1()
    logging.info(f"factory1 loaded: {factory}")

    return {"status": "Factory initialized"}

@app.get("/factory_status")
def factory_status():
    global factory
    return {"factory_initialized": factory is not None}