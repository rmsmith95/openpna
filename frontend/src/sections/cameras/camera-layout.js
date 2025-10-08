"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Container,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography
} from "@mui/material";
import CameraModel from "./camera-model";


// Hardcoded camera metadata
const CAMERA_METADATA = [
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "Board", location: "0,0,0", direction: "Facing Up" },
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "LitePlacer", location: "End", direction: "Facing Down" },
  { label: "Digital Model", name: "Digital Model", location: "Liteplacer", direction: "Top View" }
];

// Hardcoded machine info
const MACHINE = {
  name: "LitePlacer1",
  workingArea: { width: 600, height: 400, z: 100 },
  dimensions: { width: 750, height: 550, depth: 400 },
  effector: "",
  cad: "/home/liteplacer.stl"
};

export default function CameraDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState({});
  const videoRefs = useRef({});
  const canvasRefs = useRef({});

  // Hardcoded demo parts inline
  const [parts] = useState({
    p1: {
      id: "p1",
      name: "Body",
      class: "part",
      mass: 0.3,
      description: "3d printed",
      cad: "/home/body.stl",
      assembly_id: false,
      bbox: { x: 5, y: 0, w: 120, h: 120 }
    },
    p2: {
      id: "p2",
      name: "Body Jig",
      class: "jig",
      mass: 0.3,
      description: "3d printed",
      cad: "/home/body_jig.stl",
      assembly_id: false,
      bbox: { x: 140, y: 0, w: 140, h: 140 }
    },
    p3: {
      id: "p3",
      name: "Arm1",
      class: "part",
      mass: 0.2,
      description: "3d printed",
      cad: "/home/arm.stl",
      assembly_id: false,
      bbox: { x: 0, y: 140, w: 120, h: 60 }
    },
    p4: {
      id: "p4",
      name: "Camera1",
      class: "camera",
      mass: 0.2,
      bbox: { x: 100, y: 100, w: 80, h: 60 }
    }
  });

  // Workspace uses machine working area
  const [workspace] = useState({
    width: MACHINE.workingArea.width,
    height: MACHINE.workingArea.height
  });

  // Load real cameras
  useEffect(() => {
    async function loadDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === "videoinput");

        // Append fake camera manually
        const DigitalModel = { deviceId: "DigitalModel", label: "Digital Model" };
        const devicesWithFake = [...videoDevices, DigitalModel];

        setDevices(devicesWithFake);

        // Initialize selection state
        const selected = {};
        devicesWithFake.forEach(d => {
          selected[d.deviceId] = false;
        });
        setSelectedCameras(selected);
      } catch (err) {
        console.error("Error accessing cameras:", err);
      }
    }
    loadDevices();
  }, []);

  // Manage real camera streams
  useEffect(() => {
    Object.keys(selectedCameras).forEach((deviceId) => {
      if (deviceId === "DigitalModel") return;

      if (selectedCameras[deviceId]) startCamera(deviceId);
      else if (videoRefs.current[deviceId]) {
        const stream = videoRefs.current[deviceId].srcObject;
        if (stream) stream.getTracks().forEach(track => track.stop());
        videoRefs.current[deviceId].srcObject = null;
      }
    });
  }, [selectedCameras]);

  async function startCamera(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      });
      if (videoRefs.current[deviceId]) videoRefs.current[deviceId].srcObject = stream;
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  }

  const handleToggleCamera = (deviceId) => {
    setSelectedCameras(prev => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  // Draw parts in fake camera feed with names
  useEffect(() => {
    if (!selectedCameras["DigitalModel"]) return;
    const canvas = canvasRefs.current["DigitalModel"];
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const { width, height } = canvas;

    ctx.clearRect(0, 0, width, height);

    // Scale workspace to canvas
    const scaleX = width / workspace.width;
    const scaleY = height / workspace.height;

    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, width, height);

    Object.values(parts).forEach((part) => {
      const { x, y, w, h } = part.bbox;

      // Set colors based on class
      let strokeColor = "limegreen";
      let fillColor = "rgba(0,255,0,0.15)";

      switch (part.class) {
        case "assembly":
          strokeColor = "#0a4200"; // dark green
          fillColor = "rgba(0,128,0,0.25)";
          break;
        case "part":
          strokeColor = "#00ff00"; // light green
          fillColor = "rgba(0,255,0,0.15)";
          break;
        case "camera":
          strokeColor = "#ff0000"; // red
          fillColor = "rgba(255,0,0,0.2)";
          break;
        case "jig":
          strokeColor = "#007bff"; // blue
          fillColor = "rgba(0,123,255,0.25)";
          break;
        default:
          strokeColor = "white";
          fillColor = "rgba(255,255,255,0.1)";
      }

      // Draw filled rectangle with stroke
      ctx.fillStyle = fillColor;
      ctx.fillRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x * scaleX, y * scaleY, w * scaleX, h * scaleY);

      // Draw name text
      ctx.fillStyle = strokeColor;
      ctx.font = "16px Arial";
      ctx.textBaseline = "top";
      ctx.fillText(part.name, x * scaleX + 4, y * scaleY + 4);
    });
  }, [parts, workspace, selectedCameras]);

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <FormGroup row sx={{ mb: 3 }}>
        {devices.map((device) => {
          const sameLabelCount = devices
            .filter(d => d.label === device.label && d.deviceId <= device.deviceId)
            .length - 1;

          const meta = CAMERA_METADATA.filter(m => m.label === device.label)[sameLabelCount];
          return (
            <FormControlLabel
              key={device.deviceId}
              control={
                <Checkbox
                  checked={selectedCameras[device.deviceId] || false}
                  onChange={() => handleToggleCamera(device.deviceId)}
                />
              }
              label={meta?.name || device.label || `Camera`}
            />
          );
        })}
      </FormGroup>

      <Grid container spacing={3}>
        {devices.filter(d => selectedCameras[d.deviceId]).map((device) => {
          const sameLabelCount = devices
            .filter(dd => dd.label === device.label && dd.deviceId <= device.deviceId)
            .length - 1;
          const meta = CAMERA_METADATA.filter(m => m.label === device.label)[sameLabelCount];

          return (
            <Grid item xs={12} md={6} key={device.deviceId}>
              <Paper
                elevation={3}
                sx={{
                  position: "relative",
                  borderRadius: 2,
                  height: 360,
                  backgroundColor: "black",
                  overflow: "hidden",
                }}
              >
                {device.deviceId === "DigitalModel" ? (
                  <CameraModel
                    active={selectedCameras["DigitalModel"]}
                    parts={parts}
                    workspace={workspace}
                  />
                ) : (
                  <video
                    ref={(el) => (videoRefs.current[device.deviceId] = el)}
                    autoPlay
                    playsInline
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                )}

                {meta && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: "rgba(0,0,0,0.5)",
                      color: "white",
                      p: 1,
                    }}
                  >
                    <Typography variant="subtitle2">
                      {meta.name} | {meta.location} | {meta.direction}
                    </Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
