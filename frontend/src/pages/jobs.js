import { useCallback, useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsTable } from 'src/sections/jobs/job-table';
import { useFactory } from 'src/utils/factory-context';


const JobsPage = () => {
  const { parts } = useFactory(); // <-- global parts
  const partsArray = useMemo(() => Object.values(parts), [parts]);
  const partsIds = useMemo(() => Object.keys(parts), [parts]);
  const machines = ["gantry", "cobot280", "gripper"];
  const [jobs, setJobs] = useState([]);
  const currentJobId = null;

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/get_jobs`);
      const data = await res.json();
      console.log(data)
      setJobs(Object.values(data || {}));
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
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
        if (Array.isArray(data)) {
          setJobs(data);
        } else {
          alert("Invalid JSON format");
        }
      } catch (err) {
        alert("Failed to read JSON file");
      }
    };

    reader.readAsText(file);
  };


  return (
    <>
      <Head>
        <title>Jobs | OpenPnA</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Jobs</Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Button variant="contained" color="primary" startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}>Run</Button>
              <Button variant="contained" color="warning">Stop</Button>
              <Button variant="contained" color="success" startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}>Step</Button>
              <Button variant="outlined" color="primary" startIcon={<SvgIcon fontSize="small"><ArrowPathIcon /></SvgIcon>}>Reset</Button>
              <Button color="inherit"
                startIcon={
                  <SvgIcon fontSize="small">
                    <ArrowUpOnSquareIcon />
                  </SvgIcon>
                }>
                Import
              </Button>
              <input
                type="file"
                accept=".json"
                hidden
                onChange={loadFromFile}
              />
              <Button
                color="inherit"
                startIcon={
                  <SvgIcon fontSize="small">
                    <ArrowDownOnSquareIcon />
                  </SvgIcon>
                }
                onClick={saveToFile}
              >
                Export
              </Button>
            </Stack>

            <JobsTable
              rows={jobs}
              setRows = {setJobs}
              currentJobId={currentJobId}
              machines={machines}
              parts={parts}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

JobsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default JobsPage;
