import { useCallback, useState } from 'react';
import Head from 'next/head';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { Gantry } from 'src/sections/machines/gantry';
import { Arm6DOF } from 'src/sections/machines/arm6dof';
import CollapsibleCard from 'src/components/collapsible-card';

const Page = () => {

  return (
    <>
      <Head>
        <title>Machines</title>
      </Head>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Page header */}
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Machines</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="primary"
                    variant="contained"
                    onClick={async () => {
                      try {
                        const res = await fetch("http://localhost:8000/run_job");
                        const data = await res.json();
                        console.log("Server response:", data);
                        alert("FastAPI server responded: " + data.status);
                      } catch (err) {
                        console.error("Error connecting to FastAPI:", err);
                        alert("Could not reach FastAPI server");
                      }
                    }}
                  >
                    Run Server
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowUpOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    Import
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={
                      <SvgIcon fontSize="small">
                        <ArrowDownOnSquareIcon />
                      </SvgIcon>
                    }
                  >
                    Export
                  </Button>
                </Stack>
              </Stack>
              {/* <div>
                <Button
                  startIcon={
                    <SvgIcon fontSize="small">
                      <PlusIcon />
                    </SvgIcon>
                  }
                  variant="contained"
                >
                  Add
                </Button>
              </div> */}
            </Stack>

            <Stack spacing={2}>
              <CollapsibleCard title="LitePlacer1" color="secondary.main">
                <Gantry
                  difference={12}
                  positive
                  sx={{ height: '100%' }}
                  value="LitePlacer1"
                />
              </CollapsibleCard>

              <CollapsibleCard title="MyCobot1" color="success.main">
                <Arm6DOF
                  difference={12}
                  positive
                  sx={{ height: '100%' }}
                  value="MyCobot1"
                />
              </CollapsibleCard>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
