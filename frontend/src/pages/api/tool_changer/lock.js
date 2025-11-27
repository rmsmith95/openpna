export default async function lockTool() {
  try {
    const res = await fetch("http://127.0.0.1:8000/tool_changer/lock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({})
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("Backend error:", text);
      alert("Failed: " + text);
      return;
    }

    const data = await res.json();
    console.log("Lock response:", data);
    alert("Locked!");
  } catch (err) {
    console.error("Error calling lock API:", err);
    alert("Error: " + err.message);
  }
}
