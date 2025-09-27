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

// Hardcoded camera metadata (order matters)
const CAMERA_METADATA = [
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "Board", location: "0,0,0", direction: "Facing Up" },
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "LitePlacer", location: "End", direction: "Facing Down" }
];

export default function CameraDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    async function loadDevices() {
      try {
        // Ask for camera permission first
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter(d => d.kind === "videoinput");
        setDevices(videoDevices);

        // Initialize selection state (all unchecked)
        const selected = {};
        videoDevices.forEach(d => {
          selected[d.deviceId] = false;
        });
        setSelectedCameras(selected);
      } catch (err) {
        console.error("Error accessing cameras:", err);
      }
    }
    loadDevices();
  }, []);

  useEffect(() => {
    Object.keys(selectedCameras).forEach((deviceId) => {
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

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <FormGroup row sx={{ mb: 3 }}>
        {devices.map((device) => {
          // Count how many previous devices have same label
          const sameLabelCount = devices
            .filter(d => d.label === device.label && d.deviceId <= device.deviceId)
            .length - 1;

          // Pick metadata based on label + index in order
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
                <video
                  ref={(el) => (videoRefs.current[device.deviceId] = el)}
                  autoPlay
                  playsInline
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
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
