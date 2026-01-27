export default async function handler(req, res) {
  try {
    // Forward request to FastAPI backend
    const apiUrl = "http://127.0.0.1:8000/cobot280/get_position";
    const response = await fetch(apiUrl);

    const res = await response.json();
    console.log("✅ Backend get_position response:", res);

  } catch (err) {
    console.error("❌ Error fetching position:", err);
  }
}
