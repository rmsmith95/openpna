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

import ArrowLeftIcon from "@heroicons/react/24/solid/ArrowLeftIcon";
import ArrowRightIcon from "@heroicons/react/24/solid/ArrowRightIcon";

export default function GripperControls({ connected, port, baud, setPort, setBaud }) {
  const [status, setStatus] = useState({
    "Active ID": "",
    Position: "",
    "Device Mode": "",
    Voltage: "",
    Load: "",
    Speed: "",
    Temper: "",
    "Speed Set": "",
    "ID to Set": "",
    Mode: "",
    "Torque On": ""
  });

  // Poll status every 2 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/gripper/get_status");
        const data = await res.json();

        if (data.raw) {
          const raw = data.raw.replace(/\\"/g, ""); // remove escaped quotes
          const parts = raw.split("<p>");
          const parsed = {};
          parts.forEach((part) => {
            const [key, value] = part.split(":").map(s => s.trim());
            if (key && value !== undefined) parsed[key] = value;
          });
          setStatus((prev) => ({ ...prev, ...parsed }));
        }
      } catch (err) {
        console.error("Error fetching gripper status:", err);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Stack spacing={2}>

      {/* Always visible status table */}
      <Table size="small" sx={{ minWidth: 900 }}>
        <TableHead>
          <TableRow>
            {Object.keys(status).map((key) => (
              <TableCell key={key}>{key}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          <TableRow>
            {Object.values(status).map((value, i) => (
              <TableCell key={i}>{value}</TableCell>
            ))}
          </TableRow>
        </TableBody>
      </Table>

      {/* Connection controls */}
      <Stack spacing={2} direction="row" alignItems="center">
        <Button variant="contained" color="success" disabled={connected}>
          Connect
        </Button>

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
      </Stack>

      {/* Width control table */}
      <Table size="small" sx={{ minWidth: 250 }}>
        <TableHead>
          <TableRow>
            <TableCell>Min Width (mm)</TableCell>
            <TableCell>Current Width (mm)</TableCell>
            <TableCell>Max Width (mm)</TableCell>
            <TableCell>Controls</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          <TableRow>
            <TableCell>0</TableCell>
            <TableCell>{status.Position || ""}</TableCell>
            <TableCell>60</TableCell>

            <TableCell>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  sx={{ width: 40, height: 35 }}
                  onClick={() => console.log("Decrease width")}
                >
                  <SvgIcon component={ArrowLeftIcon} />
                </Button>

                <Button
                  variant="contained"
                  sx={{ width: 40, height: 35 }}
                  onClick={() => console.log("Increase width")}
                >
                  <SvgIcon component={ArrowRightIcon} />
                </Button>
              </Stack>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </Stack>
  );
}
