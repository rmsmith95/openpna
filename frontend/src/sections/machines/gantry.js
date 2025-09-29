import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Tabs,
  Tab,
  Box,
  Button,
  SvgIcon,
  Typography,
  TextField
} from '@mui/material';
import ArrowUpIcon from '@heroicons/react/24/solid/ArrowUpIcon';
import ArrowDownIcon from '@heroicons/react/24/solid/ArrowDownIcon';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Gantry = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  // Connection state
  const [connectedLitePlacer, setConnectedLitePlacer] = useState(false);
  const [connectedLitePlacerGripper, setConnectedLitePlacerGripper] = useState(false);
  const [port, setPort] = useState('COM10');
  const [baud, setBaud] = useState(115200);
  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [speed, setSpeed] = useState(0.5);
  const [step, setStep] = useState({ X: 5, Y: 5, Z: 2, A: 45 }); // default step per axis
  const [moveMode, setMoveMode] = useState("unknown");

  const handleChange = (event, newValue) => setTab(newValue);
  const handleConnectLitePlacer = async () => {
    try {
      const res = await fetch("/api/gantry/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port, baud }),
      });
      const data = await res.json();
      if (data.status === "connected") setConnectedLitePlacer(true);
      else setConnectedLitePlacer(false);
    } catch (err) {
      console.error("LitePlacer connect failed:", err);
      setConnectedLitePlacer(false);
    }
  };

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
    <Card sx={sx}>
      <CardContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>LitePlacer1</span>
                {connectedLitePlacer ? (
                  <SvgIcon fontSize="small" color="success"><CheckCircleIcon /></SvgIcon>
                ) : (
                  <SvgIcon fontSize="small" color="error"><XCircleIcon /></SvgIcon>
                )}
              </Stack>
            } />
            <Tab label="Axis" />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Gripper</span>
                  {connectedLitePlacerGripper ? (
                    <SvgIcon fontSize="small" color="success">
                      <CheckCircleIcon />
                    </SvgIcon>
                  ) : (
                    <SvgIcon fontSize="small" color="error">
                      <XCircleIcon />
                    </SvgIcon>
                  )}
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Stack spacing={2} alignItems="flex-start">
              {/* Connection controls */}
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={baud} onChange={(e) => setBaud(Number(e.target.value))} />
                <Button variant="contained" color="success" 
                  onClick={handleConnectLitePlacer} 
                  // disabled={connectedLitePlacer}
                  >Connect
                </Button>
              </Stack>

              {/* Machine table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dimensions (mm)</TableCell>
                    <TableCell>Max Load</TableCell>
                    <TableCell>Cad File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>700x500x300</TableCell>
                    <TableCell>3kg</TableCell>
                    <TableCell>liteplacer.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {tab === 1 && (
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
                  {/* <Typography variant="body2">Unlock</Typography>
                  <TextField
                    type="number"
                    value={speed}
                    sx={{ '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13, width: 60 } }}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    size="small"
                  /> */}
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
          )}

          {tab === 2 && (
            <Stack spacing={2}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Button variant="contained" color="success" disabled={connectedLitePlacerGripper}>Connect</Button>
                <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={baud} onChange={(e) => setBaud(Number(e.target.value))} />
                <Button variant="contained" color="primary" onClick={() => console.log("Attach")}>Attach</Button>
                <Button variant="outlined" color="secondary" onClick={() => console.log("Detach")}>Detach</Button>
              </Stack>
              <Table size="small" sx={{ minWidth: 250 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Min Width (mm)</TableCell>
                    <TableCell>Current Width (mm)</TableCell>
                    <TableCell>Max Width (mm)</TableCell>
                    <TableCell>Controls</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>0</TableCell>
                    <TableCell>20</TableCell>
                    <TableCell>60</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button variant="contained" sx={{ width: 40, height: 35 }} onClick={() => console.log("Decrease width")}>
                          <SvgIcon component={ArrowLeftIcon} />
                        </Button>
                        <Button variant="contained" sx={{ width: 40, height: 35 }} onClick={() => console.log("Increase width")}>
                          <SvgIcon component={ArrowRightIcon} />
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Gantry.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
