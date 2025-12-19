// pages/api/gripper/get_status.js

export default async function handler(req, res) {
  console.log("🟦 Next.js API hit: GET /api/gripper/get_status");

  if (req.method !== "GET") {
    console.log("❌ Wrong method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // console.log("➡️ Forwarding to FastAPI...");
    const response = await fetch("http://127.0.0.1:8000/gripper/get_status"); // GET by default
    const text = await response.json();  // or use response.json() if FastAPI returns JSON
    // console.log("⬅️ FastAPI returned:", text);
    res.status(200).json({ status: "ok", raw: text });

  } catch (err) {
    console.error("🔥 Next.js error calling FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
