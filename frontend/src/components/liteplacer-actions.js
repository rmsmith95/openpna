"use client";

import PropTypes from "prop-types";
import { useState } from "react";
import {
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableContainer,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  IconButton,
} from "@mui/material";
import { TrashIcon } from '@heroicons/react/24/solid';

const LiteplacerActions = ({
  connected,
  goto,
  openGripper,
  closeGripper,
  handleUnlockToolChanger,
}) => {
  const [rows, setRows] = useState([
    { change: "Goto", name: "Home", x: 0, y: 0, z: 0, time: 0 },
    { change: "Goto", name: "Point A", x: 10, y: 5, z: 2, time: 0 },
  ]);

  const updateRow = (index, key, value) => {
    const updated = [...rows];
    updated[index][key] = value;
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { change: "Goto", name: "New", x: 0, y: 0, z: 0, time: 0 },
    ]);
  };

  const removeRow = (index) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
  };

  const runAction = (row) => {
    switch (row.change) {
      case "Goto":
        goto?.({ x: row.x, y: row.y, z: row.z, a: row.a ?? 0 }, 2000);
        break;

      case "Open":
        openGripper?.(row.time);
        break;

      case "Close":
        closeGripper?.(row.time);
        break;

      case "Unlock":
        handleUnlockToolChanger?.(5);
        break;

      default:
        console.warn("Unknown action:", row.change);
    }
  };

  return (
    <Stack spacing={2} alignItems="flex-start">
      <Stack direction="row" spacing={2} alignItems="center">
        <TableContainer component={Paper} sx={{ minWidth: 700 }}>
          <Table size="small">
            <TableBody>
              {rows.map((row, index) => (
                <TableRow key={index}>

                  {/* Action Type */}
                  <TableCell>
                    <Select
                      value={row.change}
                      size="small"
                      fullWidth
                      onChange={(e) =>
                        updateRow(index, "change", e.target.value)
                      }
                    >
                      <MenuItem value="Goto">Goto</MenuItem>
                      <MenuItem value="Unlock">Unlock</MenuItem>
                      <MenuItem value="Close">Close</MenuItem>
                      <MenuItem value="Open">Open</MenuItem>
                    </Select>
                  </TableCell>

                  {/* Name */}
                  <TableCell>
                    <TextField
                      label="Name"
                      value={row.name}
                      size="small"
                      onChange={(e) =>
                        updateRow(index, "name", e.target.value)
                      }
                    />
                  </TableCell>

                  {/* Goto Fields */}
                  {row.change === "Goto" && (
                    <>
                      <TableCell>
                        <TextField
                          label="X"
                          type="number"
                          value={row.x}
                          size="small"
                          onChange={(e) =>
                            updateRow(index, "x", Number(e.target.value))
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          label="Y"
                          type="number"
                          value={row.y}
                          size="small"
                          onChange={(e) =>
                            updateRow(index, "y", Number(e.target.value))
                          }
                        />
                      </TableCell>

                      <TableCell>
                        <TextField
                          label="Z"
                          type="number"
                          value={row.z}
                          size="small"
                          onChange={(e) =>
                            updateRow(index, "z", Number(e.target.value))
                          }
                        />
                      </TableCell>
                    </>
                  )}

                  {/* Open / Close options */}
                  {(row.change === "Close" || row.change === "Open") && (
                    <TableCell>
                      <TextField
                        label="Time (ms)"
                        type="number"
                        value={row.time}
                        size="small"
                        onChange={(e) =>
                          updateRow(index, "time", Number(e.target.value))
                        }
                      />
                    </TableCell>
                  )}

                  {/* Run Button */}
                  <TableCell align="center">
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => runAction(row)}
                    >
                      Run
                    </Button>
                  </TableCell>

                  {/* Delete Row */}
                  <TableCell align="center">
                    <IconButton
                      color="error"
                      onClick={() => removeRow(index)}
                    >
                      <TrashIcon width={20} height={20} color="red" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {/* ADD ROW BUTTON */}
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 2 }}>
                  <Button variant="outlined" onClick={addRow}>
                    + Add Row
                  </Button>
                </TableCell>
              </TableRow>

            </TableBody>
          </Table>
        </TableContainer>
      </Stack>
    </Stack>
  );
};

LiteplacerActions.propTypes = {
  onGoto: PropTypes.func,
  onOpen: PropTypes.func,
  onClose: PropTypes.func,
  onUnlock: PropTypes.func,
};

export default LiteplacerActions;
