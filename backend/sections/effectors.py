from .utils import Pose
from typing import Optional, Tuple


class EE:
    """Base class for an End Effector."""

    def __init__(self, name: str,
                 size: Tuple[int, int, int] = (10, 10, 10),
                 grip_offset: Optional[Pose] = None):
        self.name = name
        self.parent: Optional[str] = None   # name of parent robot
        self.part = None                    # part currently held
        self.pose = Pose(0, 0, 0, 0, 0, 0)
        self.grip_offset = grip_offset or Pose(0, 0, 0, 0, 0, 0)
        self.size = size
        self.weight: Optional[float] = None
        self.dimensions: Optional[Tuple[float, float, float]] = None

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"EE(name={self.name}, parent={self.parent}, part={self.part})"

    # You could later expand these if you want explicit handling:
    # def attach_part(self, part): ...
    # def detach_part(self): ...


class GripperEE(EE):
    """A simple gripping end effector."""

    def __init__(self, name: str, force_max: Optional[float] = None):
        super().__init__(name)
        self.force_max = force_max

    def __repr__(self):
        return f"GripperEE(name={self.name}, force_max={self.force_max})"


class ScrewEE(EE):
    """End effector for screwing/fastening."""

    def __init__(self, name: str, torque_max: Optional[float] = None):
        super().__init__(name)
        self.torque_max = torque_max

    def __repr__(self):
        return f"ScrewEE(name={self.name}, torque_max={self.torque_max})"
