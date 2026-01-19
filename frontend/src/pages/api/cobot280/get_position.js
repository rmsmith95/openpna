export default async function handler(req, res) {
  try {
    // Forward request to FastAPI backend
    const apiUrl = "http://127.0.0.1:8000/cobot280/get_position";
    const response = await fetch(apiUrl);

    const data = await response.json();
    console.log("✅ Backend get_position response:", data);

    if (response.ok) {
      res.status(200).json({
        status: "ok",
        angles: data.angles ?? [], // default to empty array
      });
    } else {
      res.status(response.status).json({
        status: "error",
        message: data?.error || data?.message || "Cobot backend error",
      });
    }
  } catch (err) {
    console.error("❌ Error fetching position:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Network or backend connection error",
    });
  }
}
