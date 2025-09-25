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
  Typography,
  TextField
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Arm6DOF = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  // Connection state
  const [connected, setConnected] = useState(false);
  const [port, setPort] = useState('COM4');   // Example
  const [baud, setBaud] = useState(115200);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  const handleConnect = async () => {
    try {
      // TODO: call your FastAPI backend e.g. /connect_arm
      setConnected(true);
    } catch (err) {
      console.error("Failed to connect:", err);
      setConnected(false);
    }
  };

  const handleDisconnect = () => {
    // TODO: call backend disconnect
    setConnected(false);
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
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Connection</span>
                  {connected ? (
                    <SvgIcon fontSize="small" color="success">
                      <CheckCircleIcon />
                    </SvgIcon>
                  ) : (
                    <SvgIcon fontSize="small" color="error">
                      <XCircleIcon />
                    </SvgIcon>
                  )}
                </Stack>
              }
            />
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
              <Stack spacing={1} sx={{ pl: 5, pr: 5, pt: 6 }}>
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

                    <Box sx={{ width: 40, textAlign: 'center' }}>
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

          {tab === 2 && (
            <Stack spacing={2}>
              <TextField
                label="Port"
                value={port}
                onChange={(e) => setPort(e.target.value)}
              />
              <TextField
                label="Baud Rate"
                type="number"
                value={baud}
                onChange={(e) => setBaud(Number(e.target.value))}
              />
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="success"
                  onClick={handleConnect}
                  disabled={connected}
                >
                  Connect
                </Button>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisconnect}
                  disabled={!connected}
                >
                  Disconnect
                </Button>
              </Stack>
            </Stack>
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
