"use client";

import { useEffect, useRef } from "react";
import { useFactory } from "src/utils/factory-context";

export default function CameraModel({ active }) {
  const canvasRef = useRef(null);
  const { parts, machines, gantryPosition, cameraOffset, loading } = useFactory();

  // Fallback workspace size
  const workspace = machines["m1"]?.workingArea || { width: 600, height: 400 };

  useEffect(() => {
    if (!active || loading.parts || !parts || Object.keys(parts).length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Draw parts
    Object.values(parts).forEach((part) => {
      if (!part.bbox) return;

      let [x, y, w, h] = part.bbox.map(Number);
      if ([x, y, w, h].some(isNaN)) return;

      let strokeColor = "lime";
      let fillColor = "rgba(0,255,0,0.2)";
      switch (part.class) {
        case "assembly":
          strokeColor = "#0a4200";
          fillColor = "rgba(0,128,0,0.25)";
          break;
        case "part":
          strokeColor = "#00ff00";
          fillColor = "rgba(0,255,0,0.15)";
          break;
        case "camera":
          strokeColor = "#ff0000";
          fillColor = "rgba(255,0,0,0.2)";
          break;
        case "jig":
          strokeColor = "#007bff";
          fillColor = "rgba(0,123,255,0.25)";
          break;
      }

      ctx.fillStyle = fillColor;
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;

      ctx.fillRect(x, y, w, h);
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = strokeColor;
      ctx.font = "14px monospace";
      ctx.textBaseline = "top";
      ctx.fillText(part.name || "unnamed", x + 3, y + 3);
    });

    // Draw camera box at gantry + offset (use lowercase keys!)
    if (gantryPosition && cameraOffset) {
      const cameraWidth = 80;
      const cameraHeight = 60;
      const camX = gantryPosition.x + cameraOffset.x;
      const camY = gantryPosition.y + cameraOffset.y;

      ctx.strokeStyle = "red";
      ctx.lineWidth = 3;
      ctx.strokeRect(
        camX - cameraWidth / 2,
        camY - cameraHeight / 2,
        cameraWidth,
        cameraHeight
      );

      ctx.fillStyle = "red";
      ctx.font = "14px monospace";
      ctx.fillText("Camera1", camX - 30, camY - cameraHeight / 2 - 12);
    }
  }, [parts, active, loading.parts, machines, gantryPosition, cameraOffset]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={400}
      style={{
        width: "100%",
        height: "auto",
        background: "black",
        border: "1px solid #333",
      }}
    />
  );
}
