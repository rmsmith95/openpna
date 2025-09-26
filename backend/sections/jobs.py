from typing import List, Optional
from .utils import Pose
from .part import Part
from .machines import Machine


class Job:
    """Represents a single job/task in the factory."""

    def __init__(
        self,
        name: str,
        job_type: str,
        machines: List[Machine],
        parts: List[Part],
        source_pose: Optional[Pose] = None,
        target_pose: Optional[Pose] = None,
        action_params: Optional[dict] = None,
    ):
        self.name = name
        self.job_type = job_type  # e.g., "move", "assemble", "screw", "solder"
        self.machines = machines
        self.parts = parts
        self.source_pose = source_pose
        self.target_pose = target_pose
        self.action_params = action_params or {}
        self.completed = False

    def execute(self):
        """Execute the job using the assigned machines."""
        print(f"Executing job '{self.name}' of type '{self.job_type}'")

        if self.job_type == "move":
            # Single machine move
            for machine in self.machines:
                if self.parts and self.source_pose and self.target_pose:
                    # attach part to machine
                    machine.attach_part(self.parts[0])
                    machine.move(self.target_pose)
                    machine.detach_part()

        elif self.job_type in ["assemble", "screw", "solder"]:
            # Assembly task
            for machine in self.machines:
                # For simplicity, assume first part is assembly, second is component
                assembly = self.parts[0]
                part = self.parts[1]
                assembly_if = self.action_params.get("assembly_if", [])
                part_if = self.action_params.get("part_if", [])
                attach_dict = self.action_params.get("attach_dict", {})
                machine.attach_part_to_assembly(assembly, part, assembly_if, part_if, attach_dict)

        else:
            raise ValueError(f"Unknown job type '{self.job_type}'")

        self.completed = True
        print(f"Job '{self.name}' completed.")
