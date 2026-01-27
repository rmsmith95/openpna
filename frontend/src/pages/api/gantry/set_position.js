// pages/api/gantry/set_position.js
export default async function handler(req, res) {
  console.log("Received request to /api/gantry/set_position", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { x, y, z, a } = req.body;

  // Validate inputs
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof z !== "number" ||
    typeof a !== "number"
  ) {
    return res.status(400).json({
      status: "error",
      message: "x, y, z, and a must all be numbers",
    });
  }

  console.log("Forwarding to gantry:", { x, y, z, a });

  try {
    const response = await fetch("http://127.0.0.1:8000/gantry/set_position", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, z, a }),
    });

    const data = await response.json();
    console.log("FastAPI response:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
