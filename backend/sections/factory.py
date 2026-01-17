from typing import List, Dict
from aabb import AABB, plan_path
import logging
import json


class Factory:
    """
    Represents a factory workspace with machines, parts and jobs.
    Provides methods to add them to the factory
    """

    def __init__(self):
        self.machines: Dict[str, dict] = {}
        self.parts: Dict[str, dict] = {}
        self.jobs: Dict[str, dict] = {}
        self._job_counter = 0
        self.tools: Dict[str, dict] = {}
        self.save_file = ""

    def load_factory(self, file):
        self.save_file = file
        with open(file, "r") as f:
            data = json.load(f)
        
        self.machines = data.get("machines", {})
        self.parts = data.get("parts", {})
        self.tools = data.get("tools", {})
        self.jobs = data.get("jobs", {})
        self._job_counter = len(self.jobs)
        return self

    def save_factory(self):
        if not self.save_file:
            raise RuntimeError("Factory save_file not set")

        data = {
            "machines": self.machines,
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
            job_id = self._job_counter
            job["id"] = f"J{job_id}"
        self.jobs[job_id] = job
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
