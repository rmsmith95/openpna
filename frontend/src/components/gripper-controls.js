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

export default function GripperControls({ connected }) {
    const [port, setPort] = useState('COM4');
    const [servoId, setServoId] = useState(1);

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

    // ---- NEW: call FastAPI ----
    async function openGripper() {
        await fetch("/api/gripper/open", { method: "POST" });
    }

    async function closeGripper() {
        await fetch("/api/gripper/close", { method: "POST" });
    }

    function parseGripperStatus(raw) {
        if (!raw || typeof raw !== "string") return {};

        // Remove all <p> tags
        let text = raw.replace(/<p>/g, " ");

        // Define the keys in order
        const keys = [
            "Active ID:",
            "Position:",
            "Device Mode:",
            "Voltage:",
            "Load:",
            "Speed:",
            "Temper:",
            "Speed Set:",
            "ID to Set:",
            "Mode:",
            "Torque On"
        ];

        const status = {};
        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const nextKey = keys[i + 1];

            const startIndex = text.indexOf(key);
            if (startIndex === -1) continue;

            let endIndex;
            if (nextKey) {
                endIndex = text.indexOf(nextKey, startIndex + key.length);
                if (endIndex === -1) endIndex = text.length;
            } else {
                endIndex = text.length;
            }

            const value = text.substring(startIndex + key.length, endIndex).trim();
            const cleanKey = key.replace(":", "").replace(/\s+/g, "_").toLowerCase();
            status[cleanKey] = value;
        }

        return status;
    }
    useEffect(() => {
        const interval = setInterval(async () => {
            try {
                const res = await fetch("/api/gripper/get_status");
                const data = await res.json();
                console.log("Raw gripper data:", data);

                if (data.raw) {
                    // Remove escaped quotes if any
                    const raw = typeof data.raw === "string" ? data.raw.replace(/\\"/g, "") : "";
                    const parsed = parseGripperStatus(raw);

                    // Assign parsed values to status state
                    setStatus(parsed);
                    console.log("Cleaned Status:", parsed);
                    console.log("Status:", status);
                }
            } catch (err) {
                console.error("Error fetching gripper status:", err);
            }
        }, 5000);

        return () => clearInterval(interval);
    }, []);


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

                {/* NEW: Gripper buttons */}
                <Button variant="contained" color="primary" onClick={openGripper}>
                    Open
                </Button>

                <Button variant="contained" color="error" onClick={closeGripper}>
                    Close
                </Button>
            </Stack>

            {/* Always visible status table */}
            <Table size="small" sx={{ minWidth: 900 }}>
                <TableHead>
                    <TableRow>
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
                        <TableCell>{status.position}</TableCell>
                        <TableCell>{status.load}</TableCell>
                        <TableCell>{status.speed}</TableCell>
                        <TableCell>
                            {/* Simple gap estimation: convert position 0–4095 to 0–60mm */}
                            {status.position
                                ? (Number(status.position) / 4095 * 60).toFixed(1)
                                : ""}
                        </TableCell>
                        <TableCell>{status.temper}</TableCell>
                        <TableCell>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="contained"
                                    sx={{ width: 40, height: 35 }}
                                    onClick={closeGripper}
                                >
                                    <SvgIcon component={ArrowsPointingInIcon} />
                                </Button>

                                <Button
                                    variant="contained"
                                    sx={{ width: 40, height: 35 }}
                                    onClick={openGripper}
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
