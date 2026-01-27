export default async function handler(req, res) {
  console.log("📨 Received request to /api/cobot280/set_angle", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const { jointIndex, deltaValue, speed = 50 } = req.body;

  if ((!jointIndex) || (!deltaValue) || typeof speed !== "number") {
    return res.status(400).json({ status: "error", message: "Invalid input: must provide 'angles' as array of 1 numbers, speed as number", });
  }

  try {
    const backendRes = await fetch("http://127.0.0.1:8000/cobot280/set_angle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jointIndex, deltaValue, speed }),
    });

    const data = await backendRes.json();
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
