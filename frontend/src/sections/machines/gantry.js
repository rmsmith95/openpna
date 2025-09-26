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
  const [connected, setConnected] = useState(false);
  const [port, setPort] = useState('COM3');   // Windows example
  const [baud, setBaud] = useState(115200);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let interval;
    if (connected) {
      getPosition(); // initial fetch
      interval = setInterval(getPosition, 500); // update every 0.5s
    }
    return () => clearInterval(interval);
  }, [connected]);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleConnect = async () => {
    try {
      const res = await fetch("/api/gantry/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port, baud }),
      });
      const data = await res.json();
      if (data.status === "connected") {
        setConnected(true);
      } else {
        console.error("Connect failed:", data.message);
        setConnected(false);
      }
    } catch (err) {
      console.error("Failed to connect:", err);
      setConnected(false);
    }
  };

  const getPosition = async () => {
    if (!connected) return;

    try {
      const res = await fetch("/api/gantry/get_position");
      const data = await res.json();
      if (data.status === "ok") {
        setPosition(data.position);
      }
    } catch (err) {
      console.error("Error getting gantry position:", err);
    }
  };

  const moveGantry = async (axis, direction, step = 1, speed = 150) => {
    if (!connected) {
      console.warn("Gantry not connected!");
      return;
    }

    // Get current position (optional: could track in state)
    const resPos = await fetch("/api/gantry/get_position");
    const posData = await resPos.json();
    let { x, y, z } = posData.position || { x: 0, y: 0, z: 0 };

    // Update axis by direction
    switch (axis) {
      case "x":
        x += direction * step;
        break;
      case "y":
        y += direction * step;
        break;
      case "z":
        z += direction * step;
        break;
      default:
        console.error("Invalid axis:", axis);
        return;
    }

    // Send move command
    try {
      const res = await fetch("/api/gantry/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x, y, z, speed }),
      });

      const data = await res.json();
      console.log("Move response:", data);
      // Update position after move
      await getPosition();
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
            <Tab label="LitePlacer1" />
            <Tab label="Axis" />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Gripper</span>
                  {connected ? (
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
            <Box sx={{ mt: 2 }}>
              {tab === 0 && (
                // LitePlacer1
                <Stack spacing={2} alignItems="flex-start">
                  {/* Connection controls */}
                  <Stack direction="row" spacing={2} alignItems="center">
                    <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                    <TextField label="Baud Rate" type="number" value={baud} onChange={(e) => setBaud(Number(e.target.value))} />
                    <Button variant="contained" color="success" onClick={handleConnect} disabled={connected}>Connect</Button>
                  </Stack>

                  {/* Table below connection */}
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
            </Box>

          )}

          {tab === 1 && (
            <Stack direction="row" spacing={4} alignItems="flex-start">
              {/* Table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Axis</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>X</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>{position.x}</TableCell>
                    <TableCell>600</TableCell>
                    <TableCell>3mm/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Y</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>{position.y}</TableCell>
                    <TableCell>400</TableCell>
                    <TableCell>3mm/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Z</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>{position.z}</TableCell>
                    <TableCell>300</TableCell>
                    <TableCell>3mm/s</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Controls Panel */}
              <Stack direction="row" spacing={2} alignItems="center">
                {/* X/Y D-Pad */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("y", +1)}>
                    <SvgIcon component={ArrowUpIcon} />
                  </Button>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("x", -1)}>
                      <SvgIcon component={ArrowLeftIcon} />
                    </Button>
                    <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
                      <Typography>X/Y</Typography>
                    </Box>
                    <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("x", +1)}>
                      <SvgIcon component={ArrowRightIcon} />
                    </Button>
                  </Stack>
                  <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("y", -1)}>
                    <SvgIcon component={ArrowDownIcon} />
                  </Button>
                </Box>

                {/* Z Controls */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("z", +1)}>
                    <SvgIcon component={ArrowUpIcon} />
                  </Button>
                  <Box sx={{ width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #ccc', borderRadius: 1 }}>
                    <Typography>Z</Typography>
                  </Box>
                  <Button variant="contained" sx={{ width: 60, height: 60 }} onClick={() => moveGantry("z", -1)}>
                    <SvgIcon component={ArrowDownIcon} />
                  </Button>
                </Box>
              </Stack>
            </Stack>
          )}


          {tab === 2 && (
            <Stack spacing={2}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Button variant="contained" color="success" onClick={handleConnect} disabled={connected}>Connect</Button>
                <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={baud} onChange={(e) => setBaud(Number(e.target.value))} />
                <Button variant="contained" color="primary" onClick={() => console.log("Attach")}>Attach</Button>
                <Button variant="outlined" color="secondary" onClick={() => console.log("Detach")}>Detach</Button>
              </Stack>
              <Stack direction="row" spacing={2}>
              </Stack>
              {/* Gripper Width Table */}
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
                        <Button
                          variant="contained"
                          sx={{ width: 40, height: 35 }}
                          onClick={() => console.log("Decrease width")}
                        >
                          <SvgIcon component={ArrowLeftIcon} />
                        </Button>
                        <Button
                          variant="contained"
                          sx={{ width: 40, height: 35 }}
                          onClick={() => console.log("Increase width")}
                        >
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
