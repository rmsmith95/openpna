import { useState, useEffect } from "react";
import {
  Button,
  IconButton,
  Stack,
  TextField
} from "@mui/material";


export default function ScrewdriverControls() {
  const [speedInput, setSpeedInput] = useState(100);
  const [moveTime, setMoveTime] = useState(1);
  const [status, setStatus] = useState({
    voltage: "",
    position: "",
    load: "",
    temper: "",
    speed_set: 0
  });

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/gripper/get_status");
        const data = await res.json();
        if (data?.raw) {
          setStatus({
            voltage: data.raw.voltage ?? "",
            position: data.raw.position ?? "",
            load: data.raw.load ?? "",
            temper: data.raw.temper ?? "",
            speed_set: Number(data.raw.speed_set) || 0
          });
        }
      } catch (err) {
        console.error("Error fetching gripper status:", err);
      }
    };

    fetchStatus();
  }, []);

  return (
    <Stack spacing={4} sx={{ pt: 3 }}>
      {/* Row 1: Open / Close */}
      <Stack direction="row" spacing={3}>
        <Button
          variant="contained"
          size="small"
          onClick={() => gripperGoTo(0, 200, speedInput)}
        >
          Anticlockwise
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => gripperGoTo(200, 0, speedInput)}
        >
          Stop
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={() => gripperGoTo(200, 0, speedInput)}
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
          value={speedInput}
          onChange={(e) => setSpeedInput(Number(e.target.value) || 0)}
          onBlur={() => setGripperSpeed(speedInput)}
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
