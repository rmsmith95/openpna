from typing import List, Dict
from .machines import Machine
from .part import Part, Pose
from .jobs import Job
import logging

class Factory:
    """
    Represents a factory workspace with machines, parts and jobs.
    Provides methods to add them to the factory
    """

    def __init__(self):
        self.machines: Dict[str, Machine] = {}
        self.parts: Dict[str, Part] = {}
        self.jobs: Dict[str, Job] = {}

    # --- Machine management ---
    def load_machine(self, machine: Machine, pose: Pose) -> bool:
        logging.info(f"Adding {machine.name} at {pose}")
        machine.pose = pose
        self.machines[machine.name] = machine
        return True

    # --- Part management ---
    def load_parts(self, parts: List[Part], poses: List[Pose]) -> bool:
        if len(parts) != len(poses):
            logging.error("Parts and poses lists must be the same length")
            return False
        for part, pose in zip(parts, poses):
            logging.info(f"Adding part {part.name} at {pose}")
            part.pose = pose
            self.parts[part.name] = part
        return True
    
    def load_jobs(self, jobs: List[Job]) -> bool:
        for job in jobs:
            logging.info(f"Loading job {job.name}")
            self.jobs[job.name] = job
        return True
