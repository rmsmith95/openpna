import { useState, useEffect, useMemo } from 'react';
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
} from '@mui/material';
import GantryControls from '../../components/gantry-controls';
import { getInfo, goto } from '../../components/gantry-actions';
import { useFactory } from 'src/utils/factory-context';

export const Gantry = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });

  const { machines } = useFactory();
  const gantry = machines?.gantry;

  // Convert gantry objects into an array for the table
  const gantryObjects = useMemo(() => {
    return gantry?.objects ? Object.values(gantry.objects) : [];
  }, [gantry]);

  useEffect(() => {
    // fetch gantry info continuously
    const fetchInfo = async () => {
      const result = await getInfo();
      if (result) {
        setData(result);
        setPosition({
          x: result.x ?? 0,
          y: result.y ?? 0,
          z: result.z ?? 0,
          a: result.a ?? 0,
        });
      }
    };

    fetchInfo();
  }, []);

  return (
    <Card>
      <CardContent sx={{ pt: 0 }}>
        {/* Tabs */}
        <Box>
          <Tabs
            value={tab}
            onChange={(_, newValue) => setTab(newValue)}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={<Stack direction="row" alignItems="center" spacing={1}><span>Gantry</span></Stack>} />
            <Tab label="Control" />
            <Tab label="Locations" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box>
          {tab === 0 && (
            <Stack spacing={2} alignItems="flex-start">
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
                    <TableCell>560x360x80x360</TableCell>
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
                  {gantryObjects.length > 0 ? (
                    gantryObjects.map((obj) => (
                      <TableRow key={obj.id}>
                        <TableCell>{obj.name}</TableCell>
                        <TableCell>
                          {obj.position.x}, {obj.position.y}, {obj.position.z}, {obj.position.a}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="contained"
                            onClick={() => goto({ ...obj.position, speed: 1000 })}
                          >
                            GoTo
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3}>Loading gantry objects...</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
