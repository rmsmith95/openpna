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
import GantryControls from '../../components/gantry-controls';
import GantryActions from '../../components/gantry-actions';
import GripperControls from '../../components/gripper-controls';
import { useFactory } from "src/utils/factory-context";


export const Gantry = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  // Connection state
  const [connectedTinyG, setConnectedTinyG] = useState(false);
  const [connectedArduino, setConnectedArduino] = useState(false);
  const [connectedServoGripper, setConnectedServoGripper] = useState(false);
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

  useEffect(() => {
    const getInfo = async () => {
      try {
        const res = await fetch("/api/tinyg/get_info");
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
    const interval = setInterval(getInfo, 10000);
    return () => clearInterval(interval);
  }, [10000]);

  const goto = async (gotoPosition, speed) => {
    try {
      const res = await fetch("/api/tinyg/goto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...gotoPosition, speed }),
      });
      console.log("GoTo response:", await res.json());
    } catch (err) {
      console.error("GoTo error:", err);
    }
  };

  async function handleUnlockToolChanger(time = 5) {
    await fetch("/api/tinyg/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_s:time }),
    });
  }

  async function gripperGoTo(position=1000, load_limit=100, speed=1000) {
    await fetch("/api/gripper/gripper_goto", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ position, load_limit, speed }),
    });
  }

  async function stepOpenGripper(time_s = 1, speed=1000) {
    await fetch("/api/gripper/gripper_open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_s, speed }),
    });
  }

  async function stepCloseGripper(time_s = 1, speed=1000) {
    await fetch("/api/gripper/gripper_close", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ time_s, speed }),
    });
  }

  async function speedGripperUp () {
      await fetch("/api/gripper/speed_up", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
      });
  }

  async function speedGripperDown () {
      await fetch("/api/gripper/speed_down", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
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
                <span>Connection</span>
                {connectedTinyG ? (
                  <SvgIcon fontSize="small" color="success"><CheckCircleIcon /></SvgIcon>
                ) : (
                  <SvgIcon fontSize="small" color="error"><XCircleIcon /></SvgIcon>
                )}
              </Stack>
            } />
            <Tab label="Control" />
            <Tab label="Actions" />
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Gripper</span>
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
                    <TableCell>gantry.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {tab === 1 && (
            <GantryControls
              position={position}
              handleUnlockToolChanger={handleUnlockToolChanger}
              goto={goto}
              gotoPosition={gotoPosition}
              setGotoPosition={setGotoPosition}
            />
          )}

          {tab === 2 && (
            <GantryActions
              connectedTinyG={connectedTinyG}
              gripperGoTo={gripperGoTo}
              openGripper={stepOpenGripper}
              closeGripper={stepCloseGripper}
              handleUnlockToolChanger={handleUnlockToolChanger}
              goto={goto}
            />
          )}

          {tab === 3 && (
            <GripperControls
              connected={connectedServoGripper}
              handleConnect={handleConnectGripperServo}
              gripperGoTo={gripperGoTo}
              stepOpenGripper={stepOpenGripper}
              stepCloseGripper={stepCloseGripper}
              speedGripperUp={speedGripperUp}
              speedGripperDown={speedGripperDown}
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
