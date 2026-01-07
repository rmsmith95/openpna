import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
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
  Typography,
  TextField
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import GantryControls from '../../components/gantry-controls';
import { getInfo, goto } from '../../components/gantry-actions';
import { useFactory } from "src/utils/factory-context";


export const Gantry = () => {
  const [tab, setTab] = useState(0);

  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const { machines, } = useFactory();
  const gantry = Object.values(machines || {}).find(m => m.name === "gantry");

  const handleChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    // function to fetch and update state
    const fetchInfo = async () => {
      const result = await getInfo();
      if (result) {
        setData(result.data);
        setPosition(result.position);
      }
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card>
      <CardContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Box>
          <Tabs
            value={tab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Gantry</span>
              </Stack>
            } />
            <Tab label="Control" />
            <Tab label="Locations" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box>
          {tab === 0 && (
            <Stack spacing={2} alignItems="flex-start">
              {/* Machine table */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dimensions (mm)</TableCell>
                    <TableCell>Workspace</TableCell>
                    <TableCell>Max Load</TableCell>
                    <TableCell>Cad File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>700x500x300</TableCell>
                    <TableCell>560x360x80xinfdeg</TableCell>
                    <TableCell>3kg</TableCell>
                    <TableCell>gantry.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {tab === 1 && (
            <GantryControls
              position={position}
              data={data}
              gotoPosition={gotoPosition}
              setGotoPosition={setGotoPosition}
            />
          )}

          {tab === 2 && (
            <Stack>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {gantry?.locations
                    ? Object.values(gantry.locations).map((loc) => (
                      <TableRow key={loc.id}>
                        <TableCell>{loc.name}</TableCell>
                        <TableCell>
                          {loc.location.x}, {loc.location.y}, {loc.location.z}, {loc.location.a}
                        </TableCell>
                        <TableCell>
                          <Button variant="contained" onClick={() => goto({...loc.location, speed:1000})}>
                            GoTo
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                    : (
                      <TableRow>
                        <TableCell colSpan={2}>Loading locations...</TableCell>
                      </TableRow>
                    )
                  }
                </TableBody>
              </Table>
            </Stack>
          )}

        </Box>
      </CardContent>
    </Card>
  );
};

Gantry.propTypes = {
  connectedTinyG: PropTypes.bool,
};
