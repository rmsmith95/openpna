import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  IconButton,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
  LinearProgress
} from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/solid';
import { Scrollbar } from 'src/components/scrollbar';
import { goto, stepMove, handleUnlockToolChanger } from '../../components/gantry-actions';
import { stepCloseGripper, stepOpenGripper, speedGripperDown, speedGripperUp } from '../../components/gripper-actions';
import { fetchPositions, moveJoint, moveJoints } from '../../components/cobot280-actions';

export const JobsTable = (props) => {
  const {
    rows = [],
    setRows,
    currentJobId = null,
    machines,
    parts,
  } = props;

  const PARAM_TEMPLATES = {
    gantry: {
      goto: { x: 0, y: 0, z: 0, a: 0, speed: 2000 },
      step: { x: 0, y: 0, z: 0, r: 0, speed: 1000 },
      unlock: {}
    },
    cobot280: {
      goto: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
      step: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 }
    },
    gripper: {
      open: {},
      close: {},
      speedUp: {},
      speedDown: {}
    }
  };

  // Compute progress
  const count = rows.length
  const completedCount = rows.filter(j => j.status === 'Done').length;
  const progressPercent = (completedCount / count) * 100;

  const getDefaultParams = (machine, action) =>
    PARAM_TEMPLATES?.[machine]?.[action] ? { ...PARAM_TEMPLATES[machine][action] } : {};

  const updateRow = (jobId, machine, action, params) => {
    setRows(rows.map(row => {
      if (row.id !== jobId) return row;

      const finalMachine = machine ?? row.machine;
      const finalAction = action ?? row.action;

      return {
        ...row,
        machine: finalMachine,
        action: finalAction,
        params: params ?? getDefaultParams(finalMachine, finalAction)
      };
    }));
  };

  const addRow = () => {
    setRows([
      ...rows,
      { id: "j", machine: "gantry", action: "unlock", params: {} },
    ]);
  };

  const removeRow = (id) => {
    const updated = rows.filter((row) => row.id !== id);
    setRows(updated);
  };

  const runAction = (job_id) => {
    const job = rows.find((row) => row.id === job_id);
    if (!job) return;
    const { machine, action, params } = job;
    console.log("Running job:", machine, action, params);

    switch (machine) {
      case "gantry":
        switch (action) {
          case "goto": return goto?.(params);
          case "step": return stepMove?.(params);
          case "unlock": return handleUnlockToolChanger?.(5);
        }
        break;
      case "cobot280":
        switch (action) {
          case "goto": return moveJoints?.(params);
          case "step": return moveJoint?.(params);
        }
        break;
      case "gripper":
        switch (action) {
          case "open": return stepOpenGripper?.();
          case "close": return stepCloseGripper?.();
          case "speedUp": return speedGripperUp?.();
          case "speedDown": return speedGripperDown?.();
        }
        break;
      default:
        console.warn("Unknown machine/action:", machine, action);
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
                <TableCell>Parameters</TableCell>
                <TableCell>Status</TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((job) => {
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
                        value={job.machine}
                        onChange={(e) =>
                          updateRow(job.id, e.target.value, "")
                        }
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

                    {/* Action Dropdown */}
                    <TableCell>
                      <Select
                        value={job.action || ""}
                        onChange={(e) => updateRow(job.id, job.machine, e.target.value)}
                        size="small"
                        fullWidth
                      >
                        {(
                          job.machine === "gantry" ? ["goto", "step", "unlock"] :
                            job.machine === "cobot280" ? ["goto", "step"] :
                              job.machine === "gripper" ? ["open", "close"] : []
                        ).map((act) => (
                          <MenuItem key={act} value={act}>
                            {act}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>

                    <TableCell>
                        <TextField
                          fullWidth
                          value={JSON.stringify(job.params)} // single-line JSON
                          // sx={{ fontFamily: 'monospace' }}
                        />
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1}}>
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
