from typing import List
from sections.factory import Factory
from sections.machines import Machine, LitePlacer, Cobot280
from sections.part import Part
from sections.jobs import Job
from sections.effectors import GripperEE
from sections.utils import Pose
import logging


def get_machines() -> List[Machine]:
    """
    Create a Cartesian robot and add it to the factory.
    Returns the main LitePlacer instance.
    """
    cartesian_robot = LitePlacer("LitePlacer1", max_load=2.0, footprint=(80, 80))
    return cartesian_robot


def get_parts() -> List[Part]:
    """
    Create a sample quadcopter assembly (center frame + 4 arms)
    and add them to the factory.
    Returns the list of Part instances.
    """
    
#     initialParts = [
#   { 'id': 'p1', name: 'Body', class: 'part', mass: '0.3', description: '3d printed', cad: '/home/body.stl', assembled: false },
#   { 'id': 'p2', name: 'Body Jig', class: 'jig', mass: '0.3', description: '3d printed', cad: '/home/body_jig.stl', assembled: false },
#   { id: 'p3', name: 'Arm1', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
#   { id: 'p4', name: 'Arm2', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
#   { id: 'p5', name: 'Arm3', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
#   { id: 'p6', name: 'Arm4', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
#   { id: 'p7', name: 'Motor1', class: 'part', mass: '0.3', description: 'EMax', cad: '/home/motor.stl', assembled: false },
#   { id: 'p8', name: 'Electric Speed Controller', class: 'part', mass: '0.3', description: 'SpeedyBee', cad: '/home/esc.stl', assembled: false },
#   { id: 'p9', name: 'Flight Controller', class: 'part', mass: '0.3', description: 'SpeedyBee', cad: '/home/fc.stl', assembled: false },
# ]
    body = Part('Body')
    body_jig = Part('Body Jig')
    arm1 = Part('Arm1')
    arm2 = Part('Arm2')
    arm3 = Part('Arm3')
    arm4 = Part('Arm4')
    motor1 = Part('Motor1')
    esc = Part('Electric Speed Controller')
    fc = Part('Flight Controller')
    return [body, body_jig, arm1, arm2, arm3, arm4, motor1, esc, fc]


def get_jobs() -> List[Job]:

#     initialJobs = [
#   { id: '1', part: 'Body', target: 'Body Jig', machines: 'LitePlacer1', status: 'To Do', description: '' },
#   { id: '2', part: 'Arm1', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
#   { id: '4', part: 'Arm2', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
#   { id: '3', part: 'Arm3', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
#   { id: '5', part: 'Arm4', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
#   { id: '6', part: 'Electric Speed Controller', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
#   { id: '7', part: 'Flight Controller', target: 'Electric Speed Controller', machines: 'LitePlacer1', status: 'To Do', description: '' },
# ]

    job = Job('Body', 'Body Jig', 'LitePlacer1')
    return [job]


def get_factory1() -> Factory:
    """
    Initialize the factory, add machines, parts, and jobs.
    Returns the fully prepared Factory instance.
    """
    logging.info("Initializing factory")
    factory = Factory()
    
    # Add machines
    liteplaer = LitePlacer("LitePlacer1", footprint=(80, 80))
    factory.load_machine(liteplaer, pose=Pose(30, 0, 0, 0, 0, 0))
    logging.info(f"Machine {liteplaer.name} added to factory at {liteplaer.pose}")
    
    # Add parts
    parts: List[Part] = []
    parts_folder = "C:/Users/RMSmi/Downloads/quadcopter"

    # Add jobs
    try:
        jobs = get_jobs()  # Assuming this returns a list of jobs
        factory.load_jobs(jobs)
        logging.info(f"{len(jobs)} jobs added to factory")
    except Exception as e:
        logging.warning(f"No jobs added: {e}")

    logging.info("Factory initialization complete")
    return factory
