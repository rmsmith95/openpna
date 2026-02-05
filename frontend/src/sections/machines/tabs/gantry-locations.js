import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Paper,
  Stack,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
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

  // rename editing state
  const [editingName, setEditingName] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  // -------------------
  // default auto name
  // -------------------
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
    setLocations(updated);
    await editLocations(updated);

    setNewLocation({ name: '', x: 0, y: 0, z: 0, a: 0 });
  };

  // -------------------
  // DELETE
  // -------------------
  const handleDelete = async (name) => {
    const updated = gantry_locations.filter(loc => loc.name !== name);
    setLocations(updated);
    await editLocations(updated);
  };

  // -------------------
  // RENAME
  // -------------------
  const handleRename = async (oldName) => {
    const name = editingValue.trim();

    if (!name || name === oldName) {
      setEditingName(null);
      return;
    }

    if (gantry_locations.find(l => l.name === name)) {
      alert('Location name already exists');
      return;
    }

    const updated = gantry_locations.map(loc =>
      loc.name === oldName ? { ...loc, name } : loc
    );

    setLocations(updated);
    await editLocations(updated);
    setEditingName(null);
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

  const axisFieldSx = {
    width: 80,
    flexShrink: 0
  };

  return (
    <Stack spacing={1}>

      {/* Current Position */}
      <Paper sx={{ p: 2 }}>
        <Typography fontWeight="bold">
          Current Position
        </Typography>

        <Stack direction="row" spacing={1} flexWrap="wrap" alignItems="center">
          {['x', 'y', 'z', 'a'].map(axis => (
            <TextField
              key={axis}
              label={axis.toUpperCase()}
              size="small"
              value={position[axis]}
              InputProps={{ readOnly: true }}
              sx={axisFieldSx}
            />
          ))}

          <Button
            variant="outlined"
            onClick={handleSetCurrent}
            sx={{ height: 40 }}
          >
            Select
          </Button>
        </Stack>
      </Paper>

      {/* Add Location */}
      <Paper sx={{ pl: 2 }}>

        {/* Header row: title + name */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
        >
          <Typography fontWeight="bold" sx={{ minWidth: 120 }}>
            Add Location
          </Typography>

          <TextField
            label="Name"
            size="small"
            value={newLocation.name}
            placeholder={defaultName}
            InputLabelProps={{ shrink: true }}
            sx={{ width: 300 }}
            onChange={(e) =>
              setNewLocation(prev => ({
                ...prev,
                name: e.target.value
              }))
            }
          />
        </Stack>

        {/* Axis row */}
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          alignItems="center"
        >
          {['x', 'y', 'z', 'a'].map(axis => (
            <TextField
              key={axis}
              label={axis.toUpperCase()}
              size="small"
              type="number"
              value={newLocation[axis]}
              onChange={(e) =>
                setNewLocation(prev => ({
                  ...prev,
                  [axis]: parseFloat(e.target.value) || 0
                }))
              }
              sx={axisFieldSx}
            />
          ))}

          <Button variant="contained" onClick={handleAdd}>
            Add
          </Button>
        </Stack>

      </Paper>


      {/* Locations Table */}
      <Paper sx={{pt:2}}>
        <Table size="small" sx={{ tableLayout: 'fixed' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: 220 }}>Name</TableCell>
              <TableCell>Position</TableCell>
              <TableCell sx={{ width: 160 }} />
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
                <TableRow key={loc.name} hover>

                  {/* Editable Name */}
                  <TableCell>
                    {editingName === loc.name ? (
                      <TextField
                        size="small"
                        value={editingValue}
                        autoFocus
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={() => handleRename(loc.name)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(loc.name);
                          if (e.key === 'Escape') setEditingName(null);
                        }}
                        sx={{ width: '100%' }}
                      />
                    ) : (
                      <Typography
                        sx={{
                          cursor: 'pointer',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                        onClick={() => {
                          setEditingName(loc.name);
                          setEditingValue(loc.name);
                        }}
                      >
                        {loc.name}
                      </Typography>
                    )}
                  </TableCell>

                  {/* Position */}
                  <TableCell>
                    {loc.x}, {loc.y}, {loc.z}, {loc.a}
                  </TableCell>

                  {/* Actions */}
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
