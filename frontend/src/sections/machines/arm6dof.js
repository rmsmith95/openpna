import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, Tab, Box, Button, SvgIcon, TextField, MenuItem, Select, FormControl, InputLabel, Typography
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Arm6DOF = (props) => {
  const { sx, value } = props;
  const [tab, setTab] = useState(0);

  // Connection states
  const [connectedCobot280, setConnectedCobot280] = useState(false);
  const [connectedCobot280Gripper, setConnectedCobot280Gripper] = useState(false);

  const [connectionType, setConnectionType] = useState("serial"); // "serial" or "network"
  const [port, setPort] = useState("COM4");
  const [baud, setBaud] = useState(115200);
  const [ipAddress, setIpAddress] = useState("10.194.92.60");

  const [joints, setJoints] = useState([0, 0, 0, 0, 0, 0]);
  const [step, setStep] = useState([5, 5, 5, 5, 5, 5]); // per joint movement step

  const handleChange = (_, newValue) => setTab(newValue);

  const handleConnectCobot280 = async () => {
    try {
      let res;

      if (connectionType === "serial") {
        // Serial connection
        res = await fetch("/api/arm6dof/connect_serial", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ port, baud }),
        });
      } else {
        // Network connection
        res = await fetch("/api/arm6dof/connect_network", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ip: ipAddress }),
        });
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      if (data.status === "connected") {
        setConnectedCobot280(true);
      } else {
        setConnectedCobot280(false);
      }
    } catch (err) {
      console.error("Cobot280 connect failed:", err);
      setConnectedCobot280(false);
    }
  };

  const moveJoint = async (jointIndex, direction) => {
    if (!connectedCobot280) return;

    try {
      const response = await fetch("/api/arm6dof/move_joint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          joint: jointIndex,
          direction: direction,                 // "left" or "right"
          delta: step[jointIndex] || 5,         // movement amount
          speed: 50,                            // optional speed override
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ MoveJoint response:", data);

      // update local state only if backend confirmed move
      if (data.status === "ok" || data.status === "sent") {
        const newJoints = [...joints];
        newJoints[jointIndex] +=
          direction === "left" ? -step[jointIndex] : step[jointIndex];
        setJoints(newJoints);
      }
    } catch (err) {
      console.error("❌ Error moving joint:", err);
    }
  };

  const axisData = [
    { joint: "J1", max: 360 },
    { joint: "J2", max: 150 },
    { joint: "J3", max: 300 },
    { joint: "J4", max: 300 },
    { joint: "J5", max: 300 },
    { joint: "J6", max: 300 },
  ];

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
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Cobot280</span>
                  {connectedCobot280 ? (
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
            <Tab label="Joints" />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Gripper</span>
                  {connectedCobot280Gripper ? (
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

        {/* Panels */}
        <Box sx={{ mt: 2 }}>
          {/* Connection Tab */}
          {tab === 0 && (
            <Stack spacing={3}>
              <Stack spacing={2} direction="row" alignItems="center">
                {/* Connection Type */}
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={connectionType}
                    label="Type"
                    onChange={(e) => setConnectionType(e.target.value)}
                  >
                    <MenuItem value="serial">Serial</MenuItem>
                    <MenuItem value="network">Network</MenuItem>
                  </Select>
                </FormControl>

                {/* Serial or IP Input */}
                {connectionType === "serial" ? (
                  <>
                    <TextField
                      label="Port"
                      value={port}
                      onChange={(e) => setPort(e.target.value)}
                    />
                    <TextField
                      label="Baud Rate"
                      type="number"
                      value={baud}
                      onChange={(e) => setBaud(Number(e.target.value))}
                    />
                  </>
                ) : (
                  <TextField
                    label="IP Address"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                  />
                )}

                {/* Connect Button */}
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleConnectCobot280}
                  disabled={connectedCobot280}
                >
                  Connect
                </Button>
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

          {/* Joints Tab */}
          {tab === 1 && (
            <Stack spacing={2}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Joint</TableCell>
                    <TableCell>Angle (deg)</TableCell>
                    <TableCell>Max (deg)</TableCell>
                    <TableCell>Step (deg)</TableCell>
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
                          value={step[index]}
                          size="small"
                          onChange={(e) => {
                            const val = e.target.value; if (/^-?\d*\.?\d*$/.test(val)) {
                              const newStep = [...step]; newStep[index] = val; setStep(newStep)
                            }
                          }}
                          sx={{ width: 80, '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13, }, }} />
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => moveJoint(index, "left")}
                          >
                            <SvgIcon component={ArrowLeftIcon} />
                          </Button>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => moveJoint(index, "right")}
                          >
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

          {/* Gripper Tab */}
          {tab === 2 && (
            <Stack spacing={2}>
              <Typography variant="body2">Gripper controls here...</Typography>
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
  value: PropTypes.string.isRequired,
};
