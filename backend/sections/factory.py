from typing import List, Dict
from aabb import AABB, plan_path
import logging

class Factory:
    """
    Represents a factory workspace with machines, parts and jobs.
    Provides methods to add them to the factory
    """

    def __init__(self):
        self.machines: Dict[str, dict] = {}
        self.parts: Dict[str, dict] = {}
        self.jobs: Dict[str, dict] = {}
    
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

    def update_jobs(self, job_id, job):
        self.jobs[job_id] = job
    
    def run_job(self, job_id):
        """machine with effector will move part to target part"""
        job = self.jobs[job_id]
        machine_name = job['machine']
        machine = self.machines[machine_name]
        part_name = job['part']
        part = self.parts[part_name]
        target_name = job['target']
        target_part = self.parts[target_name]

        # skip
        # 1a. check machine effector
        #       If wrong one, detach current effector
        #       Attach correct effector

        # 1b. Calculate Get part
        #       If no part move to part
        #       Attach part
        self.plot_path(machine, part)

        # 1c. Calculate Move part to target
        # 
        # 1d. Calculate detach part from ee to target
        #  
        # 2a. Move to get part
        # machine.goto(part['position'])
        # 
        # 2b. Move to target part
        # machine.goto(target_part['position'])
        # 
        # 2c. Detach part to targetcalculate interference
        # machine.attach(part, target_part)   
