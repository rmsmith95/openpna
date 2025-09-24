import { useCallback, useMemo, useState } from 'react';
import Head from 'next/head';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
import PlusIcon from '@heroicons/react/24/solid/PlusIcon';
import PlayIcon from '@heroicons/react/24/solid/PlayIcon';
import StopIcon from '@heroicons/react/24/solid/StopIcon';
import ArrowPathIcon from '@heroicons/react/24/solid/ArrowPathIcon';
import {
  Box,
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
import { PartSearch } from 'src/sections/parts/part-search';
import { applyPagination } from 'src/utils/apply-pagination';
import { initialJobs, initialParts } from 'src/utils/jobs-set1';
import { useSimulation } from 'src/sections/jobs/simulation';

const useParts = (page, rowsPerPage, visibleClasses, parts) => {
  return useMemo(() => {
    const filtered = parts.filter((item) => visibleClasses[item.class]);
    return applyPagination(filtered, page, rowsPerPage);
  }, [page, rowsPerPage, visibleClasses, parts]);
};

const usePartIds = (parts) => {
  return useMemo(() => parts.map((part) => part.id), [parts]);
};

const PartsPage = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const [visibleClasses, setVisibleClasses] = useState({
    part: true,
    jig: true,
    assembly: true,
  });

  const [parts, setParts] = useState(initialParts);
  const [jobs, setJobs] = useState(initialJobs);

  const filteredParts = useMemo(() => {
    return parts.filter((p) =>
      visibleClasses[p.class] &&
      (
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [parts, visibleClasses, searchQuery]);

  const partsPaginated = useMemo(
    () => applyPagination(filteredParts, page, rowsPerPage),
    [filteredParts, page, rowsPerPage]
  );

  const partsIds = useMemo(() => partsPaginated.map((part) => part.id), [partsPaginated]);
  const selection = useSelection(partsIds);

  const handlePageChange = useCallback((event, value) => setPage(value), []);
  const handleRowsPerPageChange = useCallback((event) => setRowsPerPage(event.target.value), []);

  const toggleClass = (cls) => {
    setVisibleClasses((prev) => ({ ...prev, [cls]: !prev[cls] }));
    setPage(0);
  };

  return (
    <>
      <Head>
        <title>Parts | Devias Kit</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Top controls */}
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Parts</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button color="inherit" startIcon={<SvgIcon fontSize="small"><ArrowUpOnSquareIcon /></SvgIcon>}>Import</Button>
                  <Button color="inherit" startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}>Export</Button>
                  <PartSearch value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }} />
                  <FormControlLabel control={<Checkbox checked={visibleClasses.part} onChange={() => toggleClass('part')} />} label="Parts" />
                  <FormControlLabel control={<Checkbox checked={visibleClasses.jig} onChange={() => toggleClass('jig')} />} label="Jigs" />
                  <FormControlLabel control={<Checkbox checked={visibleClasses.assembly} onChange={() => toggleClass('assembly')} />} label="Assembly" />
                </Stack>
              </Stack>
              {/* <div>
                <Button startIcon={<SvgIcon fontSize="small"><PlusIcon /></SvgIcon>} variant="contained">Add</Button>
              </div> */}
            </Stack>

            {/* Parts table */}
            <PartsTable
              count={parts.filter((p) => visibleClasses[p.class]).length}
              items={partsPaginated}
              onDeselectAll={selection.handleDeselectAll}
              onDeselectOne={selection.handleDeselectOne}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              onSelectAll={selection.handleSelectAll}
              onSelectOne={selection.handleSelectOne}
              page={page}
              rowsPerPage={rowsPerPage}
              selected={selection.selected}
            />
          </Stack>
        </Container>
      </Box>
    </>
  );
};

PartsPage.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default PartsPage;
