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
  const [jobs, setJobs] = useState({});
  const fileInputRef = useRef(null);

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch("/api/jobs/get-jobs");
      const data = await res.json();
      console.log(data)
      setJobs((data || {}));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const addJob = async () => {
    const job = { id: "", machine: "gantry", action: "unlock", params: {}, status: "Pending", };
    const job_id = job.id

    try {
      const res = await fetch("/api/jobs/update-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id, job }),
      });

      if (!res.ok) throw new Error("Failed to update job");
      await res.json();
      return await fetchJobs();
    } catch (err) {
      console.error("update_job error:", err);
      throw err;
    }
  };

  async function updateJob(job_id, job) {
    try {
      const res = await fetch("/api/jobs/update-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id, job }),
      });

      if (!res.ok) throw new Error("Failed to update job");
      await res.json();
      return await fetchJobs();

    } catch (err) {
      console.error("update_job error:", err);
      throw err;
    }
  }

  async function deleteJob(job_id) {
    try {
      const res = await fetch("/api/jobs/delete-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ job_id }),
      });

      if (!res.ok) throw new Error("Failed to delete job");
      await res.json();
      return await fetchJobs();
    } catch (err) {
      console.error("delete_job error:", err);
      throw err;
    }
  }

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
        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setJobs(data);
        } else {
          alert('Invalid JSON format');
        }
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
        jobs={jobs}
        addJob={addJob}
        updateJob={updateJob}
        deleteJob={deleteJob}
        machines={machines}
        parts={parts}
      />
    </Box>
  );
};
