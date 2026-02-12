"use client";

import PropTypes from "prop-types";
import { useState, useEffect } from "react";
import {
  ArrowLeft,
  ArrowRight,
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
import { moveJoint, moveJoints, fetchPositions } from 'src/components/actions-wrapper';


const Cobot280Controls = ({ axisData, step, setStep, speed, setSpeed }) => {
  const [joints, setJoints] = useState([0, 0, 0, 0, 0, 0]);
  const [gotoJoints, setGotoJoints] = useState([0, 0, 0, 0, 0, 0]);

  useEffect(() => {
    const loadPositions = async () => {
      const js = await fetchPositions();
      if (js) setJoints(js);
    };

    loadPositions();
  }, []);

  return (
    <Stack spacing={2}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Joint</TableCell>
            <TableCell>Angle (deg)</TableCell>
            <TableCell>Max (deg)</TableCell>
            <TableCell>Goto</TableCell>
            <TableCell>Step (deg)</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {axisData.map((row, index) => (
            <TableRow key={row.joint}>
              <TableCell>{row.joint}</TableCell>
              <TableCell>{joints[index]}</TableCell>
              <TableCell>{row.max}</TableCell>
              <TableCell>
                <TextField
                  value={gotoJoints[index]}
                  size="small"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (/^-?\d*\.?\d*$/.test(val)) {
                      const newGotoJoints = [...gotoJoints];
                      newGotoJoints[index] = Number(val);
                      setGotoJoints(newGotoJoints);
                    }
                  }}
                  sx={{ width: 48, minWidth: 48, '& .MuiInputBase-input': { padding: '4px 8px', fontSize: 13, } }}
                />
              </TableCell>
              <TableCell sx={{ verticalAlign: 'middle', textAlign: 'left' }}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Button
                    size="small"
                    onClick={() => moveJoint(index-1, -step[index], speed)}
                    width='10'
                    sx={{p:0, m:0, width:20, minWidth: 20,}}
                  >
                    -
                  </Button>
                  <TextField
                    value={step[index]}
                    size="small"
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^-?\d*\.?\d*$/.test(val)) {
                        const newStep = [...step];
                        newStep[index] = Number(val);
                        setStep(newStep);
                      }
                    }}
                    sx={{
                      minWidth: 46,
                      '& .MuiInputBase-input': { padding: '0px 8px', fontSize: 13 }
                    }}
                  />
                  <Button
                    size="small"
                    onClick={() => moveJoint(index-1, step[index], speed)}
                    sx={{p:0, m:0, width:20, minWidth: 20,}}
                  >
                    +
                  </Button>
                </Stack>
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Stack
        direction="row"
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ mt: 3 }}
        flexWrap="wrap"
      >
        <Button variant="contained" onClick={() => moveJoints(gotoJoints, speed)}>
          GoTo
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
      </Stack>
    </Stack>
  );
};

Cobot280Controls.propTypes = {
  connectedCobot280: PropTypes.bool,
};

export default Cobot280Controls;
