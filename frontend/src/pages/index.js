import Head from 'next/head';
import { Box, Container, Grid, Paper, Typography, Table, TableHead, TableBody, TableRow, TableCell, Divider } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsPanel } from 'src/sections/jobs/jobs-panel';
import CameraDashboard from 'src/sections/cameras/camera-layout';
import { MachinePanel } from 'src/sections/machines/machines-panel';


const Page = () => {
  return (
    <>
      <Head>
        <title>MicroFactory Dashboard</title>
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 'clamp(8px, 4vw, 80px)'
        }}
      >
        <Grid container spacing={3}>

          {/* Top Left: Machine list */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '50vh',
                overflow: 'auto',
                p: 1,
              }}
            >
              <MachinePanel
                sx={{
                  flexShrink: 0,
                }}
              />
            </Paper>
          </Grid>

          {/* Top Right: Camera feed placeholder */}
          <Grid item xs={12} md={6}>
            <Paper
              elevation={3}
              sx={{
                borderRadius: 2,
                height: '50vh',
                minHeight: 200,
                backgroundColor: 'grey.900',
                display: 'flex',
                overflow: 'auto', // ⬅️ allow scrollbars
              }}
            >
              <Box
                sx={{
                  flex: 1,
                  minWidth: 0,
                  minHeight: 0,
                  display: 'flex',
                }}
              >
                <CameraDashboard />
              </Box>
            </Paper>
          </Grid>

          {/* Bottom: Jobs panel */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Divider sx={{ mb: 2 }} />
              <JobsPanel />
            </Paper>
          </Grid>

        </Grid>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
