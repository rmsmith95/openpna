// pages/api/gripper/connect.js
export default async function handler(req, res) {
  console.log("Received request to /api/gripper/connect", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { method, com, baud, ip, port, } = req.body;

  try {
    const response = await fetch("http://127.0.0.1:8000/gripper/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, com, baud, ip, port }),
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