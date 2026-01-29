import Head from "next/head";
import { Container, Typography, Paper, Divider } from '@mui/material';
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { MachinePanel } from "src/sections/machines/machines-panel";


const Page = () => {
  return (
    <>
      <Head>
        <title>Machines</title>
      </Head>

      <Container maxWidth="xl" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h4" gutterBottom>
            Machines
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <MachinePanel />
        </Paper>
      </Container>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
