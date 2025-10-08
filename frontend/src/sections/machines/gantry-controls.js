// components/GantryControls.jsx
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
  Tab
} from "@mui/material";

/**
 * GantryControls
 * - per-axis position & step inputs
 * - step/jog buttons (relative)
 * - GoTo / Set position / Reset / Info / Home actions
 * - right-side camera tabs (placeholders)
 */
const GantryControls = ({ connectedLitePlacer }) => {
  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [homePosition, setHomePosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [step, setStep] = useState({ X: 5, Y: 5, Z: 2, A: 45 }); // default step per axis
  const [speed, setSpeed] = useState(3000);
  const [cameraTab, setCameraTab] = useState(0);

  // Get full TinyG status (raw lines)
 const getInfo = async () => {
  if (!connectedLitePlacer) return;

  try {
    const res = await fetch("/api/gantry/get_info");
    const data = await res.json();
    console.log("Raw TinyG response:", data);

    const positions = { X: 0, Y: 0, Z: 0, A: 0 };

    if (Array.isArray(data.status)) {
      data.status.forEach((lineObj) => {
        const line = lineObj.raw; // <-- extract the string
        let m;
        if ((m = line.match(/X position:\s*([-0-9.]+)/))) positions.X = parseFloat(m[1]);
        if ((m = line.match(/Y position:\s*([-0-9.]+)/))) positions.Y = parseFloat(m[1]);
        if ((m = line.match(/Z position:\s*([-0-9.]+)/))) positions.Z = parseFloat(m[1]);
        if ((m = line.match(/A position:\s*([-0-9.]+)/))) positions.A = parseFloat(m[1]);
      });
    } else {
      console.warn("getInfo: unexpected response format", data);
    }

    setPosition(positions);
  } catch (err) {
    console.error("Error getting gantry position:", err);
  }
};

  // Soft reset TinyG (Ctrl+X)
  const reset = async () => {
    console.log("resetting...");
    try {
      const res = await fetch("/api/gantry/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      console.log("Reset response:", data);
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  // Set current gantry position with G92
  const setGantryPosition = async () => {
    try {
      const res = await fetch("/api/gantry/set_position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: Number(position.X),
          y: Number(position.Y),
          z: Number(position.Z),
          a: Number(position.A),
        }),
      });
      const data = await res.json();
      console.log("Set position response:", data);
    } catch (err) {
      console.error("Set position error:", err);
    }
  };

  // Raw TinyG command helper (for debugging / manual commands)
  const tinyg_send = async (command, delay = 0.05) => {
    console.log("sending TinyG command:", command);
    try {
      const res = await fetch("/api/gantry/tinyg_send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command, delay }),
      });
      const data = await res.json();
      console.log("TinyG response:", data);
      return data;
    } catch (err) {
      console.error("tinyg_send error:", err);
      return { error: err.message || String(err) };
    }
  };

  // Absolute GOTO
  const goto = async () => {
    if (!connectedLitePlacer) return;

    try {
      console.log("GoTo:", {
        x: position.X,
        y: position.Y,
        z: position.Z,
        a: position.A,
        speed,
      });

      const res = await fetch("/api/gantry/goto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: Number(position.X),
          y: Number(position.Y),
          z: Number(position.Z),
          a: Number(position.A),
          speed: Number(speed),
        }),
      });

      const data = await res.json();
      console.log("GoTo response:", data);
    } catch (err) {
      console.error("Error in GoTo:", err);
    }
  };

  // Relative step/jog
  const stepMove = async (axis, direction) => {
    if (!connectedLitePlacer) return;

    try {
      // ensure step is numeric
      const delta = Number(step[axis]) || 0;
      const moveValue = direction * delta;

      // Build move object with only the axis to move, others 0
      const move = { X: 0, Y: 0, Z: 0, A: 0 };
      if (["X", "Y", "Z", "A"].includes(axis)) move[axis] = moveValue;
      else return;

      const res = await fetch("/api/gantry/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: move.X,
          y: move.Y,
          z: move.Z,
          a: move.A,
          speed: Number(speed) || 1000,
        }),
      });

      console.log("Move:", { ...move, speed });
      const data = await res.json();
      console.log("Move response:", data);

      // After a successful step it's often useful to refresh reported position
      if (data?.status === "ok") {
        // small delay to allow TinyG to update internal position
        setTimeout(() => getInfo(), 120);
      }
    } catch (err) {
      console.error("Error moving gantry:", err);
    }
  };

  // Optional: fetch current position on mount (once)
  useEffect(() => {
    if (connectedLitePlacer) {
      getInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedLitePlacer]);

  // camera tab change handler
  const handleCameraTabChange = (e, newVal) => {
    setCameraTab(newVal);
  };

  // Render
  return (
    <Stack direction="row" spacing={4} alignItems="flex-start">
      {/* Axis Table */}
      <Box
        sx={{
          tableLayout: "fixed",
          width: "50%", // ⬅️ take half the parent width
          minWidth: 380, // optional safety to avoid collapsing too much
        }}
      >
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
                  <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                    {axis}
                    <Typography variant="body2">{axis === "A" ? "(deg)" : "(mm)"}</Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <TextField
                    value={position[axis]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^-?\d*\.?\d*$/.test(val)) setPosition({ ...position, [axis]: val });
                    }}
                    size="small"
                    sx={{
                      width: 70,
                      "& .MuiInputBase-input": { padding: "4px 6px", fontSize: 12 },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <TextField
                    value={step[axis]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^-?\d*\.?\d*$/.test(val)) setStep({ ...step, [axis]: val });
                    }}
                    size="small"
                    sx={{
                      width: 70,
                      "& .MuiInputBase-input": { padding: "4px 6px", fontSize: 12 },
                    }}
                  />
                </TableCell>

                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Button variant="contained" size="small" sx={{ minWidth: 32, fontSize: 11 }} onClick={() => stepMove(axis, -1)}>
                      -{axis}
                    </Button>
                    <Button variant="contained" size="small" sx={{ minWidth: 32, fontSize: 11 }} onClick={() => stepMove(axis, +1)}>
                      +{axis}
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Controls under table */}
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          flexWrap="wrap" // ⬅️ allow wrapping to new line
          sx={{ mt: 2, rowGap: 1 }} // add small vertical gap when wrapped
        >
          <Typography sx={{ mr: 1 }}>Speed</Typography>
          <TextField
            value={speed}
            onChange={(e) => {
              const val = e.target.value;
              if (/^-?\d*\.?\d*$/.test(val)) setSpeed(val === "" ? 0 : Number(val));
            }}
            size="small"
            sx={{
              width: 90, // ⬅️ slightly wider so value fits
              "& .MuiInputBase-input": { padding: "4px 6px", fontSize: 12 },
            }}
          />

          <Button variant="contained" sx={{ height: 32, fontSize: 12 }} onClick={goto}>
            GoTo
          </Button>
          <Button variant="contained" sx={{ height: 32, fontSize: 12 }} onClick={setGantryPosition}>
            Set
          </Button>
          <Button variant="contained" sx={{ height: 32, fontSize: 12 }} onClick={reset}>
            Reset
          </Button>
          <Button variant="contained" sx={{ height: 32, fontSize: 12 }} onClick={getInfo}>
            Info
          </Button>
          <Button
            variant="contained"
            sx={{ height: 32, fontSize: 12 }}
            onClick={() => {
              setPosition(homePosition);
              fetch("/api/gantry/goto", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  x: Number(homePosition.X),
                  y: Number(homePosition.Y),
                  z: Number(homePosition.Z),
                  a: Number(homePosition.A),
                  speed: Number(speed),
                }),
              })
                .then((r) => r.json())
                .then((d) => console.log("Home response:", d))
                .catch((err) => console.error(err));
            }}
          >
            Home
          </Button>
        </Stack>
      </Box>

      {/* Right-side Camera Tabs */}
      <Box sx={{ flex: 1, minWidth: 420 }}>
        <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={cameraTab} onChange={handleCameraTabChange} variant="scrollable" scrollButtons="auto" aria-label="camera tabs">
            <Tab label="LitePlacer Down" />
            <Tab label="Board Up" />
            <Tab label="Digital Model" />
          </Tabs>
        </Box>

        {/* camera panel content */}
        <Box sx={{ mt: 2 }}>
          {cameraTab === 0 && (
            <Box sx={{ bgcolor: "#000", height: 300, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ color: "white" }}>LitePlacer Down — Camera Preview</Typography>
            </Box>
          )}
          {cameraTab === 1 && (
            <Box sx={{ bgcolor: "#000", height: 300, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ color: "white" }}>Board Up — Camera Preview</Typography>
            </Box>
          )}
          {cameraTab === 2 && (
            <Box sx={{ bgcolor: "#000", height: 300, borderRadius: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography sx={{ color: "white" }}>Digital Model — Preview</Typography>
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
