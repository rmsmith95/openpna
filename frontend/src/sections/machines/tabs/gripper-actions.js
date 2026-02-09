export async function gripperGoTo(position=1000, load_limit=100, speed=1000) {
  await fetch("/api/gripper/gripper_goto", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ position, load_limit, speed }),
  });
}

export async function stepOpenGripper(time_s = 1, speed=1000) {
  await fetch("/api/gripper/gripper_open", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s, speed }),
  });
}

export async function stepCloseGripper(time_s = 1, speed=1000) {
  await fetch("/api/gripper/gripper_close", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s, speed }),
  });
}

export async function speedGripperUp () {
    await fetch("/api/gripper/speed_up", {
        method: "POST",
    });
}

export async function speedGripperDown () {
    await fetch("/api/gripper/speed_down", {
      method: "POST"
    });
}

export const setGripperSpeed = async (speed) => {
  await fetch("/api/gripper/set_speed", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ speed }),
  });
};
