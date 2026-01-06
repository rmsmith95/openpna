import Head from 'next/head';
import { Container, Typography, Paper, Divider } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { JobsPanel } from 'src/sections/jobs/jobs-panel';

const JobsPage = () => {
  return (
    <>
      <Head>
        <title>Jobs | OpenPnA</title>
      </Head>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Jobs
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <JobsPanel />
        </Paper>
      </Container>
    </>
  );
};

JobsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default JobsPage;
