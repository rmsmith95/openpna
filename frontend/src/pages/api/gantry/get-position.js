// pages/api/gantry/get_position.js
export default async function handler(req, res) {
  console.log("Received request to /api/gantry/get_position");

  if (req.method !== "GET") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/liteplacer/get_position", {
      method: "GET",
      headers: { "Content-Type": "application/json" },
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
