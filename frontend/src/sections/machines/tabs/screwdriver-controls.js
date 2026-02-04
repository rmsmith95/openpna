import { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  Stack,
  TextField
} from "@mui/material";
import { screwIn, screwOut, screwdriverStop } from './screwdriver-actions';


export default function ScrewdriverControls() {
  const [speed, setSpeed] = useState(100);
  const [duration, setDuration] = useState(1);
  const [status, setStatus] = useState({
    voltage: "",
    position: "",
    load: "",
    temper: "",
    speed_set: 0
  });

  return (
    <Stack spacing={4} sx={{ pt: 3 }}>
      {/* Row 1: Open / Close */}
      <Stack direction="row" spacing={3}>
        <Button
          variant="contained"
          size="small"
          onClick={() => screwOut(duration, speed)}
        >
          Anticlockwise
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => screwdriverStop()}
        >
          Stop
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => screwIn(duration, speed)}
        >
          Clockwise
        </Button>
        </Stack>

      {/* Status */}
      <Stack direction="row" spacing={4}>
        <span>Voltage: {status.voltage}</span>
        <span>Position: {status.position}</span>
        <span style={{ fontSize: 12, fontWeight: 500 }}>Speed</span>
        <TextField
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value) || 0)}
          onBlur={() => setSpeed(speed)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          size="small"
          type="number"
          sx={{ width: 100 }}
          inputProps={{ min: 0, max: 1000 }}/>
          <TextField
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value) || 0)}
          onBlur={() => setDuration(duration)}
          onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
          size="small"
          type="number"
          sx={{ width: 100 }}
          inputProps={{ min: 0, max: 1000 }}/>
      </Stack>
      

      <Stack direction="row" spacing={4}>
        <span>Load: {status.load}</span>
        <span>Temp: {status.temper}</span>
      </Stack>
    </Stack>
  );
}
