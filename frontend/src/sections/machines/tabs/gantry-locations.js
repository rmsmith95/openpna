import { useState, useMemo } from 'react';
import {
  Stack,
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button,
  TextField,
  Paper
} from '@mui/material';
import { goto, editLocations } from './gantry-actions';

const GantryLocations = ({
  gantry_locations = [],
  setLocations,
  position = { x: 0, y: 0, z: 0, a: 0 },
}) => {
  const [newLocation, setNewLocation] = useState({
    name: '',
    x: 0,
    y: 0,
    z: 0,
    a: 0
  });

  // auto default name from coords
  const defaultName = useMemo(
    () => `X${newLocation.x}_Y${newLocation.y}_Z${newLocation.z}_A${newLocation.a}`,
    [newLocation]
  );

  // -------------------
  // ADD
  // -------------------
  const handleAdd = async () => {
    const name = newLocation.name.trim() || defaultName;

    if (gantry_locations.find(loc => loc.name === name)) {
      alert('Location name already exists');
      return;
    }

    const updated = [...gantry_locations, { ...newLocation, name }];

    setLocations(updated);            // ✅ update UI
    await editLocations(updated);     // ✅ save backend

    setNewLocation({ name: '', x: 0, y: 0, z: 0, a: 0 });
  };

  // -------------------
  // DELETE
  // -------------------
  const handleDelete = async (name) => {
    const updated = gantry_locations.filter(loc => loc.name !== name);
    setLocations(updated);            // ✅ update UI
    await editLocations(updated);     // ✅ save backend
  };

  // -------------------
  // SET CURRENT
  // -------------------
  const handleSetCurrent = () => {
    setNewLocation(prev => ({
      ...prev,
      x: position.x,
      y: position.y,
      z: position.z,
      a: position.a,
    }));
  };

  if (!position) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Stack spacing={4}>

      {/* Current Position */}
      <Box>
        <Typography fontWeight="bold">Current Position</Typography>
        <Typography>
          X:{position.x} Y:{position.y} Z:{position.z} A:{position.a}
        </Typography>
        <Button variant="outlined" onClick={handleSetCurrent}>
          Set Current
        </Button>
      </Box>

      {/* Add */}
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight="bold">Add Location</Typography>

        <Stack direction="row" spacing={2} flexWrap="wrap">

          <TextField
            label="Name"
            size="small"
            value={newLocation.name}
            placeholder={defaultName}
            onChange={(e) =>
              setNewLocation({ ...newLocation, name: e.target.value })
            }
          />

          {['x','y','z','a'].map(axis => (
            <TextField
              key={axis}
              label={axis.toUpperCase()}
              size="small"
              type="number"
              value={newLocation[axis]}
              onChange={(e) =>
                setNewLocation({
                  ...newLocation,
                  [axis]: parseFloat(e.target.value) || 0
                })
              }
              sx={{ width: 90 }}
            />
          ))}

          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>

        </Stack>
      </Paper>

      {/* Table */}
      <Paper>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell />
            </TableRow>
          </TableHead>

          <TableBody>
            {gantry_locations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} align="center">
                  No locations
                </TableCell>
              </TableRow>
            ) : (
              gantry_locations.map((loc) => (
                <TableRow key={loc.name}>
                  <TableCell>{loc.name}</TableCell>
                  <TableCell>
                    {loc.x}, {loc.y}, {loc.z}, {loc.a}
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Button
                        size="small"
                        variant="contained"
                        onClick={() => goto({ ...loc, speed: 1000 })}
                      >
                        GoTo
                      </Button>

                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        onClick={() => handleDelete(loc.name)}
                      >
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

    </Stack>
  );
};

export default GantryLocations;
