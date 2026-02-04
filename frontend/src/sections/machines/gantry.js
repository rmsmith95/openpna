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
  TextField,
  Typography
} from '@mui/material';
import GantryControls from './tabs/gantry-controls';
import GantryTools from './tabs/gantry-tools'
import { getInfo, goto, stepMove } from './tabs/gantry-actions';
import { useFactory } from 'src/utils/factory-context';


export const Gantry = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });

  const { machines } = useFactory();
  const gantry = machines?.gantry;

  const toolend = useMemo(() => gantry?.toolend ?? null, [gantry]);
  const locations = useMemo(() => gantry?.locations ?? [], [gantry]);

  useEffect(() => {
    const id = setInterval(async () => {
      const result = await getInfo();
      if (result) {
        if (result.x === 0 && result.y === 0 && result.z === 0 && result.a === 0) return;
        setData(result);
        setPosition({
          x: result.x ?? 0,
          y: result.y ?? 0,
          z: result.z ?? 0,
          a: result.a ?? 0,
        });
      }
    }, 500);

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
        <Box>
          {tab === 0 && (
            <Stack spacing={2}>
                    {toolend && (
                      <Box display="flex" alignItems="center" gap={1} sx={{pl:2, pt:3}}>
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
                    <TableCell>Cad File</TableCell>
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

          {tab === 1 && (
            <GantryControls
              position={position}
              data={data}
              gotoPosition={gotoPosition}
              setGotoPosition={setGotoPosition}
            />
          )}

          {tab === 2 && (
            <Stack spacing={3}>
              {/* Holders */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Position</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {locations.map((location) => (
                    <TableRow key={location.name}>
                      <TableCell>{location.name}</TableCell>
                      <TableCell>
                        {location.x}, {location.y},{' '}
                        {location.z}, {location.a}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() =>
                            goto({ ...location, speed: 1000 })
                          }>
                          GoTo
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
          {tab === 3 && (
            <GantryTools toolend={toolend}/>
          )}
        </Box>
      </CardContent>
    </Card >
  );
};
