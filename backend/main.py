import logging
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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

# Paths to XML files
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
JOBS_FILE = os.path.join(BASE_DIR, "jobs.xml")
PARTS_FILE = os.path.join(BASE_DIR, "parts.xml")
MACHINES_FILE = os.path.join(BASE_DIR, "machines.xml")

# In-memory storage
jobs_data = None
parts_data = None
machines_data = None


@app.on_event("startup")
def load_xml_files():
    global jobs_data, parts_data, machines_data
    jobs_data = parse_xml_file(JOBS_FILE)
    parts_data = parse_xml_file(PARTS_FILE)
    machines_data = parse_xml_file(MACHINES_FILE)
    logging.info("XML files loaded")


@app.get("/")
def read_root():
    logging.info("OpenPnA backend running!")
    return {"message": "OpenPnA backend running!"}


@app.get("/jobs")
def list_jobs():
    return jobs_data


@app.get("/parts")
def list_parts():
    return parts_data


@app.get("/machines")
def list_machines():
    return machines_data


@app.get("/run_job")
def run_job():
    logging.info("===== Initialise Factory and Robots =====")
    
    # Create a factory instance
    factory = Factory()

    # Create robots
    xyz_robot = create_robot_set_1(factory)

    # Create drone parts and add them to factory
    parts = create_drone1_assembly_parts(factory)
    xyz_robot.add_parts(parts)

    # Attach end effector and move robot to initial pose
    xyz_robot.attach_ee(xyz_robot.ee_dict['gripper1'])
    xyz_robot.move(Pose(30, 0, 0))

    logging.info(f"Robot {xyz_robot.name} ready with EE {xyz_robot.ee}")

    return {"jobs": jobs_data, "status": "Job initialized"}
