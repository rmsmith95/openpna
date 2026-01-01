import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, Tab, Box, Button, SvgIcon, TextField, MenuItem, Select, FormControl, InputLabel, Typography
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import Cobot280Controls from '../../components/cobot280-controls';

export const Cobot280 = (props) => {
  const { sx, value } = props;
  const [tab, setTab] = useState(0);

  const [connectionType, setConnectionType] = useState("network");
  const [connectedCobot280, setConnectedCobot280] = useState(false);
  const [port, setPort] = useState("COM4");
  const [baud, setBaud] = useState(115200);
  const [ipAddress, setIpAddress] = useState("10.163.187.60");

  const [joints, setJoints] = useState([0, 0, 0, 0, 0, 0]);
  const [step, setStep] = useState([5, 5, 5, 5, 5, 5]);
  const [speed, setSpeed] = useState(50);
  const handleChange = (_, newValue) => setTab(newValue);

  const handleConnectCobot280 = async () => {
    try {
      const res = await fetch("/api/cobot280/connect_network", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: ipAddress }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.angles)) {
        setConnectedCobot280(true);
        setJoints(data.angles.map(Number)); // ensure numeric
      }
      else {
        setConnectedCobot280(false);
      }
    } catch (err) {
      console.error("❌ Error fetching joint positions:", err);
    }
  };

  const fetchPositions = async () => {
    try {
      const res = await fetch("/api/cobot280/get_position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ipAddress: ipAddress }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.status === "ok" && Array.isArray(data.angles)) {
        setJoints(data.angles.map(Number)); // ensure numeric
      }
    } catch (err) {
      console.error("❌ Error fetching joint positions:", err);
    }
  };

  const moveJoint = async (jointIndex, deltaValue) => {
    const newAngles = [...joints];
    newAngles[jointIndex] += deltaValue;
    await moveJoints(newAngles);
  };
  
  const moveJoints = async (newAngles) => {
    try {
      const response = await fetch("/api/cobot280/set_angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ipAddress: ipAddress,
          angles: newAngles,
          speed: speed,
        }),
      });

      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      console.log("✅ SetAngles response:", data);

      if (data.status === "ok" || data.status === "sent") {
        // fetch updated positions from backend to avoid drift
        fetchPositions();
      }
    } catch (err) {
      console.error("❌ Error setting angles:", err);
    }
  };

  // fetch positions once on mount
  useEffect(() => {
    fetchPositions();
  }, []);

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
                  <span>Connection</span>
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
          </Tabs>
        </Box>

        {/* Panels */}
        <Box sx={{ mt: 2 }}>
          {/* Connection Tab */}
          {tab === 0 && (
            <Stack spacing={3}>
              <Stack spacing={2} direction="row" alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={connectionType}
                    label="Type"
                    onChange={(e) => setConnectionType(e.target.value)}
                  >
                    <MenuItem value="network">Network</MenuItem>
                    <MenuItem value="serial">Serial</MenuItem>
                  </Select>
                </FormControl>

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

                <Button
                  variant="contained"
                  color="success"
                  onClick={handleConnectCobot280}
                  // disabled={connectedCobot280}
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
            <Cobot280Controls
              axisData={axisData}
              step={step}
              setStep={setStep}
              speed={speed}
              setSpeed={setSpeed}
              joints={joints}
              moveJoint={moveJoint}
              moveJoints={moveJoints}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Cobot280.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired,
};
