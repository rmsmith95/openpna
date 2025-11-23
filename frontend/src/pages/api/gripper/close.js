// pages/api/gripper/close_gripper.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const { time, speed } = req.body || {}; // get time and speed from frontend

    if (time === undefined || speed === undefined) {
      return res.status(400).json({ status: "error", message: "Missing time or speed" });
    }

    // Forward the command to FastAPI
    const response = await fetch(
      "http://127.0.0.1:8000/ws_esp32_gripper/gripper_close",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time, speed }), // send time and speed to FastAPI
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
