from typing import List, Dict
from machines import CartesianRobot, Robot
from part import Part, Pose
import logging
# import FreeCad or your simulator
# from freecad import FreeCad


class Factory:
    """
    Represents a factory workspace with robots and parts.
    Provides methods to add robots and parts, and query robots by group.
    """

    def __init__(self):
        self.robots: Dict[str, Robot] = {}
        self.parts: Dict[str, Part] = {}
        # self.floor = None  # Optional grid for occupancy
        # self.sim = FreeCad()  # Optional simulator

    # --- Robot management ---
    def add_robot(self, robot: Robot, pose: Pose) -> bool:
        logging.info(f"Adding robot {robot.name} at {pose}")
        robot.pose = pose
        self.robots[robot.name] = robot
        return True

    def get_robots_in_group(self, group_id: str) -> List[Robot]:
        """
        Return all robots that belong to a given group.
        """
        return [robot for robot in self.robots.values() if hasattr(robot, "groups") and group_id in robot.groups]

    # --- Part management ---
    def add_part(self, part: Part, pose: Pose) -> bool:
        logging.info(f"Adding part {part.name} at {pose}")
        # TODO: check if the space at pose is available before adding
        part.pose = pose
        self.parts[part.name] = part
        return True

    # Optional: floor/grid management can be added later
    # def reset_floor(self, x: int, y: int):
    #     self.floor = np.zeros([x, y])
