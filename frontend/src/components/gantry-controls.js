"use client";

import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Typography,
  Box,
  Button,
  TextField,
} from "@mui/material";
import {goto, getInfo, handleUnlockToolChanger, stepMove} from './gantry-actions';

const GantryControls = ({ position, data, gotoPosition, setGotoPosition }) => {
  const [step, setStep] = useState({ x: 5, y: 5, z: 2, a: 10 });
  const [speed, setSpeed] = useState(3000);

  // --- RESET (Ctrl+X Soft Reset, RED BUTTON) ---
  const reset = async () => {
    try {
      const res = await fetch("/api/tinyg/reset", { method: "POST" });
      console.log("Reset response:", await res.json());
    } catch (err) {
      console.error("Reset error:", err);
    }
  };

  // --- ZERO (G92 X0 Y0 Z0 A0) ---
  const zero = async () => {
    try {
      const res = await fetch("/api/tinyg/set_position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ x: 0, y: 0, z: 0, a: 0 }),
      });
      console.log("Zero response:", await res.json());
    } catch (err) {
      console.error("Zero error:", err);
    }
  };

  const setCurrentPosition = async () => {
    try {
      const res = await fetch("/api/tinyg/set_position", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gotoPosition),
      });
      console.log("Set position response:", await res.json());
    } catch (err) {
      console.error("Set position error:", err);
    }
  };

  return (
    <Stack direction="row" spacing={4} alignItems="flex-start" sx={{ width: "100%" }}>
      {/* --- Full Width Table --- */}
      <Box sx={{ width: "100%" }}>
        <Table size="small" sx={{ width: "100%" }}>
          <TableHead>
            <TableRow>
              <TableCell align="center">Axis</TableCell>
              <TableCell align="center">Pos</TableCell>
              <TableCell align="center">Goto</TableCell>
              <TableCell align="center">Step</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {["x", "y", "z", "a"].map((axis) => (
              <TableRow key={axis}>
                <TableCell sx={{ p: 0.5 }} align="center">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                    {axis.toUpperCase()}
                    <Typography variant="body2">
                      {axis === "a" ? "(deg)" : "(mm)"}
                    </Typography>
                  </Stack>
                </TableCell>

                <TableCell sx={{ width: 60, p: 0.5 }} align="center">
                  {position[axis]}
                </TableCell>

                <TableCell sx={{ width: 80, p: 0.5 }} align="center">
                  <TextField
                    value={gotoPosition[axis]}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setGotoPosition({ ...gotoPosition, [axis]: isNaN(val) ? "" : val });
                    }}
                    size="small"
                    sx={{ width: 80, "& .MuiInputBase-input": { p: "4px 6px", fontSize: 12 } }}
                    type="number"
                    inputProps={{ step: "any" }}
                  />
                </TableCell>

                <TableCell sx={{ p: 0.5 }} align="center">
                  <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="center">
                    <Button size="small" sx={{ minWidth: 28 }} 
                        onClick={() => {
                          const axisStep = { x: 0, y: 0, z: 0, a: 0, speed: speed, [axis]: -step[axis] || 0 };
                          stepMove(axisStep);
                        }}>           
                      -
                    </Button>
                    <TextField
                      value={step[axis]}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setStep({ ...step, [axis]: isNaN(val) ? "" : val });
                      }}
                      size="small"
                      sx={{
                        width: 60,
                        "& .MuiInputBase-input": { p: "4px 6px", fontSize: 12, textAlign: "center" },
                      }}
                      type="number"
                      inputProps={{ step: "any" }}
                    />
                    <Button size="small" sx={{ minWidth: 28 }} 
                        onClick={() => {
                          const axisStep = { x: 0, y: 0, z: 0, a: 0, speed: speed, [axis]: step[axis] || 0 };
                          stepMove(axisStep);
                        }}>           
                      +
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* --- Bottom Controls --- */}
        <Stack
          direction="row"
          spacing={3}
          justifyContent="center"
          alignItems="center"
          sx={{ mt: 3 }}
          flexWrap="wrap"
        >
          <Button variant="contained" onClick={() => goto({...gotoPosition, speed})}>
            GoTo
          </Button>
          <Button variant="contained" onClick={setCurrentPosition}>
            Set
          </Button>
          <Button variant="contained" color="warning" onClick={zero}>
            Zero
          </Button>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography sx={{ fontWeight: 500 }}>Speed:</Typography>
            <TextField
              value={speed}
              onChange={(e) => {
                const val = e.target.value;
                setSpeed(val === "" ? 0 : parseFloat(val));
              }}
              size="small"
              sx={{
                width: 100,
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  p: "6px 8px",
                  fontSize: 14,
                },
              }}
              type="number"
              inputProps={{ min: 0 }}
            />
          </Stack>
          <Button variant="contained" onClick={() => handleUnlockToolChanger(5)}>
            Unlock
          </Button>

          {/* RESET BUTTON (RED, MOVED RIGHT) */}
          <Box sx={{ flexGrow: 1 }} /> {/* pushes reset fully to the right */}
          <Button variant="contained" color="error" onClick={reset}>
            Reset
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

GantryControls.propTypes = {
  connectedGantry: PropTypes.bool,
};

export default GantryControls;
