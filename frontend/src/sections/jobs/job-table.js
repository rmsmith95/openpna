import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  Select,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  LinearProgress
} from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Scrollbar } from 'src/components/scrollbar';
import { goto, gripperGoTo, stepCloseGripper, stepOpenGripper, speedGripperDown, speedGripperUp, handleUnlockToolChanger} from '../../components/gantry-actions';

export const JobsTable = (props) => {
  const {
    rows = [],
    setRows,
    currentJobId = null,
    machines,
    parts,
  } = props;

  // Compute progress
  const count = rows.length
  const completedCount = rows.filter(j => j.status === 'Done').length;
  const progressPercent = (completedCount / count) * 100;

  const updateRow = (id, key, value) => {
    const updated = rows.map((row) => row.id === id ? { ...row, [key]: value } : row);
    setRows(updated);
  };

  const addRow = () => {
    setRows([
      ...rows,
      { machines: "Gantry", action: "" },
    ]);
  };

  const removeRow = (id) => {
    const updated = rows.filter((row) => row.id !== id);
    setRows(updated);
  };

  const runAction = (id) => {
    const row = rows.find(row => row.id === id);
    switch (row.action) {
      case "Goto":
        goto?.({ x: row.x, y: row.y, z: row.z, a: row.a ?? 0 }, 2000);
        break;

      case "step":
        break;

      case "unlock":
        handleUnlockToolChanger?.(5);
        break;

      default:
        console.warn("Unknown action:", row.change);
    }
  };

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((job, index) => {
                const isCurrent = job.id === currentJobId;
                return (
                  <TableRow
                    hover
                    key={job.id}
                    sx={isCurrent ? { backgroundColor: 'rgba(76, 175, 80, 0.2)' } : {}}
                  >
                    <TableCell>{job.id}</TableCell>
                    {/* Machines Dropdown */}
                    <TableCell>
                      <Select
                        value={job.machines} // show current machine
                        onChange={(e) => updateRow(job.id, 'machines', e.target.value)} // update 'machine' field
                        size="small"
                        fullWidth
                      >
                        {machines.map((m) => (
                          <MenuItem key={m} value={m}>
                            {m}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>


                    {/* Action */}
                    {/* Action Dropdown */}
                    <TableCell>
                      <Select
                        value={job.action || ""}
                        onChange={(e) => updateRow(job.id, 'action', e.target.value)}
                        size="small"
                        fullWidth
                      >
                        {(job.machines === "Gantry"
                          ? ["Goto", "Step", "Unlock"]
                          : ["Goto", "Step"]
                        ).map((act) => (
                          <MenuItem key={act} value={act}>
                            {act}
                          </MenuItem>
                        ))}
                      </Select>

                      {/* Conditional Inputs */}
                      {job.action === "Goto" && job.machines === "Gantry" && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          {["x", "y", "z", "r"].map((axis) => (
                            <input
                              key={axis}
                              type="number"
                              placeholder={axis.toUpperCase()}
                              value={job[axis] || ""}
                              onChange={(e) => updateRow(job.id, axis, Number(e.target.value))}
                              style={{ width: 50 }}
                            />
                          ))}
                        </Box>
                      )}

                      {job.action === "Goto" && job.machines === "Cobot280" && (
                        <Box sx={{ mt: 1, display: 'flex', gap: 1 }}>
                          {["j1", "j2", "j3", "j4", "j5", "j6"].map((joint) => (
                            <input
                              key={joint}
                              type="number"
                              placeholder={joint.toUpperCase()}
                              value={job[joint] || ""}
                              onChange={(e) => updateRow(job.id, joint, Number(e.target.value))}
                              style={{ width: 50 }}
                            />
                          ))}
                        </Box>
                      )}
                    </TableCell>


                    {/* Job Status */}
                    <TableCell>{job.status}</TableCell>

                    {/* Run Button */}
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => runAction(job.id)}
                      >
                        Run
                      </Button>
                      {/* Delete Row */}
                      <IconButton
                        color="error"
                        onClick={() => removeRow(job.id)}
                      >
                        <TrashIcon width={20} height={20} color="red" />
                      </IconButton>
                      <Button onClick={addRow}>
                        +
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>

      {/* Pagination with progress bar to the left and x/y jobs to the right */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1
        }}
      >
        {/* Progress bar fills remaining space */}
        <Box sx={{ flex: 1, mr: 1 }}>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 10, borderRadius: 5 }} />
        </Box>

        {/* x/y jobs text to the right of the progress bar */}
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mr: 2, whiteSpace: 'nowrap' }}>
          {completedCount} / {count}
        </Typography>

      </Box>
    </Card>
  );
};

JobsTable.propTypes = {
  count: PropTypes.number,
  jobs: PropTypes.array,
  currentJobId: PropTypes.number,
};
