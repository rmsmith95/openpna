import Head from 'next/head';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import {
  Box,
  Button,
  Container,
  Stack,
  SvgIcon,
  Typography,
  Unstable_Grid2 as Grid
} from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import CameraDashboard from 'src/sections/cameras/camera-layout';


const Page = () => (
  <>
    {/* <Head>
      <title>
        Cameras
      </title>
    </Head> */}
    {/* <Box
      component="main"
      sx={{
        flexGrow: 1,
        py: 8
      }}
    > */}
      {/* <Container maxWidth="xl"> */}
        {/* <Stack spacing={1}> */}
          {/* <Box
            sx={{
              display: 'flex',
              justifyContent: 'center'
            }}
          > */}
            <CameraDashboard />
          {/* </Box> */}
        {/* </Stack> */}
      {/* </Container> */}
    {/* </Box> */}
  </>
);

Page.getLayout = (page) => (
  <DashboardLayout>
    {page}
  </DashboardLayout>
);

export default Page;
