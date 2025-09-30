// components/GantryControls.jsx
import PropTypes from "prop-types";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { useState } from "react";

const GantryControls = ({ connectedLitePlacer }) => {
  const [moveMode, setMoveMode] = useState("G91"); // default relative
  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [step, setStep] = useState({ X: 5, Y: 5, Z: 2, A: 45 }); // default step per axis
  const [speed, setSpeed] = useState(500);

  const makeRelative = async (makeRelative) => {
    try {
      // Send command only if needed
      if (makeRelative && moveMode != "G91") {
        console.log("Switching to relative mode (G91)...");
        await fetch("/api/gantry/tinyg_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "G91" }),
        });
        setMoveMode("G91")
      } else if (!makeRelative && moveMode != "G90") {
        console.log("Switching to absolute mode (G90)...");
        await fetch("/api/gantry/tinyg_send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ command: "G90" }),
        });
        setMoveMode("G90")
      } else {
        console.log("Error setting movement mode:");
      }
    } catch (err) {
      console.error("Error setting movement mode:", err);
    }
  }

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
        let relative = false;

        lines.forEach(line => {
          let m;
          if ((m = line.match(/X position:\s*([-0-9.]+)/))) positions.X = parseFloat(m[1]);
          if ((m = line.match(/Y position:\s*([-0-9.]+)/))) positions.Y = parseFloat(m[1]);
          if ((m = line.match(/Z position:\s*([-0-9.]+)/))) positions.Z = parseFloat(m[1]);
          if ((m = line.match(/A position:\s*([-0-9.]+)/))) positions.A = parseFloat(m[1]);

          let relative = false;
          if (line.includes("Distance mode:")) {
            relative = line.includes("G91");
          }
          setMoveMode(relative ? "G91" : "G90");
        });

        setPosition(positions);
        setMoveMode(moveMode);

        console.log("Parsed positions:", positions, "Relative mode:", relative);
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

  const moveGantry = async (axis, direction) => {
    if (!connectedLitePlacer) return;

    makeRelative(true)
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

      const res = await fetch("/api/gantry/move", {
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
              <TableCell>Max XYZ</TableCell>
              <TableCell>Step Size</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {['X', 'Y', 'Z', 'A'].map(axis => (
              <TableRow key={axis}>
                <TableCell>{axis.toUpperCase()}</TableCell>
                <TableCell>{position[axis]}</TableCell>
                <TableCell>
                  {axis === 'X' ? 600 : axis === 'Y' ? 400 : axis === 'Z' ? 200 : 360}
                </TableCell>
                <TableCell>
                  <TextField
                    type="number"
                    value={step[axis]}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13 } }}
                    onChange={(e) => setStep({ ...step, [axis]: Number(e.target.value) })}
                    size="small"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Speed control under table */}
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            type="number"
            inputProps={{ step: 0.01 }}
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            size="small"
          />
          <Button variant="contained" sx={{ width: 50, height: 50 }} onClick={() => reset()}>
            Reset
          </Button>
          <Button variant="contained" sx={{ width: 50, height: 50 }} onClick={() => tinyg_send("?")}>
            ?
          </Button>
        </Stack>
      </Stack>

      {/* Controls Panel */}
      <Stack direction="row" paddingTop={1} spacing={2} alignItems="flex-start">
        {/* X/Y Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("Y", +1)}>
            +Y
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("X", -1)}>
              -X
            </Button>
            <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
              <Button variant="contained" sx={{ width: 60, height: 60 }}
                onClick={getInfo}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                P
              </Button>
            </Box>
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("X", +1)}>
              +X
            </Button>
          </Stack>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("Y", -1)}>
            -Y
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("A", -1)}>
              -R
            </Button>
            <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
            </Box>
            <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("A", +1)}>
              +R
            </Button>
          </Stack>
        </Box>

        {/* Z Controls */}
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1, marginTop: 0 }}>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("Z", +1)}>
            +Z
          </Button>
          <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
          </Box>
          <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("Z", -1)}>
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
