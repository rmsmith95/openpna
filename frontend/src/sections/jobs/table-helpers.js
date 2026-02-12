// JobDialogs.js
import { useState, useEffect } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  MenuItem
} from '@mui/material';

export const DeleteJobDialog = ({ open, jobId, onCancel, onConfirm }) => {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Delete Job?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Are you sure you want to delete this job? This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onConfirm(jobId)} color="error" variant="contained">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};


export const EditJobDialog = ({
  open,
  editingJob,
  updateJob,
  machines,
  paramTemplates,
  onClose
}) => {
  const [localJob, setLocalJob] = useState(null);
  const [paramsText, setParamsText] = useState('');

  useEffect(() => {
    if (editingJob) {
      setLocalJob(editingJob);
      setParamsText(JSON.stringify(editingJob.params || {}, null, 2));
    }
  }, [editingJob]);

  if (!localJob) return null;

  const getActionsForMachine = (machine) => {
    if (!machine || !paramTemplates[machine]) return [];
    return Object.keys(paramTemplates[machine]);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit Job</DialogTitle>
      <DialogContent>

        {/* Machine Dropdown */}
        <TextField
          select
          label="Machine"
          fullWidth
          margin="normal"
          value={localJob.machine || ''}
          onChange={(e) => {
            const newMachine = e.target.value;
            setLocalJob({
              ...localJob,
              machine: newMachine,
              action: '',
              params: {}
            });
            setParamsText('{}');
          }}
        >
          {machines.map((m) => (
            <MenuItem key={m} value={m}>{m}</MenuItem>
          ))}
        </TextField>

        {/* Action Dropdown */}
        <TextField
          select
          label="Action"
          fullWidth
          margin="normal"
          value={localJob.action || ''}
          onChange={(e) => {
            const newAction = e.target.value;
            const template = paramTemplates[localJob.machine]?.[newAction] || {};
            setLocalJob({ ...localJob, action: newAction, params: { ...template } });
            setParamsText(JSON.stringify(template, null, 2));
          }}
        >
          {getActionsForMachine(localJob.machine).map((act) => (
            <MenuItem key={act} value={act}>{act}</MenuItem>
          ))}
        </TextField>

        {/* Params Textbox */}
        <TextField
          label="Params (JSON)"
          fullWidth
          multiline
          minRows={6}
          margin="normal"
          value={paramsText}
          onChange={(e) => setParamsText(e.target.value)}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            try {
              const parsedParams = JSON.parse(paramsText);
              await updateJob({ ...localJob, params: parsedParams });
              onClose();
            } catch {
              alert("Invalid JSON in params");
            }
          }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};
