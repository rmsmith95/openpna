from typing import List, Dict
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
    
    def run_job(self, job_id):
        job = self.jobs[job_id]
        machine_name = job['machine']
        machine = self.machines[machine_name]
        part_name = job['part']
        part = self.parts[part_name]
        target_name = job['target']
        target_part = self.parts[target_name]

        # move machine to position of part. calculate interference
        # goto(machine, part['position'])
    

