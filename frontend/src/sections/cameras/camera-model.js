"use client";

import { useEffect, useRef, useMemo } from "react";
import { useFactory } from "src/utils/factory-context";


export default function CameraModel({ active }) {
  const canvasRef = useRef(null);
  const { parts, machines, gantryPosition, cameraOffset, loading } = useFactory();
  const workspace = machines["m1"]?.workingArea || { width: 560, height: 360 };

  // Combine parts + camera as one list
  const combinedParts = useMemo(() => {
    if (!parts) return [];

    let allParts = Object.values(parts);

    // Add camera as a pseudo-part if we have position data
    if (gantryPosition && cameraOffset) {
      allParts = [
        ...allParts,
        {
          id: "camera1",
          name: "Camera1",
          class: "camera",
          bbox: [
            gantryPosition.x + cameraOffset.x,
            gantryPosition.y + cameraOffset.y,
            80,
            60,
          ],
        },
      ];
    }

    return allParts;
  }, [parts, gantryPosition, cameraOffset]);

  useEffect(() => {
    if (!active || loading.parts || !combinedParts || combinedParts.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Draw all parts (including camera)
    combinedParts.forEach((part) => {
      if (!part.bbox) return;
      let [x, y, w, h] = part.bbox.map(Number);
      if ([x, y, w, h].some(isNaN)) return;

      // Flip Y axis
      y = height - y - h;

      let strokeColor = "lime";
      let fillColor = "rgba(0,255,0,0.2)";

      switch (part.class) {
        case "assembly":
          strokeColor = "#0a4200";
          fillColor = "rgba(0,128,0,0.25)";
          break;
        case "tool":
          strokeColor = "#c0840c";
          fillColor = "rgba(192,132,12,0.25)";
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

  }, [active, loading.parts, combinedParts]);

  return (
    <canvas
      ref={canvasRef}
      width={560}
      height={360}
      style={{
        width: "100%",
        height: "auto",
        background: "black",
        border: "1px solid #333",
        borderRadius: 10, // no corners
        display: "block",
      }}
    />
  );
}
