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
import { ArrowUturnLeftIcon, ArrowUturnRightIcon } from '@heroicons/react/24/solid'

export default function GripperControls({ connected }) {
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
                // console.log("Raw gripper data:", data);

                if (data.raw) {
                    setStatus(data.raw);
                }

            } catch (err) {
                console.error("Error fetching gripper status:", err);
            }
        }, 200);

        return () => clearInterval(interval);
    }, []);


    // --- Send open/close commands ---
    async function stepOpenGripper(time = 1, speed = status.speed_set || 100) {
        await fetch("/api/gripper/open", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ time, speed }),
        });
    }

    async function stepCloseGripper(time = 1, speed = status.speed_set || 100) {
        await fetch("/api/gripper/close", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ time, speed }),
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
                        <TableCell>{status.speed_set}</TableCell>
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
                                    <SvgIcon component={ArrowUturnLeftIcon} />
                                </Button>

                                <Button
                                    variant="contained"
                                    sx={{ width: 40, height: 35 }}
                                    onClick={() => stepOpenGripper(1, status.speed_set)}
                                >
                                    <SvgIcon component={ArrowUturnRightIcon} />
                                </Button>
                            </Stack>
                        </TableCell>
                    </TableRow>
                </TableBody>
            </Table>
        </Stack>
    );
}
