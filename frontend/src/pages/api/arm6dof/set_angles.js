export default async function handler(req, res) {
  console.log("📨 Received request to /api/arm6dof/set_angles", req.body);

  // --- Only allow POST ---
  if (req.method !== "POST") {
    return res.status(405).json({ status: "error", message: "Method not allowed" });
  }

  const { ipAddress, angles, speed = 50 } = req.body;

  // --- Validate inputs ---
  if (
    (!angles) ||
    (angles && (!Array.isArray(angles) || angles.length !== 6)) ||
    typeof speed !== "number" ||
    !ipAddress
  ) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid input: must provide ipAddress, 'angles' as array of 6 numbers, speed as number",
    });
  }

  try {
    // Forward request to your backend with pi_ip
    const apiUrl = "http://127.0.0.1:8000/cobot280/set_angles";
    const payload = { ip: ipAddress, angles, speed };

    console.log("➡️ Forwarding to backend:", apiUrl, payload);

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("✅ Backend response:", data);

    if (response.ok) {
      res.status(200).json({
        status: "ok",
        ...data,
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: data?.error || data?.message || "Cobot backend error",
      });
    }
  } catch (err) {
    console.error("❌ Error forwarding to backend:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Network or backend connection error",
    });
  }
}
