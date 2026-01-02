import { useState, useEffect } from "react";
import {
  Stack,
  Button,
  SvgIcon,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead
} from "@mui/material";
import { ArrowsPointingInIcon, ArrowsPointingOutIcon } from '@heroicons/react/24/solid'
import {stepOpenGripper, stepCloseGripper, speedGripperDown, speedGripperUp, gripperGoTo} from './gripper-actions';

export default function GripperControls({  }) {
  // const [port, setPort] = useState('COM4');
  const [servoId, setServoId] = useState(1);
  const [moveTime, setMoveTime] = useState(1);

  const [status, setStatus] = useState({
    "active_id": "",
    "position": "",
    "device_mode": "",
    "voltage": "",
    "load": "",
    "speed": "",
    "temper": "",
    "speed_set": "",
    "id_to_set": "",
    "mode": "",
    "torque_on": ""
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/gripper/get_status");
        const data = await res.json();

        if (data.raw) {
          // console.log(data.raw)
          setStatus(data.raw);
        }

      } catch (err) {
        console.error("Error fetching gripper status:", err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  // async function setSpeed(speed) {
  //     // Update UI instantly
  //     setStatus((prev) => ({ ...prev, speed_set: speed }));

  //     await fetch("/api/gripper/set_speed", {
  //         method: "POST",
  //         headers: { "Content-Type": "application/json" },
  //         body: JSON.stringify({ speed }),
  //     });
  // }

  return (
    <Stack spacing={2}>

      {/* Connection controls */}
      {/* <Stack spacing={2} direction="row" alignItems="center">
        <Button variant="contained" color="success" disabled={connected} onClick={handleConnect}>
          Connect
        </Button>

        <TextField
          label="Servo Id"
          type="number"
          value={servoId}
          onChange={(e) => setServoId(Number(e.target.value))}
        />
      </Stack> */}

      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            <TableCell>
              Speed
            </TableCell>
            <TableCell direction="row" spacing={0.5} alignItems="center" justifyContent="center">
              Step
            </TableCell>
            <TableCell>
              Control
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            <TableCell>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Button
                  variant="outlined"
                  sx={{ minWidth: 30, padding: 0 }}
                  onClick={() => {
                    speedGripperDown();
                  }}
                >
                  -
                </Button>
                <strong>{status.speed_set}</strong>
                <Button
                  variant="outlined"
                  sx={{ minWidth: 30, padding: 0 }}
                  onClick={() => {
                    speedGripperUp();
                  }}
                >
                  +
                </Button>
              </Stack>
            </TableCell>
            <TableCell sx={{ p: 0.5 }} align="center">
              <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                <Button variant="contained" size="small" sx={{ minWidth: 28 }} onClick={() => stepCloseGripper(moveTime, status.speed_set)}>
                  Tighter
                </Button>
                <TextField
                  value={moveTime}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setMoveTime(Number.isNaN(val) ? 0 : val);
                  }}
                  size="small"
                  sx={{
                    width: 60,
                    "& .MuiInputBase-input": {
                      p: "4px 6px",
                      fontSize: 15,
                      textAlign: "center",
                    },
                  }}
                  type="number"
                  inputProps={{ step: "any" }}
                />
                <Button variant="contained" size="small" sx={{ minWidth: 28 }} onClick={() => stepOpenGripper(moveTime, status.speed_set)}>
                  Wider
                </Button>
              </Stack>
            </TableCell>

            <TableCell>
              <Button variant="contained" size="small" sx={{ minWidth: 28 }} onClick={() => gripperGoTo(0, 200, 100)}>
                Open
              </Button>
              <Button variant="contained" size="small" sx={{ minWidth: 28 }} onClick={() => gripperGoTo(0, 200, 100)}>
                Close
              </Button>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <Table size="small" sx={{ minWidth: 900 }}>
        <TableBody>
          <TableRow>
            <TableCell>Voltage: {status.voltage}</TableCell>
            <TableCell>Position: {status.position}</TableCell>
            <TableCell>Load: {status.load}</TableCell>
            <TableCell>Temp: {status.temper}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  );
}
