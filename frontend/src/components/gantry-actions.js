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
    const position = { x: 0, y: 0, z: 0, a: 0 };

    if (Array.isArray(data.status)) {
      data.status.forEach((item) => {
        const raw = item.raw ?? JSON.stringify(item);
        let m;
        if ((m = raw.match(/X position:\s*([-0-9.]+)/))) position.x = parseFloat(m[1]);
        if ((m = raw.match(/Y position:\s*([-0-9.]+)/))) position.y = parseFloat(m[1]);
        if ((m = raw.match(/Z position:\s*([-0-9.]+)/))) position.z = parseFloat(m[1]);
        if ((m = raw.match(/A position:\s*([-0-9.]+)/))) position.a = parseFloat(m[1]);
      });
    }
    // console.log(data)
    return {data, position}
  } catch (err) {
    console.error("Error getting gantry position:", err);
  }
};

export async function handleUnlockToolChanger(time = 5) {
  await fetch("/api/tinyg/unlock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ time_s:time }),
  });
}
