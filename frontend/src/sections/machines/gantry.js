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
import { getInfo } from '../../components/gantry-actions';
import { useFactory } from "src/utils/factory-context";


export const Gantry = (props) => {
  const { connectedTinyG } = props;
  const [tab, setTab] = useState(0);

  const [position, setPosition] = useState({ X: 0, Y: 0, Z: 0, A: 0 });
  const [gotoPosition, setGotoPosition] = useState({ x: 0, y: 0, z: 0, a: 0 });
  const { setGantryPosition } = useFactory();

  const handleChange = (event, newValue) => setTab(newValue);

  useEffect(() => {
    getInfo();
    const interval = setInterval(getInfo, 10000);
    return () => clearInterval(interval);
  }, [10000]);

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
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label={
              <Stack direction="row" alignItems="center" spacing={1}>
                <span>Gantry</span>
                {connectedTinyG ? (
                  <SvgIcon fontSize="small" color="success"><CheckCircleIcon /></SvgIcon>
                ) : (
                  <SvgIcon fontSize="small" color="error"><XCircleIcon /></SvgIcon>
                )}
              </Stack>
            } />
            <Tab label="Control" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
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
              gotoPosition={gotoPosition}
              setGotoPosition={setGotoPosition}
            />
          )}

        </Box>
      </CardContent>
    </Card>
  );
};

Gantry.propTypes = {
  connectedTinyG: PropTypes.bool,
};
