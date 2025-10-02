import { useCallback, useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import ArrowDownOnSquareIcon from '@heroicons/react/24/solid/ArrowDownOnSquareIcon';
import ArrowUpOnSquareIcon from '@heroicons/react/24/solid/ArrowUpOnSquareIcon';
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

// Pagination helper
const usePaginated = (items, page, rowsPerPage) => {
  return useMemo(() => applyPagination(items, page, rowsPerPage), [items, page, rowsPerPage]);
};

const PartsPage = () => {
  const [parts, setParts] = useState({}); // dict of partId -> part
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

  const [visibleClasses, setVisibleClasses] = useState({
    part: true,
    jig: true,
    assembly: true,
  });

  // Convert dict to array + ids
  const partsArray = useMemo(() => Object.values(parts), [parts]);
  const partsIds = useMemo(() => Object.keys(parts), [parts]);
  const selection = useSelection(partsIds);

  // Filter by visible class
  const filteredParts = useMemo(
    () => partsArray.filter((p) => visibleClasses[p.class]),
    [partsArray, visibleClasses]
  );

  const paginatedParts = usePaginated(filteredParts, page, rowsPerPage);

  // Fetch parts from backend
  const fetchParts = useCallback(async () => {
    try {
      const res = await fetch('/api/get_parts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          search: searchQuery,
          offset: page * rowsPerPage,
          showParts: visibleClasses.part,
          showJigs: visibleClasses.jig,
          showAssemblies: visibleClasses.assembly,
        }),
      });

      const data = await res.json();
      setParts(data.parts || {});
    } catch (err) {
      console.error('Error fetching parts:', err);
    }
  }, [page, rowsPerPage, searchQuery, visibleClasses]);

  useEffect(() => {
    fetchParts();
  }, [fetchParts]);

  const handlePageChange = (event, newPage) => setPage(newPage);

  const handleRowsChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const toggleClass = (cls) => {
    setVisibleClasses((prev) => ({ ...prev, [cls]: !prev[cls] }));
    setPage(0);
  };

  return (
    <>
      <Head>
        <title>Parts | OpenPnA</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Top controls */}
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Parts</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Button
                    color="inherit"
                    startIcon={<SvgIcon fontSize="small"><ArrowUpOnSquareIcon /></SvgIcon>}
                  >
                    Import
                  </Button>
                  <Button
                    color="inherit"
                    startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}
                  >
                    Export
                  </Button>
                  <PartSearch
                    value={searchQuery}
                    onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
                  />
                  <FormControlLabel
                    control={<Checkbox checked={visibleClasses.part} onChange={() => toggleClass('part')} />}
                    label="Parts"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={visibleClasses.jig} onChange={() => toggleClass('jig')} />}
                    label="Jigs"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={visibleClasses.assembly} onChange={() => toggleClass('assembly')} />}
                    label="Assembly"
                  />
                </Stack>
              </Stack>
            </Stack>

            {/* Parts table */}
            <PartsTable
              count={filteredParts.length}
              items={paginatedParts}
              onDeselectAll={selection.handleDeselectAll}
              onDeselectOne={selection.handleDeselectOne}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsChange}
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
