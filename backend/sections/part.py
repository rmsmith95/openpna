from typing import List, Dict, Optional
import logging
from utils import Pose, Interface


logger = logging.getLogger(__name__)


class Part:
    """Factory part with connections, interfaces, and pose information."""

    _id_counter = 0

    def __init__(self, name: str, mass: float, interfaces: List[Interface],
                 file: str = "", size: Optional[tuple] = None):
        self.id = Part._id_counter
        Part._id_counter += 1

        self.name = name
        self.mass = mass
        self.file = file
        self.size = size

        self.pose = Pose(0, 0, 0, 0, 0, 0)   # absolute pose, or relative if parented
        self.parent_id: Optional[int] = None

        self.connections: List[Dict] = []
        self.interfaces: Dict[int, Interface] = {
            n: iface for n, iface in enumerate(interfaces)
        }

        logger.info(f"Created Part {self.name} (id={self.id}) at {self.pose}")

    def __str__(self):
        return self.name

    def __repr__(self):
        return f"Part(id={self.id}, name={self.name}, mass={self.mass}, pose={self.pose})"

    def add_connection(self, other: "Part", self_if: int, other_if: int):
        """Connect this part to another part via interfaces."""
        self.connections.append({
            "if": self_if,
            "name": other.name,
            "part_if": other_if,
        })
        other.connections.append({
            "if": other_if,
            "name": self.name,
            "part_if": self_if,
        })
        logger.debug(f"Connected {self} (if {self_if}) <-> {other} (if {other_if})")
