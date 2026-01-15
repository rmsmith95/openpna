// pages/api/gripper/connect.js
export default async function handler(req, res) {
  console.log("Received request to /api/gripper/connect", req.body);

  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { ip, servo_id } = req.body;

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  try {
    // 1️⃣ Initial connect
    const response = await fetch("http://127.0.0.1:8000/gripper/connect", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ip, servo_id }),
    });

    let data = await response.json();
    console.log("connect data", data);

    // 2️⃣ Retry status if empty
    const timeoutMs = 3000;
    const intervalMs = 200;
    const start = Date.now();

    while (
      (!data.status || Object.keys(data.status).length === 0) &&
      Date.now() - start < timeoutMs
    ) {
      await sleep(intervalMs);

      const statusRes = await fetch(
        "http://127.0.0.1:8000/gripper/get_status"
      );
      const status = await statusRes.json();

      if (status && Object.keys(status).length > 0) {
        data.status = status;
        data.connected = true;
        break;
      }
    }

    // 3️⃣ Final response to frontend
    res.status(200).json({
      connected: data.connected && Object.keys(data.status || {}).length > 0,
      status: data.status || {},
    });
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res
      .status(500)
      .json({ connected: false, status: {}, message: err.message });
  }
}
