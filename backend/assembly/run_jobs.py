def run_jobs(jobs_list, machines_dict):
    """
    jobs_list: list of dicts like
        {"machine": "machine1", "end_effector": "gripper", "from_pose": "A", "to_pose": "B", "speed": "3mm/s"}
    machines_dict: dict of Machine instances by name
    """
    for job in jobs_list:
        machine_name = job["machine"]
        effector = job["end_effector"]
        from_pose = job["from_pose"]
        to_pose = job["to_pose"]
        speed = job.get("speed", "default")

        machine = machines_dict.get(machine_name)
        if not machine:
            print(f"Machine {machine_name} not found, skipping job")
            continue

        # Ensure correct end effector
        machine.attach_end_effector(effector)

        # Move machine
        machine.move(from_pose, to_pose, speed)