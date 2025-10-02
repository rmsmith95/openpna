from typing import List
from sections.factory import Factory
from sections.utils import Pose
import logging


def get_factory1() -> Factory:
    """
    Initialize the factory, add machines, parts, and jobs.
    Returns the fully prepared Factory instance.
    """

    machines = {
        "m1": {"name": "LitePlacer1", "size": [21,22,23], "dimensions": [], "effector": "", "cad": "/home/liteplacer.stl"}
        }

    initial_parts = {
        "p1": {"name": "Body", "class": "part", "mass": 0.3, "description": "3d printed", "cad": "/home/body.stl", "assembly_id": False },
        "p2": {"name": "Body Jig", "class": "jig", "mass": 0.3, "description": "3d printed", "cad": "/home/body_jig.stl", "assembly_id": False },
        "p3": {"name": "Arm1", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False },
        "p4": {"name": "Arm2", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False },
        "p5": {"name": "Arm3", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False },
        "p6": {"name": "Arm4", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False },
        "p7": {"name": "Motor1", "class": "part", "mass": 0.3, "description": "EMax", "cad": "/home/motor.stl", "assembly_id": False },
        "p8": {"name": "Electric Speed Controller", "class": "part", "mass": 0.3, "description": "SpeedyBee", "cad": "/home/esc.stl", "assembly_id": False },
        "p9": {"name": "Flight Controller", "class": "part", "mass": 0.3, "description": "SpeedyBee", "cad": "/home/fc.stl", "assembly_id": False },
    }

    initial_jobs = {
        "j1": {"part": "Body", "target": "Body Jig", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j2": {"part": "Arm1", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j3": {"part": "Arm2", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j4": {"part": "Arm3", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j5": {"part": "Arm4", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j6": {"part": "Electric Speed Controller", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j7": {"part": "Flight Controller", "target": "Electric Speed Controller", "machines": "LitePlacer1", "status": "To Do", "description": "" },
    }

    logging.info("Initializing factory")
    factory = Factory()
    factory.machines = machines
    factory.parts = initial_parts
    factory.jobs = initial_jobs
    return factory
