import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card,
  CardContent,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  Box,
  Button,
  SvgIcon,
  Typography
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';

export const Arm6DOF = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  // Data for axis table
  const axisData = [
    { joint: 'J1', min: 0, pos: 0, max: 360, rate: '3mm/s' },
    { joint: 'J2', min: 0, pos: 150, max: 'inf', rate: '3mm/s' },
    { joint: 'J3', min: 0, pos: 0, max: 300, rate: '3mm/s' },
    { joint: 'J4', min: 0, pos: 0, max: 300, rate: '3mm/s' },
    { joint: 'J5', min: 0, pos: 0, max: 300, rate: '3mm/s' },
    { joint: 'J6', min: 0, pos: 0, max: 300, rate: '3mm/s' },
  ];

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
                    <TableCell>Joint</TableCell>
                    <TableCell>Min</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell>Max</TableCell>
                    <TableCell>Rate</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {axisData.map((row) => (
                    <TableRow key={row.joint}>
                      <TableCell>{row.joint}</TableCell>
                      <TableCell>{row.min}</TableCell>
                      <TableCell>{row.pos}</TableCell>
                      <TableCell>{row.max}</TableCell>
                      <TableCell>{row.rate}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Controls panel */}
              <Stack spacing={1} sx={{ pl: 5, pr: 5, pt: 6 }}> {/* Added margin-top */}
                {axisData.map((row) => (
                  <Stack
                    key={row.joint}
                    direction="row"
                    spacing={1}
                    height={43}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Button variant="contained" sx={{ width: 50, height: 40 }}>
                      <SvgIcon component={ArrowLeftIcon} />
                    </Button>

                    <Box
                      sx={{
                        width: 40,
                        textAlign: 'center',
                      }}
                    >
                      <Typography variant="body2">{row.joint}</Typography>
                    </Box>

                    <Button variant="contained" sx={{ width: 50, height: 40 }}>
                      <SvgIcon component={ArrowRightIcon} />
                    </Button>
                  </Stack>
                ))}
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

Arm6DOF.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
