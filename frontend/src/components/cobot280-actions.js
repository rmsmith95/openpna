export const fetchPositions = async () => {
  try {
    const res = await fetch("/api/cobot280/get_position", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ipAddress: ipAddress }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status === "ok" && Array.isArray(data.angles)) {
      setJoints(data.angles.map(Number)); // ensure numeric
    }
  } catch (err) {
    console.error("❌ Error fetching joint positions:", err);
  }
};

export const moveJoint = async (jointIndex, deltaValue) => {
  const newAngles = [...joints];
  newAngles[jointIndex] += deltaValue;
  await moveJoints(newAngles);
};

export const moveJoints = async (newAngles) => {
  try {
    const response = await fetch("/api/cobot280/set_angles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ipAddress: ipAddress,
        angles: newAngles,
        speed: speed,
      }),
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    console.log("✅ SetAngles response:", data);

    if (data.status === "ok" || data.status === "sent") {
      // fetch updated positions from backend to avoid drift
      fetchPositions();
    }
  } catch (err) {
    console.error("❌ Error setting angles:", err);
  }
};