"use client";

import { useState, useRef, useEffect } from "react";
import {
  Box,
  Container,
  Tabs,
  Tab,
  Typography,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Paper,
} from "@mui/material";
import CameraModel from "./camera-model";

const CAMERA_METADATA = [
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "Board", location: "0,0,0", direction: "Facing Up" },
  { label: "USB 2.0 PC Cam (5149:13d3)", name: "LitePlacer", location: "End", direction: "Facing Down" },
  { label: "Digital Model", name: "Digital Model", location: "Liteplacer", direction: "Top View" },
];

export default function CameraDashboard() {
  const [devices, setDevices] = useState([]);
  const [selectedCameras, setSelectedCameras] = useState({});
  const [selectedTab, setSelectedTab] = useState(0);
  const [machines, setMachines] = useState({});
  const [parts, setParts] = useState({});
  const [workspace, setWorkspace] = useState({ width: 600, height: 400 });

  const videoRefs = useRef({});

  // Load machines & parts
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [machinesRes, partsRes] = await Promise.all([
          fetch("/api/get_machines"),
          fetch("/api/get_parts"),
        ]);
        const machinesData = await machinesRes.json();
        const partsData = await partsRes.json();
        setMachines(machinesData);
        setParts(partsData);

        const firstMachine = Object.values(machinesData)[0];
        if (firstMachine?.workingArea) {
          setWorkspace({
            width: firstMachine.workingArea[0],
            height: firstMachine.workingArea[1],
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadBackendData();
  }, []);

  // Load video devices
  useEffect(() => {
    async function loadDevices() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach((track) => track.stop());

        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");

        const digitalModel = { deviceId: "DigitalModel", label: "Digital Model" };
        const devicesWithFake = [...videoDevices, digitalModel];

        setDevices(devicesWithFake);

        // initialize selection
        const selected = {};
        devicesWithFake.forEach((d) => (selected[d.deviceId] = true)); // show all by default
        setSelectedCameras(selected);
      } catch (err) {
        console.error(err);
      }
    }
    loadDevices();
  }, []);

  // Start / stop real cameras
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
      if (videoRefs.current[deviceId]) videoRefs.current[deviceId].srcObject = stream;
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <Box
      sx={{
        mt: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      <Tabs
        value={selectedTab}
        onChange={(_, newVal) => setSelectedTab(newVal)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 0 }}
      >
        {devices.filter(d => selectedCameras[d.deviceId]).map((device, idx) => {
          const meta = CAMERA_METADATA.find(m => m.label === device.label) || { name: device.label };
          return <Tab key={device.deviceId} label={meta.name} />;
        })}
      </Tabs>

      {/* Camera Panels */}
      {devices.filter(d => selectedCameras[d.deviceId]).map((device, idx) => {
        const meta = CAMERA_METADATA.find(m => m.label === device.label) || { name: device.label };
        return (
          <Box
            key={device.deviceId}
            sx={{
          display: selectedTab === idx ? "block" : "none",
          maxHeight: "100vh",
          maxWidth: "100vw",
          width: "95vw",
          mx: "auto",
          position: "relative",
          bgcolor: "black",
          overflow: "hidden",
            }}
          >
            {device.deviceId === "DigitalModel" ? (
              <CameraModel active parts={parts} workspace={workspace} />
            ) : (
              <video
                ref={el => (videoRefs.current[device.deviceId] = el)}
                autoPlay
                playsInline
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
            {/* Overlay metadata */}
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
          </Box>
        );
      })}
    </Box>
  );
}
