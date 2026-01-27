// frontend/pages/api/gantry/get_info.j
export default async function handler(req, res) {
  // console.log("Received request to /api/gantry/get_info");

  if (req.method !== "GET") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const response = await fetch("http://127.0.0.1:8000/gantry/get_info");
    const text = await response.text(); // <- read as plain text
    // console.log("get_info response:", text);

    // If your FastAPI endpoint already returns JSON, you could try:
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text }; // fallback
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error forwarding to FastAPI:", err);
    res.status(500).json({ status: "error", message: err.message });
  }
}
