import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsTable } from 'src/sections/jobs/job-table';
import { applyPagination } from 'src/utils/apply-pagination';
import { initialJobs, initialParts } from 'src/utils/jobs-set1';
import { useSimulation } from 'src/sections/jobs/simulation';

// Pagination helper
const usePaginated = (items, page, rowsPerPage) => {
  return useMemo(() => applyPagination(items, page, rowsPerPage), [items, page, rowsPerPage]);
};

const JobsPage = () => {
  const [jobs, setJobs] = useState(initialJobs);
  const [parts, setParts] = useState(initialParts);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const jobsIds = useMemo(() => jobs.map(j => j.id), [jobs]);
  const jobsSelection = useSelection(jobsIds);
  const paginatedJobs = usePaginated(jobs, page, rowsPerPage);

  const { currentJobId, step, run, stop, reset } = useSimulation({
    jobs,
    setJobs,
    parts,
    setParts,
    intervalTime: 2000
  });

  // Handlers
  const handleStep = () => step();
  const handleReset = () => reset();
  const handlePageChange = (event, newPage) => setPage(newPage);
  const handleRowsChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

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
                onClick={() => run()}
              >
                Run
              </Button>
              <Button
                variant="contained"
                color="warning"
                onClick={stop}
              >
                Stop
              </Button>
              <Button
                variant="contained"
                color="success"
                startIcon={<SvgIcon fontSize="small"><PlayIcon /></SvgIcon>}
                onClick={handleStep}
              >
                Step
              </Button>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<SvgIcon fontSize="small"><ArrowPathIcon /></SvgIcon>}
                onClick={handleReset}
              >
                Reset
              </Button>
            </Stack>

            <JobsTable
              count={jobs.length}
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
