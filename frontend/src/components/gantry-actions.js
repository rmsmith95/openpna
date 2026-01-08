export const goto = async (req) => {
  console.log(req)
  const { x, y, z, a, speed} = req;
  try {
    const res = await fetch("/api/tinyg/goto", {
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
    const res = await fetch("/api/tinyg/step", {
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
    const res = await fetch("/api/tinyg/get_info");
    const data = await res.json();
    console.log(data);
    const { x, y, z, a, feedrate, machine_state } = data;
    return { x, y, z, a, feedrate, machine_state, raw_status: data.raw_status };
  } catch (err) {
    console.error("Error getting TinyG info:", err);
    return null;
  }
};

export async function handleUnlockToolChanger(time = 5) {
  await fetch("/api/tinyg/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s:time }),
  });
}
