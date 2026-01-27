// pages/api/gantry/unlock.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { time_s } = req.body;

  try {
    const response = await fetch("http://127.0.0.1:8000/gantry/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_s }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Backend error:", data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
