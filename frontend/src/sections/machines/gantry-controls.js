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
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [step, setStep] = useState({ x: 5, y: 5, z: 2, a: 45 });
  const [speed, setSpeed] = useState(3000);
  const [cameraTab, setCameraTab] = useState(0);

  const { setGantryPosition } = useFactory();
  const { videoRefs } = useCameraStreams();

  // Poll gantry info regularly
  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await fetch("/api/gantry/get_info");
        const data = await res.json();
        const positions = { x: 0, y: 0, z: 0, a: 0 };

        if (Array.isArray(data.status)) {
          data.status.forEach(({ raw }) => {
            let m;
            if ((m = raw.match(/X position:\s*([-0-9.]+)/))) positions.x = parseFloat(m[1]);
            if ((m = raw.match(/Y position:\s*([-0-9.]+)/))) positions.y = parseFloat(m[1]);
            if ((m = raw.match(/Z position:\s*([-0-9.]+)/))) positions.z = parseFloat(m[1]);
            if ((m = raw.match(/A position:\s*([-0-9.]+)/))) positions.a = parseFloat(m[1]);
          });
        }

        setPosition(positions);
        setGantryPosition(positions);
      } catch (err) {
        console.error("Error getting gantry position:", err);
      }
    };

    getInfo();
    const interval = setInterval(getInfo, 1000);
    return () => clearInterval(interval);
  }, [setGantryPosition]);

  // Movement helpers
  const goto = async () => {
    try {
      const res = await fetch("/api/gantry/goto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gotoPosition, speed }),
      });
      console.log("GoTo response:", await res.json());
    } catch (err) {
      console.error("GoTo error:", err);
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

  const stepMove = async (axis, direction) => {
    const delta = Number(step[axis]) || 0;
    const move = { x: 0, y: 0, z: 0, a: 0, [axis]: direction * delta };

    try {
      const res = await fetch("/api/gantry/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...move, speed }),
      });
      console.log("Step response:", await res.json());
    } catch (err) {
      console.error("Error moving gantry:", err);
    }
  };

  const handleCameraTabChange = (_, newVal) => setCameraTab(newVal);

  return (
    <Stack direction="row" spacing={4} alignItems="flex-start">
      {/* --- Axis Control Table --- */}
      <Box sx={{ width: "50%", minWidth: 380 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Axis</TableCell>
              <TableCell align="center">Pos</TableCell>
              <TableCell align="center">Goto</TableCell>
              <TableCell align="center">Step</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {["x", "y", "z", "a"].map((axis) => (
              <TableRow key={axis}>
                <TableCell sx={{ p: 0.5 }} align="center">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                    {axis.toUpperCase()}
                    <Typography variant="body2">
                      {axis === "a" ? "(deg)" : "(mm)"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell sx={{ width: 60, p: 0.5 }} align="center">
                  {position[axis].toFixed(2)}
                </TableCell>

                <TableCell sx={{ width: 70, p: 0.5 }} align="center">
                  <TextField
                    value={gotoPosition[axis]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGotoPosition({ ...gotoPosition, [axis]: isNaN(val) ? "" : val });
                    }}
                    size="small"
                    sx={{ width: 70, "& .MuiInputBase-input": { p: "4px 6px", fontSize: 12 } }}
                    type="number"
                    inputProps={{ step: "any" }}
                  />
                </TableCell>

                <TableCell sx={{ p: 0.5 }} align="center">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                    <Button size="small" sx={{ minWidth: 28 }} onClick={() => stepMove(axis, -1)}>
                      -
                    </Button>

                    <TextField
                      value={step[axis]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setStep({ ...step, [axis]: isNaN(val) ? "" : val });
                      }}
                      size="small"
                      sx={{
                        width: 60,
                        "& .MuiInputBase-input": { p: "4px 6px", fontSize: 12, textAlign: "center" },
                      }}
                      type="number"
                      inputProps={{ step: "any" }}
                    />

                    <Button size="small" sx={{ minWidth: 28 }} onClick={() => stepMove(axis, 1)}>
                      +
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* --- Bottom Controls --- */}
        <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 2 }} alignItems="center">
          <Button variant="contained" onClick={goto}>GoTo</Button>
          <Button variant="contained" onClick={setCurrentPosition}>Set</Button>
          <Button variant="contained" onClick={reset}>Reset</Button>
          <Typography sx={{ ml: 1 }}>Speed</Typography>
          <TextField
            value={speed}
            onChange={(e) => {
              const val = e.target.value;
              setSpeed(val === "" ? 0 : parseFloat(val));
            }}
            size="small"
            sx={{ width: 90 }}
          />
        </Stack>
      </Box>

      {/* --- Camera / Model Tabs --- */}
      <Box sx={{ flex: 1, minWidth: 420 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={cameraTab} onChange={handleCameraTabChange}>
            <Tab label="LitePlacer Down" />
            <Tab label="Board Up" />
            <Tab label="Digital Model" />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2, position: "relative", borderRadius: 0 }}>
          <video
            ref={(el) => (videoRefs.current["liteplacer"] = el)}
            autoPlay
            playsInline
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: cameraTab === 0 ? "block" : "none",
              borderRadius: 0,
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
              borderRadius: 0,
            }}
          />

          {cameraTab === 2 && (
            <Box sx={{ bgcolor: "#111", overflow: "hidden", borderRadius: 0 }}>
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
