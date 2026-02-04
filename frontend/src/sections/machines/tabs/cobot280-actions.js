export const fetchPositions = async () => {
  try {
    const res = await fetch("/api/cobot280/get_position"); // Next.js API route
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (data.status === "ok" && Array.isArray(data.angles)) {
      return data.angles.map(Number); // ensure numbers
    } else {
      console.warn("Unexpected data from backend:", data);
      return null;
    }
  } catch (err) {
    console.error("❌ Error fetching joint positions:", err);
    return null;
  }
};


export const moveJoint = async (jointIndex, deltaValue, speed) => {
  try {
    const response = await fetch("/api/cobot280/set_angle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({jointIndex, deltaValue, speed}),
    });

    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    const data = await response.json();
    console.log("✅ SetAngle response:", data);

    if (data.status === "ok" || data.status === "sent") {
      // fetch updated positions from backend to avoid drift
      fetchPositions();
    }
  } catch (err) {
    console.error("❌ Error setting angles:", err);
  }
};

export const moveJoints = async (gotoJoints, speed) => {
  try {
    const response = await fetch("/api/cobot280/set_angles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        angles: gotoJoints,
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