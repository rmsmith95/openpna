"use client";

import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
  Box,
  Button,
  TextField,
  Tabs,
  Tab,
} from "@mui/material";
import CameraModel from "src/sections/cameras/camera-model";
import { useFactory } from "src/utils/factory-context";
import { useCameraStreams } from "src/hooks/use-camera-streams";

const GantryControls = ({ connectedLitePlacer }) => {
  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [homePosition, setHomePosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [step, setStep] = useState({ X: 5, Y: 5, Z: 2, A: 45 });
  const [speed, setSpeed] = useState(3000);
  const [cameraTab, setCameraTab] = useState(0);

  const { setGantryPosition } = useFactory();
  const { videoRefs, selectedCameras } = useCameraStreams();

  const getInfo = async () => {
    if (!connectedLitePlacer) return;
    try {
      const res = await fetch("/api/gantry/get_info");
      const data = await res.json();
      const positions = { X: 0, Y: 0, Z: 0, A: 0 };

      if (Array.isArray(data.status)) {
        data.status.forEach((lineObj) => {
          const line = lineObj.raw;
          let m;
          if ((m = line.match(/X position:\s*([-0-9.]+)/))) positions.X = parseFloat(m[1]);
          if ((m = line.match(/Y position:\s*([-0-9.]+)/))) positions.Y = parseFloat(m[1]);
          if ((m = line.match(/Z position:\s*([-0-9.]+)/))) positions.Z = parseFloat(m[1]);
          if ((m = line.match(/A position:\s*([-0-9.]+)/))) positions.A = parseFloat(m[1]);
        });
      }

      setPosition(positions); // local
      setGantryPosition(positions); // global
    } catch (err) {
      console.error("Error getting gantry position:", err);
    }
  };

  const reset = async () => {
    try {
      const res = await fetch("/api/gantry/reset", { method: "POST" });
      console.log("Reset response:", await res.json());
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  const setCurrentPosition = async () => {
    try {
      const res = await fetch("/api/gantry/set_position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(position),
      });
      console.log("Set position response:", await res.json());
    } catch (err) {
      console.error("Set position error:", err);
    }
  };

  const goto = async () => {
    if (!connectedLitePlacer) return;
    try {
      const res = await fetch("/api/gantry/goto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...position, speed }),
      });
      console.log("GoTo response:", await res.json());
    } catch (err) {
      console.error("GoTo error:", err);
    }
  };

  const stepMove = async (axis, direction) => {
    if (!connectedLitePlacer) return;
    const delta = Number(step[axis]) || 0;
    const moveValue = direction * delta;
    const move = { X: 0, Y: 0, Z: 0, A: 0 };
    move[axis] = moveValue;

    try {
      const res = await fetch("/api/gantry/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...move, speed }),
      });
      console.log("Step response:", await res.json());
      setTimeout(getInfo, 120);
    } catch (err) {
      console.error("Error moving gantry:", err);
    }
  };

  useEffect(() => {
    if (connectedLitePlacer) getInfo();
  }, [connectedLitePlacer]);

  const handleCameraTabChange = (e, newVal) => setCameraTab(newVal);

  return (
    <Stack direction="row" spacing={4} alignItems="flex-start">
      {/* Axis Control Table */}
      <Box sx={{ width: "50%", minWidth: 380 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 60 }}>Axis</TableCell>
              <TableCell sx={{ width: 80 }}>Position</TableCell>
              <TableCell sx={{ width: 80 }}>Step</TableCell>
              <TableCell>Controls</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {["X", "Y", "Z", "A"].map((axis) => (
              <TableRow key={axis}>
                <TableCell>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {axis}
                    <Typography variant="body2">{axis === "A" ? "(deg)" : "(mm)"}</Typography>
                  </Stack>
                </TableCell>
                <TableCell>
                  <TextField
                    value={position[axis]}
                    onChange={(e) => setPosition({ ...position, [axis]: e.target.value })}
                    size="small"
                    sx={{ width: 70, "& .MuiInputBase-input": { padding: "4px 6px", fontSize: 12 } }}
                  />
                </TableCell>
                <TableCell>
                  <TextField
                    value={step[axis]}
                    onChange={(e) => setStep({ ...step, [axis]: e.target.value })}
                    size="small"
                    sx={{ width: 70, "& .MuiInputBase-input": { padding: "4px 6px", fontSize: 12 } }}
                  />
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Button size="small" sx={{ minWidth: 32 }} onClick={() => stepMove(axis, -1)}>
                      -{axis}
                    </Button>
                    <Button size="small" sx={{ minWidth: 32 }} onClick={() => stepMove(axis, 1)}>
                      +{axis}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Bottom controls */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }}>
          <Button variant="contained" onClick={goto}>GoTo</Button>
          <Button variant="contained" onClick={setCurrentPosition}>Set</Button>
          <Button variant="contained" onClick={reset}>Reset</Button>
          <Button variant="contained" onClick={getInfo}>Info</Button>
          <Button variant="contained" onClick={() => {setPosition(homePosition);
              fetch("/api/gantry/goto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...homePosition, speed }),
              });
            }}>
            Home
          </Button>
          <Typography>Speed</Typography>
          <TextField value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            size="small"
            sx={{ width: 90 }}/>
        </Stack>
      </Box>

      {/* Right-side camera tabs */}
      <Box sx={{ flex: 1, minWidth: 420 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={cameraTab} onChange={handleCameraTabChange}>
            <Tab label="LitePlacer Down" />
            <Tab label="Board Up" />
            <Tab label="Digital Model" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2, position: "relative" }}>
          {/* Keep both real camera video elements mounted */}
          <video
            ref={(el) => (videoRefs.current["liteplacer"] = el)}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraTab === 0 ? "block" : "none",
            }}
          />
          <video
            ref={(el) => (videoRefs.current["board"] = el)}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraTab === 1 ? "block" : "none",
            }}
          />

          {/* Digital model tab */}
          {cameraTab === 2 && (
            <Box sx={{ bgcolor: "#111", borderRadius: 1, overflow: "hidden" }}>
              <CameraModel active />
            </Box>
          )}
        </Box>
      </Box>
    </Stack>
  );
};

GantryControls.propTypes = {
  connectedLitePlacer: PropTypes.bool,
};

export default GantryControls;
