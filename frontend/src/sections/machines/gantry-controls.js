// components/GantryControls.jsx
import PropTypes from "prop-types";
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
} from "@mui/material";
import { useState } from "react";

const GantryControls = ({ connectedLitePlacer }) => {
  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [homePosition, setHonePosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [step, setStep] = useState({ X: 5, Y: 5, Z: 2, A: 45 }); // default step per axis
  const [speed, setSpeed] = useState(3000);

  const getInfo = async () => {
    if (!connectedLitePlacer) return;

    try {
      const res = await fetch("/api/gantry/get_info");
      const data = await res.json();
      console.log("Raw TinyG response:", data);

      if (data.status === "ok" && Array.isArray(data.response)) {
        const lines = data.response;

        // Parse X/Y/Z/A positions
        const positions = { X: 0, Y: 0, Z: 0, A: 0 };
        lines.forEach(line => {
          let m;
          if ((m = line.match(/X position:\s*([-0-9.]+)/))) positions.X = parseFloat(m[1]);
          if ((m = line.match(/Y position:\s*([-0-9.]+)/))) positions.Y = parseFloat(m[1]);
          if ((m = line.match(/Z position:\s*([-0-9.]+)/))) positions.Z = parseFloat(m[1]);
          if ((m = line.match(/A position:\s*([-0-9.]+)/))) positions.A = parseFloat(m[1]);
        });
        setPosition(positions);
      }

    } catch (err) {
      console.error("Error getting gantry position:", err);
    }
  };

  const reset = async () => {
    console.log("resetting...");
    const res = await fetch("/api/gantry/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const data = await res.json();
    console.log("Reset response:", data);
  };

  const setGantryPosition = async () => {
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
  };

  const tinyg_send = async (command) => {
    console.log("sending TinyG command:", command);

    const res = await fetch("/api/gantry/tinyg_send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ command }),
    });

    const data = await res.json();
    console.log("TinyG response:", data);
    return data;
  };

  const goto = async () => {
    if (!connectedLitePlacer) return;

    try {
      console.log("GoTo:", {
        x: position.X,
        y: position.Y,
        z: position.Z,
        a: position.A,
        speed
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

  const stepMove = async (axis, direction) => {
    if (!connectedLitePlacer) return;

    try {
      const delta = Number(step[axis]); // step size
      const moveValue = direction * delta;

      // Build a move object with only the axis to move, others 0
      const move = { X: 0, Y: 0, Z: 0, A: 0 };
      if (["X", "Y", "Z", "A"].includes(axis)) {
        move[axis] = moveValue;
      } else {
        return;
      }

      const res = await fetch("/api/gantry/step", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          x: move.X,
          y: move.Y,
          z: move.Z,
          a: move.A,
          speed: Number(speed)
        }),
      });

      console.log("Move:", { ...move, speed });
      const data = await res.json();
      console.log("Move response:", data);

    } catch (err) {
      console.error("Error moving gantry:", err);
    }
  };

  return (
    <Stack direction="row" spacing={4} alignItems="flex-start">
      {/* Axis Table */}
      <Stack spacing={2}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Axis</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Max</TableCell>
              <TableCell>Step Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {['X', 'Y', 'Z', 'A'].map(axis => (
              <TableRow key={axis}>
                <TableCell>
                  <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
                    {axis.toUpperCase()}
                    <Typography variant="body2">{axis === 'A' ? '(deg)' : '(mm)'}</Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <TextField
                    value={position[axis]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^-?\d*\.?\d*$/.test(val)) { setPosition({ ...position, [axis]: val }); }
                    }}
                    size="small"
                    sx={{ width: 80, '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13, }, }} />
                </TableCell>
                <TableCell>
                  {axis === 'X' ? 600 : axis === 'Y' ? 400 : axis === 'Z' ? 200 : 360}
                </TableCell>
                <TableCell>
                  <TextField
                    value={step[axis]}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^-?\d*\.?\d*$/.test(val)) { setStep({ ...step, [axis]: val }); }
                    }}
                    size="small"
                    sx={{ width: 80, '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13, }, }} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography sx={{ mr: 1 }}>Speed</Typography>
          <TextField
            value={speed}
            onChange={(e) => {
              const val = e.target.value;
              if (/^-?\d*\.?\d*$/.test(val)) { setSpeed(val === '' ? 0 : val); }
            }}
            size="small"
            sx={{ width: 80, '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13, }, }}>
          </TextField>
          <Button variant="contained" sx={{ height: 32 }} onClick={() => goto(position)}>
            GoTo
          </Button>
          <Button variant="contained" sx={{ height: 32 }} onClick={() => setGantryPosition()}>
            Set P
          </Button>
          <Button variant="contained" sx={{ height: 32 }} onClick={() => reset()}>
            Reset
          </Button>
          <Button variant="contained" sx={{ height: 32 }} onClick={() => getInfo()}>
            Info
          </Button>
          <Button variant="contained" sx={{ height: 32 }} onClick={() => goto(homePosition)}>
            Home
          </Button>
        </Stack>
      </Stack>

      {/* Controls Panel */}
      <Stack direction="row" paddingTop={1} spacing={2} alignItems="flex-start">
        {/* X/Y Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("Y", +1)}>
            +Y
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("X", -1)}>
              -X
            </Button>
            <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
            </Box>
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("X", +1)}>
              +X
            </Button>
          </Stack>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("Y", -1)}>
            -Y
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("A", -1)}>
              -R
            </Button>
            <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
            </Box>
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("A", +1)}>
              +R
            </Button>
          </Stack>
        </Box>

        {/* Z Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, marginTop: 0 }}>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("Z", +1)}>
            +Z
          </Button>
          <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
          </Box>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => stepMove("Z", -1)}>
            -Z
          </Button>
        </Box>
      </Stack>
    </Stack>
  );
};

GantryControls.propTypes = {
  connection: PropTypes.object,
};

export default GantryControls;
