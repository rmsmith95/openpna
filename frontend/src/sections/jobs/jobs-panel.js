import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Box, Stack, Button, SvgIcon } from '@mui/material';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import { useFactory } from 'src/utils/factory-context';
import { JobsTable } from 'src/sections/jobs/job-table';

export const JobsPanel = () => {
  const { parts, machines: factoryMachines } = useFactory();
  const machines = useMemo(() => Object.values(factoryMachines).map(m => m.name), [factoryMachines]);
  const [jobs, setJobs] = useState([]);
  const fileInputRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/get_jobs`);
      const data = await res.json();
      setJobs(Object.values(data || {}));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
    const interval = setInterval(fetchJobs, 5000);
    return () => clearInterval(interval);
  }, [fetchJobs]);


  const saveToFile = () => {
    const json = JSON.stringify(jobs, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const loadFromFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (Array.isArray(data)) setJobs(data);
        else alert('Invalid JSON format');
      } catch {
        alert('Failed to read JSON file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <Box>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}>Run</Button>
        <Button variant="contained" color="warning">Stop</Button>
        <Button variant="contained" color="success" startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}>Step</Button>
        <Button variant="outlined" color="primary" startIcon={<SvgIcon fontSize="small"><ArrowPathIcon /></SvgIcon>}>Reset</Button>
        <Button color="inherit" onClick={() => fileInputRef.current?.click()} startIcon={<SvgIcon fontSize="small"><ArrowUpOnSquareIcon /></SvgIcon>}>Import</Button>
        <input type="file" accept=".json" hidden ref={fileInputRef} onChange={loadFromFile} />
        <Button color="inherit" onClick={saveToFile} startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}>Export</Button>
      </Stack>

      <JobsTable
        rows={jobs}
        setRows={setJobs}
        machines={machines}
        parts={parts}
      />
    </Box>
  );
};
