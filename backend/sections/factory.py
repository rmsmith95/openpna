from typing import List, Dict
from aabb import AABB, plan_path
import logging
import json
from machines.gantry import Gantry
from machines.cobot280 import Cobot280
from machines.gripper import ST3020Gripper
from machines.arduino import Arduino


class Factory:
    """
    Represents a factory workspace with machines, parts and jobs.
    Provides methods to add them to the factory
    """

    def __init__(self):
        self.machines = {'gantry': Gantry(), 'cobot280': Cobot280(), 'gripper': ST3020Gripper(), 'arduino': Arduino()}
        self.parts: Dict[str, dict] = {}
        self.jobs: Dict[str, dict] = {}
        self._job_counter = 0
        self.tools: Dict[str, dict] = {}
        self.save_file = ""

    def load_factory(self, file):
        self.save_file = file
        with open(file, "r") as f:
            data = json.load(f)
        
        machines = data.get("machines", {})
        gantry = machines['gantry']
        self.machines = {'gantry': Gantry(), 'cobot280': Cobot280(), 'gripper': ST3020Gripper(), 'arduino': Arduino()}
        self.machines['gantry'].holders = gantry['holders']
        self.machines['gantry'].locations = gantry['locations']
        self.machines['gantry'].toolend = gantry['toolend']
        self.parts = data.get("parts", {})
        self.tools = data.get("tools", {})
        self.jobs = data.get("jobs", {})
        self._job_counter = len(self.jobs)
        return self

    def save_factory(self):
        if not self.save_file:
            raise RuntimeError("Factory save_file not set")

        data = {
            "machines": {
                'gantry': {
                    'pose': self.machines['cobot280'].pose, 
                    'objects': self.machines['gantry'].objects
                    },
                'cobot280': {'pose': self.machines['cobot280'].pose},
                'gripper': {},
                'arduino': {},
            },
            "parts": self.parts,
            "tools": self.tools,
            "jobs": self.jobs,
        }

        with open(self.save_file, "w") as f:
            json.dump(data, f, indent=2)


    def plot_path(self, machine, target_part):
        workspace = machine['bounds']  # ((0, 300), (0, 200))  # XY bounds

        obstacles = []
        for part in self.parts.values():
            aabb = AABB(part['bounds'])  # (50, 40, 0, 120, 160, 40)
            obstacles.append(aabb)
        
        start = machine['location']  # (10, 10, 0)
        goal = target_part['location']  # (260, 150, 5)
        path = plan_path(start, goal, obstacles, workspace, safe_z=60, step=10, radius=5)
        print("Planned path:")
        for p in path:
            print(p)
        pass

    def update_job(self, job_id, job):
        # Assign new ID if missing
        if not job_id or job_id == "" or job_id == '':
            self._job_counter += 1
            job["id"] = f"J{self._job_counter}"
        self.jobs[job["id"]] = job
        self.save_factory()
        return job_id
    
    def delete_job(self, job_id: str) -> bool:
        if job_id in self.jobs:
            del self.jobs[job_id]
            self.save_factory()
            return True
        self.save_factory()
        return False
    
    def run_job(self, job_id):
        """machine with effector will move part to target part"""
        job = self.jobs[job_id]
        machine_name = job['machine']
        machine = self.machines[machine_name]
        part_name = job['part']
        part = self.parts[part_name]
        target_name = job['target']
        target_part = self.parts[target_name]

        self.plot_path(machine, part)
