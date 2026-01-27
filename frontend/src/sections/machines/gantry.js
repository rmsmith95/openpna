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
import GantryControls from '../../components/gantry-controls';
import { screwdriverIn, screwdriverOut, screwdriverStop, getInfo, goto, stepMove } from '../../components/gantry-actions';
import { useFactory } from 'src/utils/factory-context';


export const Gantry = () => {
  const [tab, setTab] = useState(0);
  const [data, setData] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });

  const { machines } = useFactory();
  const gantry = machines?.gantry;

  const toolend = useMemo(() => gantry?.toolend ?? null, [gantry]);
  const holders = useMemo(() => gantry?.holders ?? [], [gantry]);

  // tools / screwdriver
  const [threadPitch, setThreadPitch] = useState(5); // mm/turn
  const [depth, setDepth] = useState(12); // mm
  const [rotPs, setRotPs] = useState(1); // mm

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
              {/* Toolend */}
              {toolend && (
                <Box display="flex" alignItems="center" gap={1} sx={{ p: 2, pt: 4 }}>
                  <Typography variant="subtitle2" color="textSecondary">
                    Tool End:
                  </Typography>
                  <Typography variant="body1" fontWeight="500">
                    {toolend.effector || "None"}
                  </Typography>
                </Box>
              )}

              {/* Holders */}
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Position Out</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Position In</TableCell>
                    <TableCell></TableCell>
                    <TableCell>Effector</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {holders.map((holder) => (
                    <TableRow key={holder.id}>
                      <TableCell>{holder.name}</TableCell>
                      <TableCell>
                        {holder.positionOut?.x}, {holder.positionOut?.y},{' '}
                        {holder.positionOut?.z}, {holder.positionOut?.a}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() =>
                            goto({ ...holder.positionIn, speed: 1000 })
                          }>
                          GoTo
                        </Button>
                      </TableCell>
                      <TableCell>
                        {holder.positionIn?.x}, {holder.positionIn?.y},{' '}
                        {holder.positionIn?.z}, {holder.positionIn?.a}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          onClick={() =>
                            goto({ ...holder.positionOut, speed: 1000 })
                          }>
                          GoTo
                        </Button>
                      </TableCell>
                      <TableCell>{holder.effector}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          )}
          {tab === 3 && (
            <Stack spacing={3} sx={{ p: 2 }}>
              <Typography variant="h6">Screwdriver Settings</Typography>

              {/* Thread pitch */}
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Thread Pitch (mm/turn):
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={threadPitch}
                  onChange={(e) => setThreadPitch(Number(e.target.value))}
                />
              </Box>

              {/* Depth */}
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Depth (mm):
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={depth}
                  onChange={(e) => setDepth(Number(e.target.value))}
                />
              </Box>

              {/* Speed */}
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="subtitle2" color="textSecondary">
                  Speed (turns/sec):
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={rotPs}
                  onChange={(e) => setRotPs(Number(e.target.value))}
                />
              </Box>

              {/* Action buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => screwdriverIn(threadPitch, depth, rotPs)}
                >
                  Screw In
                </Button>

                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => screwdriverOut(threadPitch, depth, rotPs)}
                >
                  Screw Out
                </Button>

                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => screwdriverStop({})}
                >
                  Stop
                </Button>
              </Stack>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card >
  );
};
