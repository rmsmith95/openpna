// pages/api/get_parts.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const { offset = 0, search = "", showParts=true, showJigs=true, showAssemblies=true } = req.body;
    console.log("search:", search)

    // Send POST to FastAPI with search string and hardcoded limit 25
    const response = await fetch("http://127.0.0.1:8000/get_parts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        search,
        limit: 25,
        offset,
        showParts: showParts,
        showJigs: showJigs,
        showAssemblies: showAssemblies,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const parts = await response.json();
    console.log("parts:", parts);

    return res.status(200).json({
      status: "ok",
      parts,
    });
  } catch (err) {
    console.error("Error fetching parts:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}
