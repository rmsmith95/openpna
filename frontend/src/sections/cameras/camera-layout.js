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

export default function CameraDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState({});
  const [machines, setMachines] = useState({});
  const [parts, setParts] = useState({});
  const [workspace, setWorkspace] = useState({ width: 600, height: 400 });

  const videoRefs = useRef({});
  const canvasRefs = useRef({});

  // 🧠 Fetch parts & machines from backend
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [machinesRes, partsRes] = await Promise.all([
          fetch("/api/get_machines"),
          fetch("/api/get_parts"),
        ]);

        const machinesData = await machinesRes.json();
        const partsData = await partsRes.json();

        console.log("Loaded machines:", machinesData);
        console.log("Loaded parts:", partsData);

        setMachines(machinesData);
        setParts(partsData);

        // derive workspace from first machine (if any)
        const firstMachine = Object.values(machinesData)[0];
        if (firstMachine?.workingArea) {
          setWorkspace({
            width: firstMachine.workingArea[0],
            height: firstMachine.workingArea[1],
          });
        }
      } catch (err) {
        console.error("Error loading backend data:", err);
      }
    }
    loadBackendData();
  }, []);

  // 🎥 Load real camera devices
  useEffect(() => {
    async function loadDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");

        // Add virtual "Digital Model" camera
        const digitalModel = { deviceId: "DigitalModel", label: "Digital Model" };
        const devicesWithFake = [...videoDevices, digitalModel];

        setDevices(devicesWithFake);

        // Initialize selection map
        const selected = {};
        devicesWithFake.forEach((d) => {
          selected[d.deviceId] = false;
        });
        setSelectedCameras(selected);
      } catch (err) {
        console.error("Error accessing cameras:", err);
      }
    }
    loadDevices();
  }, []);

  // Start/stop real camera streams
  useEffect(() => {
    Object.keys(selectedCameras).forEach((deviceId) => {
      if (deviceId === "DigitalModel") return;

      if (selectedCameras[deviceId]) startCamera(deviceId);
      else if (videoRefs.current[deviceId]) {
        const stream = videoRefs.current[deviceId].srcObject;
        if (stream) stream.getTracks().forEach((track) => track.stop());
        videoRefs.current[deviceId].srcObject = null;
      }
    });
  }, [selectedCameras]);

  async function startCamera(deviceId) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } },
      });
      if (videoRefs.current[deviceId]) {
        videoRefs.current[deviceId].srcObject = stream;
      }
    } catch (err) {
      console.error("Error starting camera:", err);
    }
  }

  const handleToggleCamera = (deviceId) => {
    setSelectedCameras((prev) => ({ ...prev, [deviceId]: !prev[deviceId] }));
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      {/* ✅ Camera selection checkboxes */}
      <FormGroup row sx={{ mb: 3 }}>
        {devices.map((device) => {
          const sameLabelCount =
            devices.filter((d) => d.label === device.label && d.deviceId <= device.deviceId).length - 1;

          const meta = CAMERA_METADATA.filter((m) => m.label === device.label)[sameLabelCount];
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

      {/* ✅ Camera / Digital Model grid */}
      <Grid container spacing={3}>
        {devices
          .filter((d) => selectedCameras[d.deviceId])
          .map((device) => {
            const sameLabelCount =
              devices.filter((dd) => dd.label === device.label && dd.deviceId <= device.deviceId).length - 1;
            const meta = CAMERA_METADATA.filter((m) => m.label === device.label)[sameLabelCount];

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
                  {/* 🎨 If DigitalModel, draw parts */}
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

                  {/* Overlay metadata */}
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
