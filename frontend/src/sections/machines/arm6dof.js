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
  const [connected, setConnected] = useState(false);
  const [port, setPort] = useState('COM4');
  const [baud, setBaud] = useState(115200);
  const [joints, setJoints] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    let interval;
    if (connected) {
      getPosition();
      interval = setInterval(getPosition, 500);
    }
    return () => clearInterval(interval);
  }, [connected]);

  const handleChange = (_, newValue) => setTab(newValue);

  const handleConnect = async () => {
    try {
      const res = await fetch("http://localhost:8000/arm6dof/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port, baud }),
      });
      const data = await res.json();
      if (data.status === "connected") setConnected(true);
    } catch (err) {
      console.error(err);
      setConnected(false);
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

  const moveJoint = async (jointIndex, direction, delta = 5, speed = 50) => {
    if (!connected) return;
    const newJoints = [...joints];
    newJoints[jointIndex] += direction === "left" ? -delta : delta;
    try {
      await fetch("http://localhost:8000/arm6dof/move", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ joints: newJoints, speed }),
      });
      await getPosition();
    } catch (err) {
      console.error(err);
    }
  };

  const axisData = [
    { joint: 'J1', min: 0, max: 360 },
    { joint: 'J2', min: 0, max: 150 },
    { joint: 'J3', min: 0, max: 300 },
    { joint: 'J4', min: 0, max: 300 },
    { joint: 'J5', min: 0, max: 300 },
    { joint: 'J6', min: 0, max: 300 },
  ];

  return (
    <Card sx={sx}>
      <CardContent sx={{ pt: 0 }}>
        <Box sx={{ mt: 3 }}>
          <Tabs value={tab} onChange={handleChange} textColor="primary" indicatorColor="primary" sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Cobot280" />
            <Tab label="Joints" />
            <Tab label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Gripper</span>
                {connected ? (
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
                <Button variant="contained" color="success" onClick={handleConnect} disabled={connected}>Connect</Button>
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
            <Stack spacing={3}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Joint</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Max</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {axisData.map((row, index) => (
                    <TableRow key={row.joint}>
                      <TableCell>{row.joint}</TableCell>
                      <TableCell>{row.min}</TableCell>
                      <TableCell>{joints[index]}</TableCell>
                      <TableCell>{row.max}</TableCell>
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

Arm6DOF.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
