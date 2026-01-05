import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, Tab, Box, Button, SvgIcon, TextField, MenuItem, Select, FormControl, InputLabel, Typography
} from '@mui/material';
import ArrowLeftIcon from '@heroicons/react/24/solid/ArrowLeftIcon';
import ArrowRightIcon from '@heroicons/react/24/solid/ArrowRightIcon';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import Cobot280Controls from '../../components/cobot280-controls';
import {fetchPositions} from '../../components/cobot280-actions';

export const Cobot280 = (props) => {
  const { connectedCobot280 } = props;
  const [tab, setTab] = useState(0);

  const [joints, setJoints] = useState([0, 0, 0, 0, 0, 0]);
  const [step, setStep] = useState([5, 5, 5, 5, 5, 5]);
  const [speed, setSpeed] = useState(50);
  const handleChange = (_, newValue) => setTab(newValue);

  // fetch positions once on mount
  useEffect(() => {
    fetchPositions();
  }, []);

  const axisData = [
    { joint: "J1", max: 360 },
    { joint: "J2", max: 150 },
    { joint: "J3", max: 300 },
    { joint: "J4", max: 300 },
    { joint: "J5", max: 300 },
    { joint: "J6", max: 300 },
  ];

  return (
    <Card>
      <CardContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: "divider" }}
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Cobot280</span>
                  {connectedCobot280 ? (
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
            <Tab label="Joints" />
          </Tabs>
        </Box>

        {/* Panels */}
        <Box sx={{ mt: 2 }}>
          {/* Connection Tab */}
          {tab === 0 && (
            <Stack spacing={3}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Reach (mm)</TableCell>
                    <TableCell>Max Load</TableCell>
                    <TableCell>Cad File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>400</TableCell>
                    <TableCell>500g</TableCell>
                    <TableCell>cobot280.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {/* Joints Tab */}
          {tab === 1 && (
            <Cobot280Controls
              axisData={axisData}
              step={step}
              setStep={setStep}
              speed={speed}
              setSpeed={setSpeed}
              joints={joints}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Cobot280.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired,
};
