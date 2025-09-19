import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, Button, Container, Stack, SvgIcon, Typography } from '@mui/material';
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { CustomersTable } from 'src/sections/jobs/job-table';
import { CustomersSearch } from 'src/sections/jobs/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';
// import Head from 'next/head';
import { Unstable_Grid2 as Grid } from '@mui/material';
import { Gantry } from 'src/sections/machines/gantry';
import { Arm6DOF } from 'src/sections/machines/arm6dof';
import { OverviewLatestProducts } from 'src/sections/machines/overview-latest-products';
import { OverviewSales } from 'src/sections/machines/overview-sales';
import { OverviewTasksProgress } from 'src/sections/machines/overview-tasks-progress';
import { OverviewTotalCustomers } from 'src/sections/machines/overview-total-customers';
import { OverviewTotalProfit } from 'src/sections/machines/overview-total-profit';
import { OverviewTraffic } from 'src/sections/machines/overview-traffic';

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const handlePageChange = useCallback(
    (event, value) => {
      setPage(value);
    },
    []
  );

  const handleRowsPerPageChange = useCallback(
    (event) => {
      setRowsPerPage(event.target.value);
    },
    []
  );

  return (
    <>
      <Head>
        <title>
          Machines
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
            <Stack
              direction="row"
              justifyContent="space-between"
              spacing={4}
            >
              <Stack spacing={1}>
                <Typography variant="h4">
                  Machines
                </Typography>
                <Stack
                  alignItems="center"
                  direction="row"
                  spacing={1}
                >
                  <Button
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    )}
                  >
                    Import
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={(
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    )}
                  >
                    Export
                  </Button>
                </Stack>
              </Stack>
              <div>
                <Button
                  startIcon={(
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  )}
                  variant="contained"
                >
                  Add
                </Button>
              </div>
            </Stack>

            <Box
              component="main"
              sx={{
                flexGrow: 1,
                py: 8
              }}
            >
              <Container maxWidth="xl">
                Micro Cell 1
                <Stack spacing={3}>
                  <Gantry
                    difference={12}
                    positive
                    sx={{ height: "100%" }}
                    value="LitePlacer1"
                  />
                  <Arm6DOF
                    difference={12}
                    positive
                    sx={{ height: "100%" }}
                    value="MyCobot1"
                  />
                </Stack>
              </Container>
            </Box>

          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
