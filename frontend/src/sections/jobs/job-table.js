import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  IconButton,
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
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import { Scrollbar } from 'src/components/scrollbar';
import { DeleteJobDialog, EditJobDialog } from './table-helpers';

export const JobsTable = ({
  jobs,
  loadJobs,
  addJob,
  updateJob,
  deleteJob,
  runJob,
  machines
}) => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Progress
  const count = Object.values(jobs).length;
  const completedCount = Object.values(jobs).filter(j => j.status === 'Done').length;
  const progressPercent = count === 0 ? 0 : (completedCount / count) * 100;

  const PARAM_TEMPLATES = {
    gantry: {
      goto: { x: 0, y: 0, z: 0, a: 0, speed: 2000 },
      step: { x: 0, y: 0, z: 0, r: 0, speed: 1000 },
      unlock: {},
      screwIn: {},
      screwOut: {},
      attach: { tool: 'gripper' },
      detach: {}
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

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center"></TableCell>
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
                    <IconButton color="error" onClick={() => { setJobToDelete(job.id); setConfirmOpen(true); }}>
                      <TrashIcon width={20} height={20} />
                    </IconButton>
                    <IconButton color="primary" onClick={() => { setEditingJob(job); setEditOpen(true); }}>
                      <ArrowPathIcon width={20} height={20} />
                    </IconButton>
                  </TableCell>
                  <TableCell>{job.id}</TableCell>
                  <TableCell>{job.machine}</TableCell>
                  <TableCell>{job.action}</TableCell>
                  <TableCell>
                    <TextField
                      fullWidth
                      value={JSON.stringify(job.params)}
                      size="small"
                      InputProps={{ readOnly: true }}
                    />
                  </TableCell>
                  <TableCell>{job.status}</TableCell>
                  <TableCell align="center">
                    <Button variant="contained" size="small" onClick={() => runJob(job.id)}>Run</Button>
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

      {/* Dialogs */}
      <DeleteJobDialog
        open={confirmOpen}
        jobId={jobToDelete}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={(id) => { deleteJob(id); setConfirmOpen(false); }}
      />

      <EditJobDialog
        open={editOpen}
        editingJob={editingJob}
        updateJob={updateJob}
        machines={machines}
        paramTemplates={PARAM_TEMPLATES}
        onClose={() => setEditOpen(false)}
        onSave={async (job) => { await updateJob(job); setEditOpen(false); }}
      />
    </Card>
  );
};


JobsTable.propTypes = {
  jobs: PropTypes.object,
  loadJobs: PropTypes.func,
  addJob: PropTypes.func,
  updateJob: PropTypes.func,
  deleteJob: PropTypes.func,
  runJob: PropTypes.func,
  machines: PropTypes.array
};
