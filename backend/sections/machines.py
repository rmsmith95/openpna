from typing import List, Tuple
import numpy as np

from utils import Pose
from part import Part
from effectors import GripperEE, ScrewEE, EE


class LinearActuator:
    def __init__(self, size: Tuple[int, int, int], pose: Pose, id: int):
        self.size = size
        self.pose = pose
        self.id = id

    def __repr__(self):
        return f"LinearActuator(id={self.id}, size={self.size}, pose={self.pose})"


class CartesianRobot:
    def __init__(self, name: str, max_load: float, footprint: Tuple[int, int]):
        self.name = name
        self.max_load = max_load
        self.footprint = footprint

        # Workspace setup
        self.size = (600, 400, 400)
        self.offset = (10, 10, 10)
        self.pose = Pose(0, 0, 0, 0, 0, 0)
        self.occupancy = np.zeros((60, 40, 40), dtype=int)

        # Objects in workspace
        self.objects: List[Part] = []

        # End effector setup
        self.ee_joint = Pose(0, 0, 0, 0, 0, 0)
        self.ee: EE | None = None
        self.ee_dict = {
            "gripper1": GripperEE("gripper1"),
            "screw1": ScrewEE("screw1"),
        }

        # Linear actuators
        self.x_la = LinearActuator((0, 50, 0), Pose(0, -50, 400), -1)
        self.y_la = LinearActuator((0, 50, 0), Pose(0, 0, 350), -2)
        self.z_la = LinearActuator((0, 50, 0), Pose(50, 0, 0), -3)

    def __repr__(self):
        return f"CartesianRobot(name={self.name}, pose={self.pose}, ee={self.ee})"

    # --- Occupancy & object management ---
    def occupancy_calc(self):
        pcs = self.objects + [self.x_la, self.y_la, self.z_la, self.ee]
        for part in filter(None, pcs):
            sx, sy, sz = (max(1, s // 10) for s in part.size)
            for x in range(sx):
                for y in range(sy):
                    for z in range(sz):
                        xi, yi, zi = part.pose.x + x, part.pose.y + y, part.pose.z + z
                        if (
                            0 <= xi < self.occupancy.shape[0]
                            and 0 <= yi < self.occupancy.shape[1]
                            and 0 <= zi < self.occupancy.shape[2]
                        ):
                            self.occupancy[xi, yi, zi] = part.id

    def add_parts(self, parts: List[Part]):
        self.objects.extend(parts)

    # --- Movement ---
    def move(self, pose: Pose) -> bool:
        """Move robot to target pose."""
        print(f"{self.name} moving to {pose}")
        self.pose = pose

        if self.ee:
            self.ee.pose = pose + self.ee_joint
            if self.ee.part:
                self.ee.part.pose = self.ee.pose + self.ee.grip_offset
        return True

    # --- End effector handling ---
    def attach_ee(self, ee: EE) -> bool:
        if self.ee and self.ee.name != ee.name:
            print(f"{self.name} detaching {self.ee}")
            self.ee.parent = None
        print(f"{self.name} attaching {ee}")
        self.ee = ee
        self.ee.pose = self.pose + self.ee_joint
        self.ee.parent = self.name
        return True

    # --- Part handling ---
    def attach_part(self, part: Part) -> bool:
        if not self.ee:
            print(f"{self.name}: No EE to attach part")
            return False
        print(f"{self.name} attaching {part} with {self.ee}")
        self.ee.part = part
        part.pose = self.ee.pose + self.ee.grip_offset
        return True

    def detach_part(self) -> bool:
        if not self.ee:
            return False
        print(f"{self.name} detaching part from {self.ee}")
        self.ee.part = None
        return True

    # --- Assembly ---
    def attach_part_to_assembly(
        self,
        assembly: Part,
        part: Part,
        assembly_if: List[int],
        part_if: List[int],
        attach_dict: dict,
    ) -> bool:
        assembly.connections.append({"if": assembly_if, "name": part.name, "part_if": part_if})
        part.connections.append({"if": part_if, "name": assembly.name, "part_if": assembly_if})

        print(f"{self.name} assembling {part} to {assembly} with {attach_dict}")
        part.pose = self.ee.pose + self.ee.grip_offset if self.ee else part.pose
        self.detach_part()
        return True

    def create_actions(
        self,
        assembly: Part,
        part: Part,
        assembly_if: List[int],
        part_if: List[int],
        attach_dict: dict,
    ):
        print(f"\nAdding {part} to {assembly}")
        self.move(part.pose)
        self.attach_part(part)
        self.move(assembly.pose)
        self.attach_part_to_assembly(assembly, part, assembly_if, part_if, attach_dict)
