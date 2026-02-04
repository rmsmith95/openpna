import { useState } from 'react';
import { Stack, Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Button, TextField } from '@mui/material';
import { goto } from './gantry-actions'; // adjust path as needed

const GantryLocations = ({
  locations = [],                  // default to empty array
  position = { x: 0, y: 0, z: 0, a: 0 },  // default to 0
  onUpdateLocations = () => {}     // default to no-op function
}) => {
  const [newLocation, setNewLocation] = useState({ name: '', x: 0, y: 0, z: 0, a: 0 });

  // Prevent adding a location if locations isn't ready
  const handleAdd = () => {
    if (!newLocation.name) return;
    const updated = [...(locations || []), newLocation];
    onUpdateLocations(updated); 
    setNewLocation({ name: '', x: 0, y: 0, z: 0, a: 0 });
  };

  const handleDelete = (name) => {
    if (!locations) return;
    const updated = locations.filter(loc => loc.name !== name);
    onUpdateLocations(updated);
  };

  // Wait until locations and position are defined
  if (!locations || !position) {
    return (
      <Box p={2}>
        <Typography>Loading locations...</Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={3}>
      {/* Current Position */}
      <Box mb={2}>
        <Typography variant="subtitle1">
          Current Position: {position.x ?? 0}, {position.y ?? 0}, {position.z ?? 0}, {position.a ?? 0}
        </Typography>
      </Box>

      {/* Add New Location */}
      <Stack direction="row" spacing={1} alignItems="center" mb={2} flexWrap="wrap">
        <TextField
          label="Name"
          size="small"
          value={newLocation.name}
          onChange={(e) => setNewLocation({ ...newLocation, name: e.target.value })}
        />
        <TextField
          label="X"
          width="20px"
          size="small"
          type="number"
          value={newLocation.x}
          onChange={(e) => setNewLocation({ ...newLocation, x: parseFloat(e.target.value) || 0 })}
        />
        <TextField
          label="Y"
          size="small"
          type="number"
          value={newLocation.y}
          onChange={(e) => setNewLocation({ ...newLocation, y: parseFloat(e.target.value) || 0 })}
        />
        <TextField
          label="Z"
          size="small"
          type="number"
          value={newLocation.z}
          onChange={(e) => setNewLocation({ ...newLocation, z: parseFloat(e.target.value) || 0 })}
        />
        <TextField
          label="A"
          size="small"
          type="number"
          value={newLocation.a}
          onChange={(e) => setNewLocation({ ...newLocation, a: parseFloat(e.target.value) || 0 })}
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Location
        </Button>
      </Stack>

      {/* Locations Table */}
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Position</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {locations.map((location) => (
            <TableRow key={location.name}>
              <TableCell>{location.name}</TableCell>
              <TableCell>
                {location.x ?? 0}, {location.y ?? 0}, {location.z ?? 0}, {location.a ?? 0}
              </TableCell>
              <TableCell>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="contained"
                    onClick={() => goto({ ...location, speed: 1000 })}
                  >
                    GoTo
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => handleDelete(location.name)}
                  >
                    Delete
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
          {locations.length === 0 && (
            <TableRow>
              <TableCell colSpan={3} align="center">
                No locations defined
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Stack>
  );
};

export default GantryLocations;