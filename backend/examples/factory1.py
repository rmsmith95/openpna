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
        "m1": {"name": "LitePlacer1", "workingArea": [600,400,100], "dimensions": [750,550,400], "effector": "", "cad": "/home/liteplacer.stl"}
        }
    
    tray_x, tray_y = [5,5]
    initial_parts = {
        "p1": {"id": "p1", "name": "Body", "class": "part", "mass": 0.3, "description": "3d printed", "cad": "/home/body.stl", "assembly_id": False, "bbox": [tray_x+5, tray_y+0, 120, 120], },
        "p2": {"id": "p2", "name": "Body Jig", "class": "jig", "mass": 0.3, "description": "3d printed", "cad": "/home/body_jig.stl", "assembly_id": False, "bbox": [tray_x+140, tray_y+0, 140, 140], },
        "p3": {"id": "p3", "name": "Arm1", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+140, 120, 60],  },
        "p4": {"id": "p4", "name": "Arm2", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+210, 150, 60],  },
        "p5": {"id": "p5", "name": "Arm3", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+70, tray_y+140, 150, 60],  },
        "p6": {"id": "p6", "name": "Arm4", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+70, tray_y+210, 150, 60],  },
        # "p7": {"id": "p7", "name": "Motor1", "class": "part", "mass": 0.3, "description": "EMax", "cad": "/home/motor.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+0, 150, 150],  },
        # "p8": {"id": "p8", "name": "Electric Speed Controller", "class": "part", "mass": 0.3, "description": "SpeedyBee", "cad": "/home/esc.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+0, 150, 150],  },
        # "p9": {"id": "p9", "name": "Flight Controller", "class": "part", "mass": 0.3, "description": "SpeedyBee", "cad": "/home/fc.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+0, 150, 150],  },
    }

    initial_jobs = {
        "j1": {"id": "j1", "part": "Body", "target": "Body Jig", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j2": {"id": "j2", "part": "Arm1", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j3": {"id": "j3", "part": "Arm2", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j4": {"id": "j4", "part": "Arm3", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j5": {"id": "j5", "part": "Arm4", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j6": {"id": "j6", "part": "Electric Speed Controller", "target": "Body", "machines": "LitePlacer1", "status": "To Do", "description": "" },
        "j7": {"id": "j7", "part": "Flight Controller", "target": "Electric Speed Controller", "machines": "LitePlacer1", "status": "To Do", "description": "" },
    }

    logging.info("Initializing factory")
    factory = Factory()
    factory.machines = machines
    factory.parts = initial_parts
    factory.jobs = initial_jobs
    return factory
