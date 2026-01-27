// pages/api/gantry/goto.js
export default async function handler(req, res) {
  console.log("Received request to /api/gantry/goto", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { x, y, z, a, speed } = req.body;

  // Validate inputs
  if (
    typeof x !== "number" ||
    typeof y !== "number" ||
    typeof z !== "number" ||
    typeof a !== "number" ||
    typeof speed !== "number" ||
    [x, y, z, a, speed].some((v) => Number.isNaN(v))
  ) {
    return res.status(400).json({
      status: "error",
      message: "x, y, z, a and speed must all be numbers",
    });
  }

  console.log("gantry goto:", { x, y, z, a, speed });
  try {
    const response = await fetch("http://127.0.0.1:8000/gantry/goto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ x, y, z, a, speed }),
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
