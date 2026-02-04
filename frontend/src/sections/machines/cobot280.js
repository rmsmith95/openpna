import { useState, useEffect } from 'react';
import {
  Card, CardContent, Stack, Table, TableBody, TableCell, TableHead, TableRow,
  Tabs, Tab,
} from '@mui/material';
import Cobot280Controls from './tabs/cobot280-controls';

export const Cobot280 = () => {
  const [tab, setTab] = useState(0);

  const [step, setStep] = useState([5, 5, 5, 5, 5, 5]);
  const [speed, setSpeed] = useState(50);
  const handleChange = (_, newValue) => setTab(newValue);

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
              </Stack>
            }
          />
          <Tab label="Joints" />
        </Tabs>

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
          />
        )}
      </CardContent>
    </Card>
  );
};
