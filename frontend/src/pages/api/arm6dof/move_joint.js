export default async function handler(req, res) {
  console.log("📨 Received request to /api/arm6dof/move_joint", req.body);

  // --- Only allow POST ---
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const { joint, direction, delta = 5, speed = 50 } = req.body;

  // --- Validate inputs ---
  if (
    typeof joint !== "number" ||
    !["left", "right"].includes(direction) ||
    typeof delta !== "number" ||
    typeof speed !== "number"
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid input: joint must be a number, direction must be 'left' or 'right', delta and speed must be numbers",
    });
  }

  try {
    // Forward request to your FastAPI backend
    const apiUrl = "http://127.0.0.1:8000/cobot280/move_joint";
    const payload = { joint, direction, delta, speed };

    console.log("➡️ Forwarding to FastAPI:", apiUrl, payload);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    console.log("✅ FastAPI response:", data);

    // --- Pass response back to frontend ---
    if (response.ok) {
      res.status(200).json({
        status: "ok",
        ...data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: data?.error || data?.message || "Cobot backend error",
      });
    }
  } catch (err) {
    console.error("❌ Error forwarding to FastAPI:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Network or backend connection error",
    });
  }
}
