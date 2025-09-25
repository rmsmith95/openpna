import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import serial
import threading
from liteplacer import router as liteplacer_router
from cobot280 import router as cobot280_router
from parse_xml import parse_xml_file
from utils import Pose
from factory import Factory
from factory1 import create_robot_set_1, create_drone1_assembly_parts

logging.basicConfig(level=logging.INFO)

app = FastAPI()

# Allow React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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


@app.get("/run_job")
def run_job():
    logging.info("===== Initialise Factory and Robots =====")
    
    factory = Factory()
    xyz_robot = create_robot_set_1(factory)
    parts = create_drone1_assembly_parts(factory)
    xyz_robot.add_parts(parts)

    xyz_robot.attach_ee(xyz_robot.ee_dict['gripper1'])
    xyz_robot.move(Pose(30, 0, 0))

    logging.info(f"Robot {xyz_robot.name} ready with EE {xyz_robot.ee}")

    return {"jobs": jobs_data, "status": "Job initialized"}

