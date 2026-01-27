export default async function handler(req, res) {
  console.log("📨 Received request to /api/cobot280/set_angles", req.body);
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { angles, speed = 50 } = req.body;

  if (!Array.isArray(angles) || angles.length !== 6) {
    return res.status(400).json({ error: "angles must be an array of 6 numbers" });
  }

  try {
    const backendRes = await fetch("http://127.0.0.1:8000/cobot280/set_angles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ angles, speed }),
    });

    const data = await backendRes.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
