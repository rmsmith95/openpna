"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Tabs, Tab, Typography } from "@mui/material";
import CameraModel from "./camera-model";

const CAMERA_METADATA = [
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "Board", location: "0,0,0", direction: "Facing Up" },
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "LitePlacer", location: "End", direction: "Facing Down" },
  { label: "Digital Model", name: "Digital Model", location: "Liteplacer", direction: "Top View" },
];

export default function CameraDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);

  const videoRef = useRef(null);
  const activeStreamRef = useRef(null);
  const activeDeviceIdRef = useRef(null);

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

  /* ------------------ Switch camera on tab change ------------------ */
  useEffect(() => {
    const device = devices[selectedTab];
    if (!device) return;

    // Stop previous stream
    if (activeStreamRef.current) {
      activeStreamRef.current.getTracks().forEach(t => t.stop());
      activeStreamRef.current = null;
      activeDeviceIdRef.current = null;
    }

    // Digital model does not use camera
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
      activeDeviceIdRef.current = deviceId;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera start failed:", deviceId, err);
    }
  }

  return (
    <Box sx={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* ------------------ TABS ------------------ */}
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

      {/* ------------------ VIEW ------------------ */}
      <Box sx={{ flex: 1, position: "relative", bgcolor: "black" }}>
        {devices[selectedTab]?.deviceId === "DigitalModel" ? (
          <CameraModel active />
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        )}

        {/* Overlay */}
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
