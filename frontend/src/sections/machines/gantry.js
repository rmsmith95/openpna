import PropTypes from 'prop-types';
import { useState } from 'react';
import {
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  TableHead,
  Tabs,
  Tab,
  Box,
  Button,
  SvgIcon,
  Typography
} from '@mui/material';
import ArrowUpIcon from '@heroicons/react/24/solid/ArrowUpIcon';
import ArrowDownIcon from '@heroicons/react/24/solid/ArrowDownIcon';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';

export const Gantry = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Card sx={sx}>
      <CardContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Axis" />
            <Tab label="Attachments" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Stack direction="row" spacing={4} alignItems="flex-start">
              {/* Table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Axis</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>X</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>54</TableCell>
                    <TableCell>600</TableCell>
                    <TableCell>3mm/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Y</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>54</TableCell>
                    <TableCell>400</TableCell>
                    <TableCell>3mm/s</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Z</TableCell>
                    <TableCell>0</TableCell>
                    <TableCell>280</TableCell>
                    <TableCell>300</TableCell>
                    <TableCell>3mm/s</TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Controls Panel */}
              <Stack direction="row" spacing={2} alignItems="center">
                {/* X/Y D-Pad */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1
                  }}
                >
                  <Button variant="contained" sx={{ width: 60, height: 60 }}>
                    <SvgIcon component={ArrowUpIcon} />
                  </Button>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="contained" sx={{ width: 60, height: 60 }}>
                      <SvgIcon component={ArrowLeftIcon} />
                    </Button>

                    <Box
                      sx={{
                        width: 60,
                        height: 60,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid #ccc',
                        borderRadius: 1
                      }}
                    >
                      <Typography>X/Y</Typography>
                    </Box>

                    <Button variant="contained" sx={{ width: 60, height: 60 }}>
                      <SvgIcon component={ArrowRightIcon} />
                    </Button>
                  </Stack>

                  <Button variant="contained" sx={{ width: 60, height: 60 }}>
                    <SvgIcon component={ArrowDownIcon} />
                  </Button>
                </Box>

                {/* Z Controls */}
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  <Button variant="contained" sx={{ width: 60, height: 60 }}>
                    <SvgIcon component={ArrowUpIcon} />
                  </Button>

                  <Box
                    sx={{
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #ccc',
                      borderRadius: 1
                    }}
                  >
                    <Typography>Z</Typography>
                  </Box>

                  <Button variant="contained" sx={{ width: 60, height: 60 }}>
                    <SvgIcon component={ArrowDownIcon} />
                  </Button>
                </Box>
              </Stack>
            </Stack>
          )}

          {tab === 1 && (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Cad File</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>101</TableCell>
                  <TableCell>Gripper</TableCell>
                  <TableCell>Gripper1</TableCell>
                  <TableCell>Jaw range 60mm, Close rate 3mm/s</TableCell>
                  <TableCell>/home/gripper1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>102</TableCell>
                  <TableCell>Soldering Iron</TableCell>
                  <TableCell>SolderingIron1</TableCell>
                  <TableCell></TableCell>
                  <TableCell>/home/SolderingIron1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Gantry.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
