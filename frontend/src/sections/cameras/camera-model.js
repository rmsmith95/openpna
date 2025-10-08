"use client";

import { useEffect, useRef } from "react";
import { useFactory } from "src/utils/factory-context";

export default function CameraModel({ active }) {
  const canvasRef = useRef(null);
  const { parts, machines, loading } = useFactory();

  // Use first machine as workspace, fallback
  const workspace = machines["m1"]?.workingArea || { width: 600, height: 400 };

  useEffect(() => {
    if (!active || loading.parts || !parts || Object.keys(parts).length === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    console.log('parts', parts)
    console.log('machines', machines)

    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    // Determine scale factors
    const scaleX = 1 // width / workspace.width;
    const scaleY = 1 // height / workspace.height;

    Object.values(parts).forEach((part) => {
      if (!part.bbox) return;

      // Handle array bbox
      let [x, y, w, h] = part.bbox;

      // Ensure numbers
      x = Number(x);
      y = Number(y);
      w = Number(w);
      h = Number(h);
      // console.log('x,y,w,h',x,y,w,h)
      if ([x, y, w, h].some(isNaN)) return;
      console.log('x,y,w,h',x,y,w,h)

      // Colors by class
      let strokeColor = "limegreen";
      let fillColor = "rgba(0,255,0,0.15)";

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
        default:
          strokeColor = "white";
          fillColor = "rgba(255,255,255,0.1)";
      }

      // Draw
      ctx.fillStyle = fillColor;
      ctx.fillRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

      ctx.fillStyle = strokeColor;
      ctx.font = "16px Arial";
      ctx.textBaseline = "top";
      ctx.fillText(part.name, x * scaleX + 4, y * scaleY + 4);
    });

  }, [parts, workspace, active, loading.parts]);

  return (
    <canvas
      ref={canvasRef}
      width={640}
      height={360}
      style={{ width: "100%", height: "100%", objectFit: "contain" }}
    />
  );
}
