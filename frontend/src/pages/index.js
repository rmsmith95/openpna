import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Grid,
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsTable } from 'src/sections/jobs/job-table';
import { applyPagination } from 'src/utils/apply-pagination';
import { initialJobs, initialParts } from 'src/utils/jobs-set1';
import { useSimulation } from 'src/sections/jobs/simulation';

// --- Example machine list ---
const machines = [
  { name: 'LitePlacer1', size: '600mm x 400mm x 200mm', attachments: 'gripper1, soldering iron1' },
  { name: 'Cobot 6DOF Arm', size: '300mm reach', attachments: 'gripper2' },
  { name: 'Linear Actuator', size: '150mm', attachments: '' },
];

// --- Pagination helpers ---
const useJobs = (page, rowsPerPage) =>
  useMemo(() => applyPagination(initialJobs, page, rowsPerPage), [page, rowsPerPage]);

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const pagedJobs = useJobs(page, rowsPerPage);

  const handlePageChange = useCallback((event, value) => setPage(value), []);
  const handleRowsPerPageChange = useCallback((event) => setRowsPerPage(event.target.value), []);

  return (
    <>
      <Head>
        <title>MicroFactory Dashboard</title>
      </Head>

      <Box component="main" sx={{ flexGrow: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Top Left: Machine list */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Machines
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Name</strong></TableCell>
                      <TableCell><strong>Size</strong></TableCell>
                      <TableCell><strong>Attachments</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {machines.map((machine, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{machine.name}</TableCell>
                        <TableCell>{machine.size}</TableCell>
                        <TableCell>{machine.attachments || 'None'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Top Right: Camera feed placeholder */}
            <Grid item xs={12} md={6}>
              <Paper
                sx={{
                  p: 2,
                  height: 360,
                  backgroundColor: 'black',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                }}
              >
                Camera Feed
              </Paper>
            </Grid>

            {/* Bottom: Jobs list */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Jobs
                </Typography>
                <JobsTable
                  count={initialJobs.length}
                  items={pagedJobs}
                  page={page}
                  rowsPerPage={rowsPerPage}
                  onPageChange={handlePageChange}
                  onRowsPerPageChange={handleRowsPerPageChange}
                  selected={[]} // selection state if needed
                />
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
