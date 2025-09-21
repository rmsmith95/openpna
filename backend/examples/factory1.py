from typing import List
import logging

from factory import Factory
from machines import CartesianRobot
from part import Part, Pose, Action, Interface
from effectors import GripperEE


def create_robot_set_1(factory: Factory) -> CartesianRobot:
    """
    Create a Cartesian robot and add it to the factory.
    Returns the main CartesianRobot instance.
    """
    cartesian_robot = CartesianRobot("cartesian_robot1", max_load=2.0, footprint=(80, 80))
    factory.add_robot(cartesian_robot, pose=Pose(30, 0, 0, 0, 0, 0))
    logging.info(f"Robot {cartesian_robot.name} added to factory at {cartesian_robot.pose}")
    return cartesian_robot


def create_drone1_assembly_parts(factory: Factory) -> List[Part]:
    """
    Create a sample quadcopter assembly (center frame + 4 arms)
    and add them to the factory.
    Returns the list of Part instances.
    """
    logging.info("Creating drone1 assembly parts")

    parts_folder = "C:/Users/RMSmi/Downloads/quadcopter"

    # Helper to create arm interfaces
    def make_arm_interface(yaw: float) -> Interface:
        actions = [Action(Pose(0, 0, 3), Pose(5, 5, 0))]
        return Interface("slotup", Pose(0, 0, 0, yaw=yaw), actions)

    # Create center frame with interfaces for 4 arms
    arm_interfaces = [make_arm_interface(yaw) for yaw in [0, 90, 180, 270]]
    center_frame = Part(
        "center_frame",
        mass=0.2,
        size=(96, 96, 40),
        file=f"{parts_folder}/Center_Frame.step",
        interfaces=arm_interfaces,
    )

    # Helper to create individual arms with "slotdown" interface
    def make_arm(name: str) -> Part:
        actions = [Action(Pose(0, 0, -3), Pose(0, 0, 0))]
        arm_if = Interface("slotdown", Pose(0, 0, 0), actions)
        return Part(
            name,
            mass=0.2,
            size=(115, 37, 40),
            file=f"{parts_folder}/Quad_Arm.step",
            interfaces=[arm_if],
        )

    arm1 = make_arm("arm1")
    arm2 = make_arm("arm2")
    arm3 = make_arm("arm3")
    arm4 = make_arm("arm4")

    # Add all parts to the factory at default pose
    for part in [center_frame, arm1, arm2, arm3, arm4]:
        factory.add_part(part, Pose(0, 0, 0, 0, 0, 0))
        logging.info(f"Part {part.name} added to factory at {part.pose}")

    logging.info("Drone1 assembly parts created successfully")
    return [center_frame, arm1, arm2, arm3, arm4]
