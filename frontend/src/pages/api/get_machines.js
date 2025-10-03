// pages/api/get_machines.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const { } = req.body;
    console.log("search:", search)

    // Send POST to FastAPI with search string and hardcoded limit 25
    const response = await fetch("http://127.0.0.1:8000/get_machines", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const machines = await response.json();
    console.log("machines:", machines);

    return res.status(200).json({
      status: "ok",
      machines,
    });
  } catch (err) {
    console.error("Error fetching machines:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}
