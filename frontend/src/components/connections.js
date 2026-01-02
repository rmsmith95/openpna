import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, Tab, Box, Button, SvgIcon, TextField, MenuItem, Select, FormControl, InputLabel, Typography
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Connections = (props) => {
  const { connectedTinyG, setConnectedTinyG, connectedArduino, setConnectedArduino, connectedCobot280, setConnectedCobot280, connectedServoGripper, setConnectedServoGripper } = props;
  const [tab, setTab] = useState(0);
  // tinyG
  const [tinyGPort, setTinyGPort] = useState('COM10');
  const [tinyGBaud, setTinyGBaud] = useState(115200);
  // arduino
  const [arduinoPort, setArduinoPort] = useState('COM3');
  const [arduinoBaud, setArduinoBaud] = useState(9600);
  // cobot
  const [cobotConnectionType, setCobotConnectionType] = useState("network");
  const [cobotPort, setCobotPort] = useState("COM4");
  const [cobotBaud, setCobotBaud] = useState(115200);
  const [cobotIpAddress, setCobotIpAddress] = useState("10.163.187.60");  //rpi

  const handleChange = (_, newValue) => setTab(newValue);
  
  const handleConnectTinyG = async () => {
    try {
      const res = await fetch("/api/tinyg/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: tinyGPort, baud: tinyGBaud }),
      });
      const data = await res.json();
      console.log(data.status)
      if (data.status === "connected") setConnectedTinyG(true);
      else setConnectedTinyG(false);
    } catch (err) {
      console.error("Gantry connect failed:", err);
      setConnectedTinyG(false);
    }
  };

  const handleConnectGripperServo = async () => {
    try {
      const res = await fetch("/api/gripper/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ servo_id: 1 }),
      });

      const data = await res.json();
      console.log("Gripper status:", data);

      setConnectedServoGripper(!!data.connected);
    } catch (err) {
      console.error("Gantry connect failed:", err);
      setConnectedServoGripper(false);
    }
  };

    const handleConnectArduino = async () => {
    try {
      const res = await fetch("/api/arduino/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: arduinoPort, baud: arduinoBaud }),
      });
      const data = await res.json();
      console.log("status:", data.status)
      if (data.status === "connected") setConnectedArduino(true);
      else setConnectedArduino(false);
    } catch (err) {
      console.error("Arduino connect failed:", err);
      setConnectedArduino(false);
    }
  };

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

  return (
    <Card>
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
                  <span>TinyG</span>
                  {connectedTinyG ? (
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
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Arduino</span>
                  {connectedArduino ? (
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
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>ESP32</span>
                  {connectedServoGripper ? (
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

        <Box sx={{ mt: 2 }}>
          {/* Connect TinyG */}
          {tab === 0 && (
            <Stack spacing={2} alignItems="flex-start">
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="Port" value={tinyGPort} onChange={(e) => setTinyGPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={tinyGBaud} onChange={(e) => setTinyGBaud(Number(e.target.value))} />
                <Button variant="contained" color="success"
                  onClick={handleConnectTinyG}
                >Connect
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Connect Arduino */}
          {tab === 1 && (
            <Stack spacing={2} alignItems="flex-start">
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="Port" value={arduinoPort} onChange={(e) => setArduinoPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={arduinoBaud} onChange={(e) => setArduinoBaud(Number(e.target.value))} />
                <Button variant="contained" color="success"
                  onClick={handleConnectArduino}
                >Connect
                </Button>
              </Stack>
            </Stack>
          )}

          {/* Connection Cobot280 */}
          {tab === 2 && (
            <Stack spacing={3}>
              <Stack spacing={2} direction="row" alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={cobotConnectionType}
                    label="Type"
                    onChange={(e) => setCobotConnectionType(e.target.value)}
                  >
                    <MenuItem value="network">Network</MenuItem>
                    <MenuItem value="serial">Serial</MenuItem>
                  </Select>
                </FormControl>

                {cobotConnectionType === "serial" ? (
                  <>
                    <TextField
                      label="Port"
                      value={cobotPort}
                      onChange={(e) => setCobotPort(e.target.value)}
                    />
                    <TextField
                      label="Baud Rate"
                      type="number"
                      value={cobotBaud}
                      onChange={(e) => setCobotBaud(Number(e.target.value))}
                    />
                  </>
                ) : (
                  <TextField
                    label="IP Address"
                    value={cobotIpAddress}
                    onChange={(e) => setCobotIpAddress(e.target.value)}
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

            </Stack>
          )}

          {/* Connect ESP32 */}
          {tab === 3 && (
            <Stack spacing={2} alignItems="flex-start">
              <Stack direction="row" spacing={2} alignItems="center">
                <TextField label="Port" value={arduinoPort} onChange={(e) => setArduinoPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={arduinoBaud} onChange={(e) => setArduinoBaud(Number(e.target.value))} />
                <Button variant="contained" color="success"
                  onClick={handleConnectGripperServo}
                >Connect
                </Button>
              </Stack>
            </Stack>
          )}

        </Box>
      </CardContent>
    </Card>
  );
};

Connections.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired,
};
