import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsTable } from 'src/sections/jobs/job-table';
import { applyPagination } from 'src/utils/apply-pagination';
import { initialJobs } from 'src/utils/jobs-set1';

// --- Example machine list ---
const machines = [
  { name: 'LitePlacer1', attachments: 'gripper1, soldering iron1' },
  { name: 'Cobot 6DOF Arm', attachments: 'gripper2' },
  { name: 'Linear Actuator', attachments: '' },
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

      <Box component="main" sx={{ flexGrow: 1, mt: 2, py: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            
            {/* Top Left: Machine list */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 2, display: 'flex', flexDirection: 'column', height: '100%' }}
              >
                <Typography variant="h6" gutterBottom>
                  Machines
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Size</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Attachments</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {machines.map((machine, idx) => (
                      <TableRow
                        key={idx}
                        sx={{
                          '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                        }}
                      >
                        <TableCell>{machine.name}</TableCell>
                        <TableCell>{machine.size}</TableCell>
                        <TableCell>{machine.attachments || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>

            {/* Top Right: Camera feed placeholder */}
            <Grid item xs={12} md={6}>
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  height: 360,
                  backgroundColor: 'grey.900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'grey.300',
                  fontSize: 18,
                  fontWeight: 500,
                  letterSpacing: 1,
                  border: '2px grey',
                }}
              >
                Camera 1
              </Paper>
            </Grid>

            {/* Bottom: Jobs list */}
            <Grid item xs={12}>
              <Paper
                elevation={3}
                sx={{ p: 2, borderRadius: 2 }}
              >
                <Typography variant="h6" gutterBottom>
                  Jobs
                </Typography>
                <Divider sx={{ mb: 2 }} />
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
