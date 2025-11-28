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

const LiteplacerControls = ({ connectedLitePlacer, goto }) => {
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [step, setStep] = useState({ x: 5, y: 5, z: 2, a: 45 });
  const [speed, setSpeed] = useState(3000);
  const [cameraTab, setCameraTab] = useState(0);

  const { setGantryPosition } = useFactory();
  const { videoRefs } = useCameraStreams();

  // Poll gantry info
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
    <Stack direction="row" spacing={4} alignItems="flex-start" sx={{ width: "100%" }}>
      
      {/* --- Full Width Table --- */}
      <Box sx={{ width: "100%" }}>
        <Table size="small" sx={{ width: "100%" }}>
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

                <TableCell sx={{ width: 80, p: 0.5 }} align="center">
                  <TextField
                    value={gotoPosition[axis]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGotoPosition({ ...gotoPosition, [axis]: isNaN(val) ? "" : val });
                    }}
                    size="small"
                    sx={{ width: 80, "& .MuiInputBase-input": { p: "4px 6px", fontSize: 12 } }}
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

        {/* --- Centered Bottom Controls --- */}
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 3 }}
          flexWrap="wrap"
        >
          <Button variant="contained" onClick={goto}>GoTo</Button>
          <Button variant="contained" onClick={setCurrentPosition}>Set</Button>
          <Button variant="contained" onClick={reset}>Reset</Button>

          {/* Speed Group */}
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: 500 }}>Speed:</Typography>
            <TextField
              value={speed}
              onChange={(e) => {
                const val = e.target.value;
                setSpeed(val === "" ? 0 : parseFloat(val));
              }}
              size="small"
              sx={{
                width: 100,
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  p: "6px 8px",
                  fontSize: 14,
                },
              }}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
        </Stack>
      </Box>
    </Stack>
  );
};

LiteplacerControls.propTypes = {
  connectedLitePlacer: PropTypes.bool,
};

export default LiteplacerControls;
