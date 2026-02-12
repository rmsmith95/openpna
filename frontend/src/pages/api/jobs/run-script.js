// pages/api/jobs/run_script.js
export default async function handler(req, res) {
  console.log("Received request to /api/jobs/run-script", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { target } = req.body;
  try {
    const response = await fetch("http://127.0.0.1:8000/jobs/run_script", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target }),
    });

    const data = await response.json();
    console.log("FastAPI response:", data);

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
