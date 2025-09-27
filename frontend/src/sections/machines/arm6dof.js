import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, Tab, Box, Button, SvgIcon, Typography, TextField
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Arm6DOF = (props) => {
  const { sx, value } = props;
  const [tab, setTab] = useState(0);
  const [connectedCobot280, setConnectedCobot280] = useState(false);
  const [connectedCobot280Gripper, setConnectedCobot280Gripper] = useState(false);
  const [port, setPort] = useState('COM4');
  const [baud, setBaud] = useState(115200);
  const [joints, setJoints] = useState([0, 0, 0, 0, 0, 0]);
  const [speed, setSpeed] = useState([50, 50, 50, 50, 50, 50]); // speed per joint

  // useEffect(() => {
  //   let interval;
  //   if (connected) {
  //     getPosition();
  //     interval = setInterval(getPosition, 500);
  //   }
  //   return () => clearInterval(interval);
  // }, [connected]);

  const handleChange = (_, newValue) => setTab(newValue);
  const handleConnectCobot280 = async () => {
    try {
      const res = await fetch("/api/arm6dof/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port, baud }),
      });
      const data = await res.json();
      if (data.status === "connected") setConnectedCobot280(true);
      else setConnectedCobot280(false);
    } catch (err) {
      console.error("Cobot280 connect failed:", err);
      setConnectedCobot280(false);
    }
  };

  const getPosition = async () => {
    if (!connected) return;
    try {
      const res = await fetch("http://localhost:8000/arm6dof/get_position");
      const data = await res.json();
      if (data.status === "ok") setJoints(data.joints);
    } catch (err) {
      console.error(err);
    }
  };

  const moveJoint = async (jointIndex, direction, delta = 5) => {
    if (!connected) return;
    const newJoints = [...joints];
    newJoints[jointIndex] += direction === "left" ? -delta : delta;
    try {
      await fetch("http://localhost:8000/arm6dof/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joints: newJoints, speed: speed[jointIndex] }),
      });
      await getPosition();
    } catch (err) {
      console.error(err);
    }
  };

  const axisData = [
    { joint: 'J1', max: 360 },
    { joint: 'J2', max: 150 },
    { joint: 'J3', max: 300 },
    { joint: 'J4', max: 300 },
    { joint: 'J5', max: 300 },
    { joint: 'J6', max: 300 },
  ];

  return (
    <Card sx={sx}>
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ mt: 3 }}>
          <Tabs value={tab} onChange={handleChange} textColor="primary" indicatorColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Cobot280</span>
                {connectedCobot280 ? (
                  <SvgIcon fontSize="small" color="success"><CheckCircleIcon /></SvgIcon>
                ) : (
                  <SvgIcon fontSize="small" color="error"><XCircleIcon /></SvgIcon>
                )}
              </Stack>
            } />
            <Tab label="Joints" />
            <Tab label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Gripper</span>
                {connectedCobot280 ? (
                  <SvgIcon fontSize="small" color="success"><CheckCircleIcon /></SvgIcon>
                ) : (
                  <SvgIcon fontSize="small" color="error"><XCircleIcon /></SvgIcon>
                )}
              </Stack>
            } />
          </Tabs>
        </Box>

        <Box sx={{ mt: 2 }}>
          {/* Cobot280 tab */}
          {tab === 0 && (
            <Stack spacing={3}>
              <Stack spacing={2} direction="row" alignItems="center">
                <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={baud} onChange={(e) => setBaud(Number(e.target.value))} />
                <Button variant="contained" color="success" onClick={handleConnectCobot280} disabled={connectedCobot280}>Connect</Button>
              </Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reach (mm)</TableCell>
                    <TableCell>Max Load</TableCell>
                    <TableCell>Cad File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>400</TableCell>
                    <TableCell>500g</TableCell>
                    <TableCell>cobot280.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {/* Joints tab */}
          {tab === 1 && (
            <Stack spacing={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Joint</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Speed</TableCell>
                    <TableCell>Controls</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {axisData.map((row, index) => (
                    <TableRow key={row.joint}>
                      <TableCell>{row.joint}</TableCell>
                      <TableCell>{joints[index]}</TableCell>
                      <TableCell>{row.max}</TableCell>
                      <TableCell>
                        <TextField
                          type="number"
                          value={speed[index]}
                          size="small"
                          onChange={(e) => {
                            const newSpeed = [...speed];
                            newSpeed[index] = Number(e.target.value);
                            setSpeed(newSpeed);
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button variant="contained" size="small" onClick={() => moveJoint(index, "left")}>
                            <SvgIcon component={ArrowLeftIcon} />
                          </Button>
                          <Button variant="contained" size="small" onClick={() => moveJoint(index, "right")}>
                            <SvgIcon component={ArrowRightIcon} />
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}

          {/* Gripper tab */}
          {tab === 2 && (
            <Stack spacing={2}>
              <Stack spacing={2} direction="row" alignItems="center">
                <Button variant="contained" color="success" onClick={handleConnect}>Connect</Button>
                <TextField label="Port" value={port} onChange={(e) => setPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={baud} onChange={(e) => setBaud(Number(e.target.value))} />
                <Button variant="contained" color="primary" onClick={() => console.log("Attach")}>Attach</Button>
                <Button variant="outlined" color="secondary" onClick={() => console.log("Detach")}>Detach</Button>
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

Arm6DOF.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
