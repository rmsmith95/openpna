import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import { subDays, subHours } from 'date-fns';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import { Box, 
  Button,
  Checkbox,
  Container,
  FormControlLabel,
  Stack,
  SvgIcon,
  Typography
} from '@mui/material';
  
import { useSelection } from 'src/hooks/use-selection';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';
import { PartsTable } from 'src/sections/parts/part-table';
import { CustomersSearch } from 'src/sections/jobs/customers-search';
import { applyPagination } from 'src/utils/apply-pagination';

const data = [
  {
    'id': '1',
    'class': 'part',
    'name': 'body',
    'mass': '0.3',
    'description': '3d printed',
    'cad': '/home/body.stl'
  },
  {
    'id': '9',
    'class': 'jig',
    'name': 'body jig',
    'mass': '0.3',
    'description': '3d printed',
    'cad': '/home/body_jig.stl'
  },
  {
    'id': '10',
    'class': 'assembly',
    'name': '',
    'mass': '0.7',
    'description': 'Parts 1, 2, 3',
    'cad': ''
  },
  {
    'id': '2',
    'class': 'part',
    'name': 'arm',
    'mass': '0.2',
    'description': '3d printed',
    'cad': ''
  },
    {
    'id': '3',
    'class': 'part',
    'name': 'battery',
    'mass': '1.2',
    'description': '1300mAh 75C',
    'cad': ''
  },
    {
    'id': '4',
    'class': 'part',
    'name': 'Flight Controller',
    'mass': '0.3',
    'description': 'SpeedyBee',
    'cad': ''
  },
    {
    'id': '5',
    'class': 'part',
    'name': 'Electronic Speed Control',
    'mass': '0.3',
    'description': 'SpeedyBee',
    'cad': '',
  },
    {
    'id': '6',
    'class': 'part',
    'name': 'Propellor',
    'mass': '0.05',
    'description': '5 inch blades',
    'cad': ''
  },
    {
    'id': '7',
    'class': 'part',
    'name': 'Motors',
    'mass': '0.3',
    'description': '',
    'cad': '',
  },
    {
    'id': '8',
    'class': 'part',
    'name': 'Screws',
    'mass': '0.01',
    'description': '',
    'cad': '',
  },
];

const useParts = (page, rowsPerPage) => {
  return useMemo(
    () => {
      return applyPagination(data, page, rowsPerPage);
    },
    [page, rowsPerPage]
  );
};

const usePartIds = (parts) => {
  return useMemo(
    () => {
      return parts.map((part) => part.id);
    },
    [parts]
  );
};

const Page = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const parts = useParts(page, rowsPerPage);
  const partsIds = usePartIds(parts);
  const customersSelection = useSelection(partsIds);

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
          Parts | Devias Kit
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
                  Parts
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
                  <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Parts"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Jigs"
              />
              <FormControlLabel
                control={<Checkbox defaultChecked />}
                label="Assembly"
              />
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
            <PartsTable
              count={data.length}
              items={parts}
              onDeselectAll={customersSelection.handleDeselectAll}
              onDeselectOne={customersSelection.handleDeselectOne}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={customersSelection.handleSelectAll}
              onSelectOne={customersSelection.handleSelectOne}
              page={page}
              rowsPerPage={rowsPerPage}
              selected={customersSelection.selected}
            />
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
