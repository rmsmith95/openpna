import PropTypes from 'prop-types';
import { useState } from 'react';
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
  TextField,
  Typography,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import { TrashIcon } from '@heroicons/react/24/solid';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import { Scrollbar } from 'src/components/scrollbar';

import { getDefaultParams, runAction } from './job-actions';

export const JobsTable = ({
  jobs,
  fetchJobs,
  addJob,
  updateJob,
  deleteJob,
  machines
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Progress
  const count = Object.values(jobs).length;
  const completedCount = Object.values(jobs).filter(j => j.status === 'Done').length;
  const progressPercent = count === 0 ? 0 : (completedCount / count) * 100;

  // Parameter templates
  const PARAM_TEMPLATES = {
    gantry: {
      goto: { x: 0, y: 0, z: 0, a: 0, speed: 2000 },
      step: { x: 0, y: 0, z: 0, r: 0, speed: 1000 },
      unlock: {},
      screwIn: {},
      screwOut: {},
      attach: { tool: 'gripper'},
      detach: {},
    },
    cobot280: {
      goto: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
      step: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 }
    },
    gripper: {
      open: {},
      close: {},
      speedUp: {},
      speedDown: {},
    }
  };

  // Return the available actions for a given machine
  const getActionsForMachine = (machine) => {
    if (!machine || !PARAM_TEMPLATES[machine]) return [];
    return Object.keys(PARAM_TEMPLATES[machine]);
  };

  const handleDeleteClick = (jobId) => {
    setJobToDelete(jobId);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (jobToDelete) deleteJob(jobToDelete);
    setConfirmOpen(false);
    setJobToDelete(null);
  };

  const handleCancelDelete = () => {
    setConfirmOpen(false);
    setJobToDelete(null);
  };

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">
                  <IconButton color="primary" onClick={fetchJobs} size="small">
                    <ArrowPathIcon width={20} height={20} />
                  </IconButton>
                </TableCell>
                <TableCell>Job</TableCell>
                <TableCell>Machine</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Parameters</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">
                  <Button variant="contained" size="small" sx={{ backgroundColor: 'green' }} onClick={addJob}>
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {Object.values(jobs).map((job) => (
                <TableRow hover key={job.id}>
                  <TableCell align="center">
                    <IconButton color="error" onClick={() => handleDeleteClick(job.id)}>
                      <TrashIcon width={20} height={20} />
                    </IconButton>
                  </TableCell>

                  <TableCell>{job.id}</TableCell>

                  {/* Machine Dropdown */}
                  <TableCell>
                    <Select
                      value={job.machine || ''}
                      size="small"
                      fullWidth
                      onChange={(e) => {
                        const newMachine = e.target.value;
                        const availableActions = getActionsForMachine(newMachine);
                        const newAction = availableActions.includes(job.action) ? job.action : '';
                        updateJob(job.id, { ...job, machine: newMachine, action: newAction, params: getDefaultParams(newMachine, newAction) });
                      }}
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
                      value={job.action || ''}
                      size="small"
                      fullWidth
                      onChange={(e) => {
                        const newAction = e.target.value;
                        updateJob(job.id, { ...job, action: newAction, params: getDefaultParams(job.machine, newAction) });
                      }}
                    >
                      {getActionsForMachine(job.machine).map((act) => (
                        <MenuItem key={act} value={act}>
                          {act}
                        </MenuItem>
                      ))}
                    </Select>
                  </TableCell>

                  {/* Parameters */}
                  <TableCell>
                    <TextField
                      fullWidth
                      value={JSON.stringify(job.params)}
                      size="small"
                      InputProps={{
                        readOnly: true
                      }}
                    />
                  </TableCell>

                  <TableCell>{job.status}</TableCell>

                  <TableCell align="center">
                    <Button variant="contained" size="small" onClick={() => runAction(job)}>
                      Run
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>

      {/* Progress Bar */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 10, borderRadius: 5 }} />
        </Box>
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mr: 2, whiteSpace: 'nowrap' }}>
          {completedCount} / {count}
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Job?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this job? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

JobsTable.propTypes = {
  jobs: PropTypes.object,
  fetchJobs: PropTypes.func,
  addJob: PropTypes.func,
  updateJob: PropTypes.func,
  deleteJob: PropTypes.func,
  machines: PropTypes.array
};
