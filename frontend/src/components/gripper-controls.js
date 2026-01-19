import { useState, useEffect } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  IconButton,
  OutlinedInput,
  Stack,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead
} from "@mui/material";
import { stepOpenGripper, stepCloseGripper, setGripperSpeed, gripperGoTo } from './gripper-actions';
import ExpandIcon from '@mui/icons-material/Expand';
import CompressIcon from '@mui/icons-material/Compress';

export default function GripperControls() {
  const [speedInput, setSpeedInput] = useState(100);
  const [moveTime, setMoveTime] = useState(1);
  const [status, setStatus] = useState({
    "voltage": "",
    "position": "",
    "load": "",
    "temper": "",
    "speed_set": ""
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/gripper/get_status");
        const data = await res.json();
        if (data.raw) setStatus(data.raw);
      } catch (err) {
        console.error("Error fetching gripper status:", err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <Stack spacing={4} sx={{ pt: 3 }}>
      {/* Row 1: Control buttons */}
      <Stack direction="row" spacing={3} justifyContent="left" alignItems="left" sx={{ pl: 0 }}>
        <Button variant="contained" size="small" onClick={() => gripperGoTo(0, 200, 100)}>
          Open
        </Button>
        <Button variant="contained" size="small" onClick={() => gripperGoTo(0, 200, 100)}>
          Close
        </Button>
      </Stack>

      {/* Row 2: Step controls + Step Size + Speed */}
      <Stack direction="row" spacing={5} alignItems="center">
        <IconButton onClick={() => stepCloseGripper(moveTime, status.speed_set)}>
          <CompressIcon sx={{ transform: 'rotate(90deg)' }} />
        </IconButton>

        <Stack spacing={0.2} alignItems="left">
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>Step Size</div>
          <TextField
            value={moveTime}
            variant="outlined"
            onChange={(e) => setMoveTime(Number(e.target.value) || 0)}
            size="small"
            type="number"
            sx={{ width: 100 }}
            inputProps={{ step: "any" }}
          />
        </Stack>


        <IconButton onClick={() => stepOpenGripper(moveTime, status.speed_set)}>
          <ExpandIcon sx={{ transform: 'rotate(90deg)' }} />
        </IconButton>
        <Stack spacing={0.2} alignItems="left">
          <div style={{ fontSize: 12, fontWeight: 500, lineHeight: 1.2 }}>Speed</div>
          <TextField
            value={speedInput}
            variant="outlined"
            onChange={(e) => setSpeedInput(e.target.value)}
            onBlur={() => { if (speedInput !== "") setGripperSpeed(Number(speedInput)); }}
            onKeyDown={(e) => { if (e.key === "Enter") e.target.blur(); }}
            size="small"
            type="number"
            sx={{ width: 100 }}
            inputProps={{ min: 0, max: 1000 }}
          />
        </Stack>

      </Stack>

      {/* Row 3: Voltage / Position */}
      <Stack direction="row" spacing={2}>
        <Box sx={{ width: 120 }}>Voltage: {status.voltage}</Box>
        <Box sx={{ width: 120 }}>Position: {status.position}</Box>
      </Stack>

      {/* Row 4: Load / Temp */}
      <Stack direction="row" spacing={2}>
        <Box sx={{ width: 120 }}>Load: {status.load}</Box>
        <Box sx={{ width: 120 }}>Temp: {status.temper}</Box>
      </Stack>
    </Stack>
  );
}