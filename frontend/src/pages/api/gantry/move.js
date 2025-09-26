// pages/api/gantry/move.js
export default async function handler(req, res) {
  console.log("Received request to /api/gantry/move", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { x, y, z, speed } = req.body;

  // Validate inputs
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof z !== "number" ||
    typeof speed !== "number"
  ) {
    return res.status(400).json({
      status: "error",
      message: "x, y, z, and speed must all be numbers",
    });
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/liteplacer/move_xyz", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, z, speed }),
    });

    console.log("FastAPI response status:", response.status);
    const data = await response.json();
    console.log("FastAPI response body:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
