// pages/api/gripper/connect.js
export default async function handler(req, res) {
  console.log("Received request to /api/gripper/connect", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { servo_id } = req.body;

  try {
    const response = await fetch("http://127.0.0.1:8000/gripper/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ servo_index: servo_id }),
    });

    const data = await response.json();

    // Return FastAPI connection status directly to frontend
    res.status(200).json({
      connected: data.connected,
      status: data.status || {},
    });
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ connected: false, status: {}, message: err.message });
  }
}
