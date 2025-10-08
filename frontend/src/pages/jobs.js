import { useCallback, useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsTable } from 'src/sections/jobs/job-table';
import { JobSearch } from 'src/sections/jobs/job-search';
import { applyPagination } from 'src/utils/apply-pagination';

const usePaginated = (items, page, rowsPerPage) =>
  useMemo(() => applyPagination(items, page, rowsPerPage), [items, page, rowsPerPage]);

const JobsPage = () => {
  const [jobs, setJobs] = useState({}); // dict of jobId -> job
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState('');

  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/get_jobs`);
      const data = await res.json();
      setJobs(data || {});
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const jobsArray = useMemo(() => 
    Object.values(jobs).filter(job =>
      job.part.toLowerCase().includes(searchFilter.toLowerCase())
    ), [jobs, searchFilter]
  );

  const jobsIds = useMemo(() => jobsArray.map(j => j.id), [jobsArray]);
  const jobsSelection = useSelection(jobsIds);
  const paginatedJobs = usePaginated(jobsArray, page, rowsPerPage);

  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleRowsChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const currentJobId = null;

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
              <JobSearch value={searchFilter} onChange={(e) => { setSearchFilter(e.target.value); setPage(0); }} />
              <Button color="inherit" startIcon={<SvgIcon fontSize="small"><ArrowUpOnSquareIcon /></SvgIcon>}>Import</Button>
              <Button color="inherit" startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}>Export</Button>
            </Stack>

            <JobsTable
              count={jobsArray.length}
              items={paginatedJobs}
              currentJobId={currentJobId}
              onDeselectAll={jobsSelection.handleDeselectAll}
              onDeselectOne={jobsSelection.handleDeselectOne}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsChange}
              onSelectAll={jobsSelection.handleSelectAll}
              onSelectOne={jobsSelection.handleSelectOne}
              page={page}
              rowsPerPage={rowsPerPage}
              selected={jobsSelection.selected}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

JobsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default JobsPage;
