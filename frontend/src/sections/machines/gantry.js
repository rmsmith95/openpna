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
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import GantryControls from './gantry-controls';
import GripperControls from '../../components/gripper-controls';

export const Gantry = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  // Connection state
  const [connectedTinyG, setConnectedTinyG] = useState(false);
  const [connectedArduino, setConnectedArduino] = useState(false);
  const [connectedLitePlacerGripper, setConnectedLitePlacerGripper] = useState(false);
  const [tinyGPort, setTinyGPort] = useState('COM10');
  const [tinyGBaud, setTinyGBaud] = useState(115200);
  const [arduinoPort, setArduinoPort] = useState('COM3');
  const [arduinoBaud, setArduinoBaud] = useState(9600);
  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });

  const handleChange = (event, newValue) => setTab(newValue);
  const handleConnectTinyG = async () => {
    try {
      const res = await fetch("/api/gantry/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ PORT: tinyGPort, BAUD: tinyGBaud }),
      });
      const data = await res.json();
      if (data.status === "connected") setConnectedTinyG(true);
      else setConnectedTinyG(false);
    } catch (err) {
      console.error("LitePlacer connect failed:", err);
      setConnectedTinyG(false);
    }
  };

  const handleConnectArduino = async () => {
    try {
      const res = await fetch("/api/tool_changer/connect", {
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

  async function handleLockToolChanger() {
      await fetch("/api/tool_changer/lock", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ }),
      });
  }

  async function handleUnlockToolChanger() {
    await fetch("/api/tool_changer/unlock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ }),
    });
  }

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
                {connectedTinyG ? (
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
                TinyG
                <TextField label="Port" value={tinyGPort} onChange={(e) => setTinyGPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={tinyGBaud} onChange={(e) => setTinyGBaud(Number(e.target.value))} />
                <Button variant="contained" color="success" 
                  onClick={handleConnectTinyG} 
                  // disabled={connectedLitePlacer}
                  >Connect
                </Button>
              </Stack>

              {/* Connection controls */}
              <Stack direction="row" spacing={2} alignItems="center">
                Arduino
                <TextField label="Port" value={arduinoPort} onChange={(e) => setArduinoPort(e.target.value)} />
                <TextField label="Baud Rate" type="number" value={arduinoBaud} onChange={(e) => setArduinoBaud(Number(e.target.value))} />
                <Button variant="contained" color="success" 
                  onClick={handleConnectArduino} 
                  // disabled={connectedLitePlacer}
                  >Connect
                </Button>
                <Button variant="contained" onClick={handleLockToolChanger}>
                  Lock
                </Button>
                <Button variant="contained" onClick={handleUnlockToolChanger}>
                  Unlock
                </Button>
              </Stack>

              {/* Machine table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dimensions (mm)</TableCell>
                    <TableCell>Workspace</TableCell>
                    <TableCell>Max Load</TableCell>
                    <TableCell>Cad File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>700x500x300</TableCell>
                    <TableCell>560x360x80xinfdeg</TableCell>
                    <TableCell>3kg</TableCell>
                    <TableCell>liteplacer.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {tab === 1 && (
            <GantryControls
              connectedLitePlacer={connectedTinyG}
            />
          )}

          {tab === 2 && (
            <GripperControls
              connected={connectedLitePlacerGripper}
            />
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
  // value: PropTypes.string
};
