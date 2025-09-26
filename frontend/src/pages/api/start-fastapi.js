import { spawn } from "child_process";
import path from "path";

let fastapiProcess = null;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ status: "method not allowed" });
  }

  const { action } = req.body;
  const backendPath = path.join(process.cwd(), "..", "backend");

  if (action === "start") {
    if (fastapiProcess) return res.status(200).json({ status: "connected" });

    fastapiProcess = spawn(
      "uvicorn",
      ["main:app", "--reload", "--port", "8000"],
      { cwd: backendPath, stdio: "pipe", shell: true }
    );

    fastapiProcess.stdout.on("data", (data) => console.log("[FastAPI stdout]", data.toString()));
    fastapiProcess.stderr.on("data", (data) => console.error("[FastAPI stderr]", data.toString()));

    fastapiProcess.on("close", () => { fastapiProcess = null; });

    return res.status(200).json({ status: "loading" });
  }
  res.status(400).json({ status: "invalid action" });
}
