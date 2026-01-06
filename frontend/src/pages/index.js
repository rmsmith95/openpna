import Head from 'next/head';
import { Box, Container, Grid, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, Divider } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsPanel } from 'src/sections/jobs/jobs-panel';
import CameraDashboard from 'src/sections/cameras/camera-layout';

// --- Example machine list ---
const machines = [
  { name: 'gantry', size: '700x500x300', attachments: 'gripper' },
  { name: 'cobot280', size: '600x400x300', attachments: 'screwdriver' },
  { name: 'gripper', size: '75x50x50', attachments: null },
];

const Page = () => {
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
                        sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
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
                  // p: 2,
                  borderRadius: 2,
                  height: '50vh',          // <-- limit height to half the screen
                  minHeight: 200,          // optional: ensure a minimum height
                  backgroundColor: 'grey.900',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'grey.300',
                  overflow: 'hidden',      // optional: prevent overflow
                }}
              >
                <CameraDashboard />
              </Paper>
            </Grid>

            {/* Bottom: Jobs panel */}
            <Grid item xs={12}>
              <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Jobs
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <JobsPanel /> {/* <-- use JobsPanel instead of JobsTable */}
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
