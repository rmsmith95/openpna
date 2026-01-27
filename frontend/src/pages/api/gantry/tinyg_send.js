// pages/api/gantry/move.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const { command } = req.body || {}; // get command from frontend

    if (!command) {
      return res.status(400).json({ status: "error", message: "Missing command" });
    }

    // Forward the command to FastAPI
    const response = await fetch("http://127.0.0.1:8000/gantry/tinyg_send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }), // send the actual command
    });

    const data = await response.json();
    console.log("FastAPI response:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
