import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import { Box, Container, Unstable_Grid2 as Grid, Stack } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { Gantry } from 'src/sections/machines/gantry';
import { OverviewLatestOrders } from 'src/sections/machines/arm6dof';
import { OverviewLatestProducts } from 'src/sections/machines/overview-latest-products';
import { OverviewSales } from 'src/sections/machines/overview-sales';
import { OverviewTasksProgress } from 'src/sections/machines/overview-tasks-progress';
import { OverviewTotalCustomers } from 'src/sections/machines/overview-total-customers';
import { OverviewTotalProfit } from 'src/sections/machines/overview-total-profit';
import { OverviewTraffic } from 'src/sections/machines/overview-traffic';
import { Arm6DOF } from 'src/sections/machines/arm6dof';

const now = new Date();

const Page = () => (
  <>
    <Head>
      <title>
        Overview | Devias Kit
      </title>
    </Head>
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    >
      <Container maxWidth="xl">
        <Stack spacing={3}>
          <Gantry
            difference={12}
            positive
            sx={{ height: "100%" }}
            value="$24k"
          />
          <Arm6DOF
            difference={12}
            positive
            sx={{ height: "100%" }}
            value="$24k"
          />
        </Stack>
      </Container>
    </Box>
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
