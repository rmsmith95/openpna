import { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { Box, Stack, Button, SvgIcon } from '@mui/material';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import { useFactory } from 'src/utils/factory-context';
import { JobsTable } from 'src/sections/jobs/job-table';
import StopIcon from '@heroicons/react/24/solid/StopIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { recorder } from 'src/components/actions-wrapper';
import { fetchJobsAction, addJobAction, updateJobAction, deleteJobAction, runJobAction } from 'src/sections/jobs/job-actions'


export const JobsPanel = () => {
  const { parts, machines: factoryMachines } = useFactory();
  const machines = useMemo(() => Object.keys(factoryMachines), [factoryMachines]);
  const [jobs, setJobs] = useState({});
  const fileInputRef = useRef(null);

  const loadJobs = async () => {
    const data = await fetchJobsAction();
    setJobs(data || {});
    console.log(data)
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const addJob = async () => {
    await addJobAction();
    await loadJobs();
  };


  async function updateJob(job) {
    await updateJobAction(job);
    await loadJobs();
  }

  async function deleteJob(job_id) {
    await deleteJobAction(job_id);
    await loadJobs();
  }


  async function runJob(job_id) {
    await runJobAction(job_id);
    await loadJobs();
  }

  // Convert jobs array to dict with IDs when saving
  const saveToFile = () => {
    // If jobs is an array (like a macro), convert to dict keyed by UUID
    let jobsDict;
    if (Array.isArray(jobs)) {
      jobsDict = {};
      jobs.forEach(job => {
        const id = job.id || crypto.randomUUID();
        jobsDict[id] = { ...job, id };
      });
    } else {
      jobsDict = jobs;
    }

    const json = JSON.stringify(jobsDict, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jobs.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Load jobs as a dict
  const loadFromFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);

        if (data && typeof data === 'object' && !Array.isArray(data)) {
          setJobs(data);
        } else if (Array.isArray(data)) {
          // Convert array to dict with IDs
          const jobsDict = {};
          data.forEach(job => {
            const id = job.id || crypto.randomUUID();
            jobsDict[id] = { ...job, id };
          });
          setJobs(jobsDict);
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

        <Button
          variant="contained"
          color="primary"
          // onClick={runJobs}
          startIcon={<SvgIcon component={PlayIcon} fontSize="small" />}
        >
          Run
        </Button>

        <Button
          variant="contained"
          color="warning"
          // onClick={stopJobs}
          startIcon={<SvgIcon component={StopIcon} fontSize="small" />}
        >
          Stop
        </Button>

        <Button
          variant="contained"
          color="success"
          // onClick={stepJob}
          startIcon={<SvgIcon component={PlayIcon} fontSize="small" />}
        >
          Step
        </Button>

        <Button
          variant="outlined"
          color="primary"
          // onClick={resetJobs}
          startIcon={<SvgIcon component={ArrowPathIcon} fontSize="small" />}
        >
          Reset
        </Button>

        <Button
          color="inherit"
          onClick={() => fileInputRef.current?.click()}
          startIcon={<SvgIcon component={ArrowUpOnSquareIcon} fontSize="small" />}
        >
          Load
        </Button>

        <input
          type="file"
          accept=".json"
          hidden
          ref={fileInputRef}
          onChange={(e) => {
            loadFromFile(e);
            e.target.value = null; // allow reloading same file
          }}
        />

        <Button
          color="inherit"
          onClick={saveToFile}
          startIcon={<SvgIcon component={ArrowDownOnSquareIcon} fontSize="small" />}
        >
          Save
        </Button>

        <Button
          color="inherit"
          onClick={addJob}
          startIcon={<SvgIcon component={PlusIcon} fontSize="small" />}
        >
          New
        </Button>

        <Button
          color="inherit"
          startIcon={<SvgIcon component={PlusIcon} fontSize="small" />}
          onClick={async () => {
            await recorder.start(); // open file picker + start recording
          }}
        >
          Start Macro
        </Button>

        <Button
          color="inherit"
          startIcon={<SvgIcon component={StopIcon} fontSize="small" />}
          onClick={async () => {
            await recorder.stop(); // stop recording + save to chosen file
          }}
        >
          Stop Macro & Save
        </Button>

      </Stack>

      <JobsTable
        jobs={jobs}
        loadJobs={loadJobs}
        addJob={addJob}
        updateJob={updateJob}
        deleteJob={deleteJob}
        runJob={runJob}
        machines={machines}
      // parts={parts}
      />
    </Box>
  );
};
