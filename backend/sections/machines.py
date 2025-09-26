from typing import List, Tuple
from .utils import Pose
from .part import Part
from .effectors import EE
import numpy as np


class Machine:
    """Base class for all machines (robots, gantries, etc.)"""

    def __init__(self, name: str, pose: Pose = None):
        self.name = name
        self.pose: Pose = pose or Pose(0, 0, 0, 0, 0, 0)
        self.ee: EE | None = None
        self.objects: List[Part] = []


class LitePlacer(Machine):
    def __init__(self, name: str, footprint: Tuple[int, int]):
        super().__init__(name)
        self.footprint = footprint

    # --- Movement ---
    def move(self, pose: Pose) -> bool:
        return True

    # --- End effector handling ---
    def attach_ee(self, ee: EE) -> bool:
        return True

    # --- Part handling ---
    def attach_part(self, part: Part) -> bool:
        return True

    def detach_part(self) -> bool:
        return True


class Cobot280(Machine):
    def __init__(self, name: str, footprint: Tuple[int, int]):
        super().__init__(name)
        self.footprint = footprint

    # --- Movement ---
    def move(self, pose: Pose) -> bool:
        return True

    # --- End effector handling ---
    def attach_ee(self, ee: EE) -> bool:
        return True

    # --- Part handling ---
    def attach_part(self, part: Part) -> bool:
        return True

    def detach_part(self) -> bool:
        return True
