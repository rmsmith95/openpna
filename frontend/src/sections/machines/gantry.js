import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Button,
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
  Typography
} from '@mui/material';
import GantryControls from './tabs/gantry-controls';
import GantryLocations from './tabs/gantry-locations';
import GantryTools from './tabs/gantry-tools';
import { getInfo } from './tabs/gantry-actions';
import { useFactory } from 'src/utils/factory-context';

export const Gantry = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });

  const { machines } = useFactory();
  const gantry = machines?.gantry;
  const [locations, setLocations] = useState(() => gantry?.locations ?? []);

  // Toolend info
  const toolend = useMemo(() => gantry?.toolend ?? null, [gantry]);

  // Fetch current gantry position every second
  const fetchPosition = async () => {
    const result = await getInfo();
    if (result && result.x != null && result.y != null && result.z != null && result.a != null) {
      setData(result);
      setPosition({
        x: result.x,
        y: result.y,
        z: result.z,
        a: result.a
      });
    }
  };

  useEffect(() => {
    const id = setInterval(fetchPosition, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Card>
      <CardContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Tabs
          value={tab}
          onChange={(_, newValue) => setTab(newValue)}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Gantry" />
          <Tab label="Control" />
          <Tab label="Locations" />
          <Tab label="Tools" />
        </Tabs>

        {/* Tab Panels */}
        <Box mt={2}>
          {/* Gantry Info Tab */}
          {tab === 0 && (
            <Stack spacing={2}>
              {toolend && (
                <Box display="flex" alignItems="center" gap={1} sx={{ pl: 2 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tool End:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {toolend.effector || "None"}
                  </Typography>
                </Box>
              )}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Dimensions (mm)</TableCell>
                    <TableCell>Workspace</TableCell>
                    <TableCell>Max Load</TableCell>
                    <TableCell>CAD File</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>700×500×300</TableCell>
                    <TableCell>560×360×80</TableCell>
                    <TableCell>3kg</TableCell>
                    <TableCell>gantry.stl</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Stack>
          )}

          {/* Control Tab */}
          {tab === 1 && (
            <GantryControls
              position={position}
              data={data}
              gotoPosition={gotoPosition}
              setGotoPosition={setGotoPosition}
            />
          )}

          {/* Locations Tab */}
          {tab === 2 && (
            <GantryLocations
              gantry_locations={locations}
              setLocations={setLocations}
              position={position}
            />
          )}

          {/* Tools Tab */}
          {tab === 3 && (
            <GantryTools toolend={toolend} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default Gantry;
