import { useCallback, useMemo, useState, useEffect } from 'react';
import Head from 'next/head';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsTable } from 'src/sections/jobs/job-table';
import { applyPagination } from 'src/utils/apply-pagination';

// Pagination helper
const usePaginated = (items, page, rowsPerPage) => {
  return useMemo(() => applyPagination(items, page, rowsPerPage), [items, page, rowsPerPage]);
};

const JobsPage = () => {
  const [jobs, setJobs] = useState({}); // dict of jobId -> job
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchFilter, setSearchFilter] = useState('');

  // Get job IDs and job array
  const jobsArray = useMemo(() => Object.values(jobs), [jobs]);
  const jobsIds = useMemo(() => Object.keys(jobs), [jobs]);
  const jobsSelection = useSelection(jobsIds);
  const paginatedJobs = usePaginated(jobsArray, page, rowsPerPage);

  // Fetch jobs from backend using POST
  const fetchJobs = useCallback(async () => {
    try {
      const res = await fetch('/api/get_jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          offset: page * rowsPerPage,
          search: searchFilter,
        }),
      });

      const data = await res.json();
      // Expecting data.jobs as object/dict
      setJobs(data.jobs || {});
    } catch (err) {
      console.error('Error fetching jobs:', err);
    }
  }, [page, rowsPerPage, searchFilter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // TODO: define or pass the currentJobId
  const currentJobId = null;

  return (
    <>
      <Head>
        <title>Jobs</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Typography variant="h4">Jobs</Typography>

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}
              >
                Run
              </Button>
              <Button
                variant="contained"
                color="warning"
              >
                Stop
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}
              >
                Step
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SvgIcon fontSize="small"><ArrowPathIcon /></SvgIcon>}
              >
                Reset
              </Button>
            </Stack>

            <JobsTable
              count={jobsIds.length}
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
