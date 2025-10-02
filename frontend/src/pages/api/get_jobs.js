// pages/api/get_jobs.js
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  try {
    const { offset = 0, search = "" } = req.body;
    console.log("search:", search)

    // Send POST to FastAPI with search string and hardcoded limit 25
    const response = await fetch("http://127.0.0.1:8000/get_jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        offset,
        search,
        limit: 25
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`);
    }

    const jobs = await response.json();
    console.log("jobs:", jobs);

    return res.status(200).json({
      status: "ok",
      jobs,
    });
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
}
