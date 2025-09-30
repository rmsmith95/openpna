// pages/api/arm6dof/move_joint.js
export default async function handler(req, res) {
  console.log("Received request to /api/arm6dof/move_joint", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { joint, direction, delta, speed } = req.body;

  // Validate inputs
  if (
    typeof joint !== "number" ||
    !["left", "right"].includes(direction) ||
    typeof delta !== "number" ||
    typeof speed !== "number"
  ) {
    return res.status(400).json({
      status: "error",
      message: "Invalid input: joint must be number, direction 'left'|'right', delta and speed numbers",
    });
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/cobot280/move_joint", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ joint, direction, delta, speed }),
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
