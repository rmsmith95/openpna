// pages/api/gripper/set_speed.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const { speed } = req.body || {}; // get speed from frontend

    if (speed === undefined) {
      return res.status(400).json({ status: "error", message: "Missing speed" });
    }

    // Forward the command to FastAPI
    const response = await fetch(
      "http://127.0.0.1:8000/gripper/set_speed",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ speed }),
      }
    );

    const data = await response.json();
    console.log("FastAPI response:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
