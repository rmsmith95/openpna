from typing import List
from sections.factory import Factory
from sections.utils import Pose
import logging


def get_factory1() -> Factory:
    """
    Initialize the factory, add machines, parts, and jobs.
    Returns the fully prepared Factory instance.
    """
    
    tray_x, tray_y = [5,5]
    initial_parts = {
        "p11": {"id": "p11", "name": "Body", "class": "part", "mass": 0.3, "description": "3d printed", "cad": "/home/body.stl", "assembly_id": False, "bbox": [tray_x+5, tray_y+0, 120, 120], },
        "p12": {"id": "p12", "name": "Body Jig", "class": "jig", "mass": 0.3, "description": "3d printed", "cad": "/home/body_jig.stl", "assembly_id": False, "bbox": [tray_x+135, tray_y+0, 140, 140], },
        "p13": {"id": "p13", "name": "Arm1", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+5, tray_y+150, 120, 60],  },
        "p14": {"id": "p14", "name": "Arm2", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+5, tray_y+220, 120, 60],  },
        "p15": {"id": "p15", "name": "Arm3", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+135, tray_y+150, 120, 60],  },
        "p16": {"id": "p16", "name": "Arm4", "class": "part", "mass": 0.2, "description": "3d printed", "cad": "/home/arm.stl", "assembly_id": False, "bbox": [tray_x+135, tray_y+220, 120, 60],  },
        # "p7": {"id": "p7", "name": "Motor1", "class": "part", "mass": 0.3, "description": "EMax", "cad": "/home/motor.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+0, 150, 150],  },
        # "p8": {"id": "p8", "name": "Electric Speed Controller", "class": "part", "mass": 0.3, "description": "SpeedyBee", "cad": "/home/esc.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+0, 150, 150],  },
        # "p9": {"id": "p9", "name": "Flight Controller", "class": "part", "mass": 0.3, "description": "SpeedyBee", "cad": "/home/fc.stl", "assembly_id": False, "bbox": [tray_x+0, tray_y+0, 150, 150],  },
    }

        # initial_jobs = {
    #     "j1": {"id": "j1", "part": "Body", "target": "Body Jig", "machines": "Gantry", "status": "To Do", "description": "" },
    #     "j2": {"id": "j2", "part": "Arm1", "target": "Body", "machines": "Gantry", "status": "To Do", "description": "" },
    #     "j3": {"id": "j3", "part": "Arm2", "target": "Body", "machines": "Gantry", "status": "To Do", "description": "" },
    #     "j4": {"id": "j4", "part": "Arm3", "target": "Body", "machines": "Gantry", "status": "To Do", "description": "" },
    #     "j5": {"id": "j5", "part": "Arm4", "target": "Body", "machines": "Gantry", "status": "To Do", "description": "" },
    #     "j6": {"id": "j6", "part": "Electric Speed Controller", "target": "Body", "machines": "Gantry", "status": "To Do", "description": "" },
    #     "j7": {"id": "j7", "part": "Flight Controller", "target": "Electric Speed Controller", "machines": "Gantry", "status": "To Do", "description": "" },
    # }

    initial_jobs = {
        "j1": {"id": "j1", "machine": "gantry", "action": "step", "params": {"x": 1, "y": 0, "z": 0, "a":0, "speed": 2000}, "status": "To Do", "description": "" },
        "j2": {"id": "j2", "machine": "gantry", "action": "unlock", "params": {}, "status": "To Do", "description": "" },
    }

    tools = {
        "t1": {"id": "t1", "name": "Gripper", "class": "tool", "mass": 0.3, "description": "3d printed", "cad": "/home/gripper.stl", "assembly_id": False, "bbox": [215, 308, 75, 58],
            "work_offset": {"x": 0, "y":0, "z": 0, "a": 0}, "holder_offset": {"x": 0, "y":0, "z": 0, "a": 0},
            "location": {"x": 0, "y":0, "z": 0, "a": 0}, "machine": "gantry", "parent": "gantryend" },
        "t2": {"id": "t2", "name": "Screwdriver", "class": "tool", "mass": 0.3, "description": "3d printed", "cad": "/home/screwdriver.stl", "assembly_id": False, "bbox": [305, 308, 52, 52], 
            "work_offset": {"x": 0, "y":0, "z": 0, "a": 0}, "holder_offset": {"x": 0, "y":0, "z": 0, "a": 0},
            "location": {"x": 0, "y":0, "z": 0, "a": 0}, "machine": "gantry", "parent": "holder1" },
        }

    # work offset is offset from center of holding tube to center of work area (grip center or screw center)
    # holder offset is offset from center of holding tube to center of holding lip at the tip 
    gantry_locations = {
        "h1": {"id": "h1", "name": "holder1", "class": "holder", "mass": 0.3, "description": "3d printed", "cad": "/home/holder.stl", "assembly_id": False, "bbox": [205, 308, 150, 52], 
               "location": {"x": 5, "y":60, "z": 50, "a": 270},},
        "h2": {"id": "h2", "name": "holder2", "class": "holder", "mass": 0.3, "description": "3d printed", "cad": "/home/holder.stl", "assembly_id": False, "bbox": [205, 308, 150, 52], 
               "location": {"x": 5, "y":100, "z": 50, "a": 270},},
    }

    machines = {
        "m1": {"name": "gantry", "locations": gantry_locations, "workingArea": [600,400,100], "dimensions": [750,550,400], "effector": "", "cad": "/home/liteplacer.stl"},
        "m2": {"name": "cobot280", "locations": {}, "workingArea": [600,400,100], "dimensions": [750,550,400], "effector": "", "cad": "/home/cobot280.stl"}
    }

    logging.info("Initializing factory")
    factory = Factory()
    factory.machines = machines
    factory.tools = tools
    factory.parts = initial_parts
    factory.jobs = initial_jobs
    return factory
