import {
  screwIn,
  screwOut,
  stop
} from "./screwdriver-actions";


export const goto = async (req) => {
  console.log(req)
  const { x, y, z, a, speed} = req;
  try {
    const res = await fetch("/api/gantry/goto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, z, a, speed }),
    });
    console.log("GoTo response:", await res.json());
  } catch (err) {
    console.error("GoTo error:", err);
  }
};

export const stepMove = async (req) => {
  console.log(req)
  const { x, y, z, a, speed } = req;
  try {
    const res = await fetch("/api/gantry/step", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, z, a, speed }),
    });
    console.log("Step response:", await res.json());
  } catch (err) {
    console.error("Error moving gantry:", err);
  }
};

export const getInfo = async () => {
  try {
    const res = await fetch("/api/gantry/get_info");
    const data = await res.json();
    // console.log(data);
    const { x, y, z, a, feedrate, machine_state } = data;
    return { x, y, z, a, feedrate, machine_state, raw_status: data.raw_status };
  } catch (err) {
    console.error("Error getting TinyG info:", err);
    return null;
  }
};

export async function handleUnlockToolChanger(time = 5) {
  await fetch("/api/gantry/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s:time }),
  });
}

export async function screwdriverIn(threadPitch, depth, rotPs) {
  const rotations = depth / threadPitch // rotations needed to reach target depth
  const duration = rotations / rotPs // total time needed at given rotation speed

  // Run rotation and linear motion together. NOTE: assumes both start at the same time
  const speed = threadPitch * rotPs * 60
  const axisStep = { x: 0, y: 0, z: -depth, a: 0, speed: speed };
  await Promise.all([
    screwIn(duration, rotPs),
    stepMove(axisStep)
  ])
}

export async function screwdriverOut(threadPitch, depth, rotPs) {
  const rotations = depth / threadPitch // rotations needed to reach target depth
  const duration = rotations / rotPs // total time needed at given rotation speed

  // Run rotation and linear motion together. NOTE: assumes both start at the same time
  // speed in mm/min so rot/s * 60 = rot/min * threadPitch
  const speed = threadPitch * rotPs * 60
  const axisStep = { x: 0, y: 0, z: depth, a: 0, speed: speed };
  await Promise.all([
    screwIn(duration, rotPs),
    stepMove(axisStep)
  ])
}

export async function screwStop(threadPitch, depth, rotPs) {
  const rotations = depth / threadPitch // rotations needed to reach target depth
  const duration = rotations / rotPs // total time needed at given rotation speed

  // Run rotation and linear motion together. NOTE: assumes both start at the same time
  await Promise.all([
    screwdriverStop(),
  ])
}


export async function attach(req) {
  const { tool } = req;
  await fetch("/api/gantry/attach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool }),
  });
}


export async function detach(req) {
  const { holder } = req;
  await fetch("/api/gantry/detach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ holder }),
  });
}


export const editLocations = async (locations) => {
  console.log("sending locations:", locations);

  try {
    const res = await fetch("/api/gantry/edit_locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locations }),
    });

    const data = await res.json();
    console.log("editLocations:", data);
    return data;

  } catch (err) {
    console.error("Error editing locations:", err);
  }
};
