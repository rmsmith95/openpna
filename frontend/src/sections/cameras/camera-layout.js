"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CameraModel from "./camera-model";

const CAMERA_METADATA = [
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "Board", location: "0,0,0", direction: "Facing Up" },
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "LitePlacer", location: "End", direction: "Facing Down" },
  { label: "Digital Model", name: "Digital Model", location: "Liteplacer", direction: "Top View" },
];

function drawCrosshair(ctx, width, height, options = {}) {
  const { size = 22, gap = 6, color = "#00ff00", lineWidth = 2 } = options;
  const cx = width / 2;
  const cy = height / 2;

  ctx.clearRect(0, 0, width, height);
  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(cx - size, cy);
  ctx.lineTo(cx - gap, cy);
  ctx.moveTo(cx + gap, cy);
  ctx.lineTo(cx + size, cy);

  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx, cy - gap);
  ctx.moveTo(cx, cy + gap);
  ctx.lineTo(cx, cy + size);

  ctx.stroke();
}

export default function CameraDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const videoRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const activeStreamRef = useRef(null);

  /* ------------------ Load camera devices ------------------ */
  useEffect(() => {
    async function loadDevices() {
      try {
        const temp = await navigator.mediaDevices.getUserMedia({ video: true });
        temp.getTracks().forEach(t => t.stop());

        const all = await navigator.mediaDevices.enumerateDevices();
        const cams = all.filter(d => d.kind === "videoinput");

        const digital = { deviceId: "DigitalModel", label: "Digital Model" };
        setDevices([...cams, digital]);
      } catch (err) {
        console.error("Device enumeration failed:", err);
      }
    }
    loadDevices();
  }, []);

  /* ------------------ Draw crosshair overlay ------------------ */
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    drawCrosshair(ctx, canvas.width, canvas.height);
  }, [selectedTab]);

  /* ------------------ Switch camera on tab change ------------------ */
  useEffect(() => {
    const device = devices[selectedTab];
    if (!device) return;

    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
    }

    if (device.deviceId === "DigitalModel") {
      if (videoRef.current) videoRef.current.srcObject = null;
      return;
    }

    startCamera(device.deviceId);
  }, [selectedTab, devices]);

  async function startCamera(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
        },
      });

      activeStreamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera start failed:", deviceId, err);
    }
  }

  return (
    <Box sx={{ width: "100%", display: "flex", flexDirection: "column", height: "100%" }}>

      <Tabs
        value={selectedTab}
        onChange={(_, v) => setSelectedTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ borderBottom: "1px solid #333" }}
      >
        {devices.map((device) => {
          const meta = CAMERA_METADATA.find(m => m.label === device.label) || { name: device.label };
          return <Tab key={device.deviceId} label={meta.name} />;
        })}
      </Tabs>

      <Box sx={{ flex: 1, position: "relative", bgcolor: "black", maxHeight: '100vh' }}>

        {devices[selectedTab]?.deviceId === "DigitalModel" ? (
          <CameraModel active />
        ) : (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />

            {/* ✅ Crosshair overlay */}
            <canvas
              ref={overlayCanvasRef}
              width={640}
              height={480}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            />
          </>
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(0,0,0,0.6)",
            color: "white",
            p: 1,
          }}
        >
          <Typography variant="subtitle2">
            {CAMERA_METADATA[selectedTab]?.name || "Camera"}
          </Typography>
        </Box>

      </Box>
    </Box>
  );
}
