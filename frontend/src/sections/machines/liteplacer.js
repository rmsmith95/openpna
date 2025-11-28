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
import LiteplacerControls from '../../components/liteplacer-controls';
import LiteplacerActions from '../../components/liteplacer-actions';
import GripperControls from '../../components/gripper-controls';
import { useFactory } from "src/utils/factory-context";


export const Liteplacer = (props) => {
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
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const { setGantryPosition } = useFactory();

  const handleChange = (event, newValue) => setTab(newValue);
  const handleConnectTinyG = async () => {
    try {
      const res = await fetch("/api/liteplacer/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ port: tinyGPort, baud: tinyGBaud }),
      });
      const data = await res.json();
      console.log(data.status)
      if (data.status === "connected") setConnectedTinyG(true);
      else setConnectedTinyG(false);
    } catch (err) {
      console.error("LitePlacer connect failed:", err);
      setConnectedTinyG(false);
    }
  };

  // Poll gantry info
  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await fetch("/api/liteplacer/get_info");
        const data = await res.json();
        const positions = { x: 0, y: 0, z: 0, a: 0 };

        if (Array.isArray(data.status)) {
          data.status.forEach((item) => {
            const raw = item.raw ?? JSON.stringify(item);
            let m;
            if ((m = raw.match(/X position:\s*([-0-9.]+)/))) positions.x = parseFloat(m[1]);
            if ((m = raw.match(/Y position:\s*([-0-9.]+)/))) positions.y = parseFloat(m[1]);
            if ((m = raw.match(/Z position:\s*([-0-9.]+)/))) positions.z = parseFloat(m[1]);
            if ((m = raw.match(/A position:\s*([-0-9.]+)/))) positions.a = parseFloat(m[1]);
          });
        }

        setPosition(positions);
        setGantryPosition(positions);
      } catch (err) {
        console.error("Error getting gantry position:", err);
      }
    };

    getInfo();
    const interval = setInterval(getInfo, 1000);
    return () => clearInterval(interval);
  }, [setGantryPosition]);


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

  async function handleUnlockToolChanger(time_s) {
    await fetch("/api/tool_changer/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({time_s}),
    });
  }

  const goto = async (gotoPosition, speed) => {
    try {
      const res = await fetch("/api/liteplacer/goto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gotoPosition, speed }),
      });
      console.log("GoTo response:", await res.json());
    } catch (err) {
      console.error("GoTo error:", err);
    }
  };

  // --- Send open/close commands ---
  async function stepOpenGripper(time = 1, speed) {
    await fetch("/api/gripper/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, speed }),
    });
  }

  async function stepCloseGripper(time = 1, speed) {
    await fetch("/api/gripper/close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time, speed }),
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
            <Tab label="Step" />
            <Tab label="Actions" />
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
            <Box
              sx={{
                borderRadius: 2,
                width: 220,
                textAlign: "center",
                py: 1.5
              }}
            >
              <Typography variant="h6">
                P: {position.x} {position.y} {position.z} {position.a}
              </Typography>
            </Box>

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
                <Button variant="contained" onClick={() => handleUnlockToolChanger(5)}>
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
            <LiteplacerControls
              position={position}
              goto={goto}
              gotoPosition={gotoPosition}
              setGotoPosition={setGotoPosition}
            />
          )}

          {tab === 2 && (
            <LiteplacerActions
              connectedLitePlacer={connectedTinyG}
              openGripper={stepOpenGripper}
              closeGripper={stepCloseGripper}
              handleUnlockToolChanger={handleUnlockToolChanger}
              goto={goto}
            />
          )}

          {tab === 3 && (
            <GripperControls
              connected={connectedLitePlacerGripper}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Liteplacer.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  // value: PropTypes.string
};
