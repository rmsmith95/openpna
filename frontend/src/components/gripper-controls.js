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

export default function GripperControls({ connected, stepOpenGripper, stepCloseGripper }) {
    const [port, setPort] = useState('COM4');
    const [servoId, setServoId] = useState(1);

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
                    console.log(data.raw)
                    setStatus(data.raw);
                }

            } catch (err) {
                console.error("Error fetching gripper status:", err);
            }
        }, 200);

        return () => clearInterval(interval);
    }, []);

    async function speedUp () {
        await fetch("/api/gripper/speed_up", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
    }

    async function speedDown () {
        await fetch("/api/gripper/speed_down", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        });
    }

    async function setSpeed(speed) {
        // Update UI instantly
        setStatus((prev) => ({ ...prev, speed_set: speed }));

        await fetch("/api/gripper/set_speed", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ speed }),
        });
    }

    return (
        <Stack spacing={2}>

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
                    label="Servo Id"
                    type="number"
                    value={servoId}
                    onChange={(e) => setServoId(Number(e.target.value))}
                />
            </Stack>

            {/* Always visible status table */}
            <Table size="small" sx={{ minWidth: 900 }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Voltage</TableCell>
                        <TableCell>Position</TableCell>
                        <TableCell>Load</TableCell>
                        <TableCell>Speed</TableCell>
                        <TableCell>Est. Gap</TableCell>
                        <TableCell>Temp</TableCell>
                        <TableCell>Controls</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>{status.voltage}</TableCell>
                        <TableCell>{status.position}</TableCell>
                        <TableCell>{status.load}</TableCell>

                        {/* ------- UPDATED SPEED COLUMN WITH +/- BUTTONS ------- */}
                        <TableCell>
                            <Stack direction="row" alignItems="center" spacing={1}>
                                <Button
                                    variant="outlined"
                                    sx={{ minWidth: 30, padding: 0 }}
                                    onClick={() => {
                                        speedDown();
                                    }}
                                >
                                    -
                                </Button>

                                <strong>{status.speed_set}</strong>

                                <Button
                                    variant="outlined"
                                    sx={{ minWidth: 30, padding: 0 }}
                                    onClick={() => {
                                        speedUp();
                                    }}
                                >
                                    +
                                </Button>
                            </Stack>
                        </TableCell>
                        {/* ----------------------------------------------------- */}

                        <TableCell>
                            {status.position
                                ? (status.position / 4095 * 60).toFixed(1)
                                : ""}
                        </TableCell>

                        <TableCell>{status.temper}</TableCell>

                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    sx={{ width: 40, height: 35 }}
                                    onClick={() => stepCloseGripper(1, status.speed_set)}
                                >
                                    <SvgIcon component={ArrowsPointingInIcon} />
                                </Button>

                                <Button
                                    variant="contained"
                                    sx={{ width: 40, height: 35 }}
                                    onClick={() => stepOpenGripper(1, status.speed_set)}
                                >
                                    <SvgIcon component={ArrowsPointingOutIcon} />
                                </Button>
                            </Stack>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Stack>
    );
}
