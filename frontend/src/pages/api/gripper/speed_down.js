// pages/api/gripper/speed_down.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    // Forward the command to FastAPI
    const response = await fetch(
      "http://127.0.0.1:8000/gripper/speed_down",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }),
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
