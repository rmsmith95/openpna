import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Card, CardContent, Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, FormControl, InputLabel, Select, MenuItem, SvgIcon
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Connections = ({ setConnectionsParent }) => {
  // Single state for all connections
  const [connections, setConnections] = useState({
    tinyG: { port: 'COM10', baud: 115200, connected: false },
    arduino: { port: 'COM3', baud: 9600, connected: false },
    cobot280: { type: 'network', ip: '10.163.187.60', baud: 115200, connected: false },
    esp32: { ip: '10.163.187.219', connected: false },
  });

  // Handlers
  const handleConnect = async (key) => {
    try {
      let endpoint = '';
      let body = {};
      switch (key) {
        case 'tinyG':
          endpoint = '/api/tinyg/connect';
          body = { port: connections.tinyG.port, baud: connections.tinyG.baud };
          break;
        case 'arduino':
          endpoint = '/api/arduino/connect';
          body = { port: connections.arduino.port, baud: connections.arduino.baud };
          break;
        case 'cobot280':
          endpoint = '/api/cobot280/connect_network';
          body = { ip: connections.cobot280.ip };
          break;
        case 'esp32':
          endpoint = '/api/gripper/connect';
          body = { servo_id: 1 };
          break;
        default:
          return;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      const isConnected =
        key === 'esp32'
          ? !!data.connected
          : key === 'cobot280'
            ? data.status === 'ok'
            : data.status === 'connected';

      setConnections((prev) => ({
        ...prev,
        [key]: { ...prev[key], connected: isConnected },
      }));
    } catch (err) {
      console.error(`Failed to connect ${key}:`, err);
      setConnections((prev) => ({
        ...prev,
        [key]: { ...prev[key], connected: false },
      }));
    }
  };

  const updateConnectionField = (key, field, value) => {
    setConnections((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>Port / IP</TableCell>
          <TableCell>Baud</TableCell>
          <TableCell>Connect</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {/* TinyG */}
        <TableRow>
          <TableCell>
            TinyG
            <SvgIcon fontSize="small" color={connections.tinyG.connected ? 'success' : 'error'} sx={{ ml: 1 }}>
              {connections.tinyG.connected ? <CheckCircleIcon /> : <XCircleIcon />}
            </SvgIcon>
          </TableCell>
          <TableCell>
            Serial
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              value={connections.tinyG.port}
              onChange={(e) => updateConnectionField('tinyG', 'port', e.target.value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              type="number"
              value={connections.tinyG.baud}
              onChange={(e) => updateConnectionField('tinyG', 'baud', Number(e.target.value))}
            />
          </TableCell>
          <TableCell>
            <Button variant="contained" color="success" onClick={() => handleConnect('tinyG')}>
              Connect
            </Button>
          </TableCell>
        </TableRow>

        {/* Arduino */}
        <TableRow>
          <TableCell>
            Arduino
            <SvgIcon fontSize="small" color={connections.arduino.connected ? 'success' : 'error'} sx={{ ml: 1 }}>
              {connections.arduino.connected ? <CheckCircleIcon /> : <XCircleIcon />}
            </SvgIcon>
          </TableCell>
          <TableCell>
            Network
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              value={connections.arduino.port}
              onChange={(e) => updateConnectionField('arduino', 'port', e.target.value)}
            />
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              type="number"
              value={connections.arduino.baud}
              onChange={(e) => updateConnectionField('arduino', 'baud', Number(e.target.value))}
            />
          </TableCell>
          <TableCell>
            <Button variant="contained" color="success" onClick={() => handleConnect('arduino')}>
              Connect
            </Button>
          </TableCell>
        </TableRow>

        {/* Cobot280 */}
        <TableRow>
          <TableCell>
            Cobot280
            <SvgIcon fontSize="small" color={connections.cobot280.connected ? 'success' : 'error'} sx={{ ml: 1 }}>
              {connections.cobot280.connected ? <CheckCircleIcon /> : <XCircleIcon />}
            </SvgIcon>
          </TableCell>
          <TableCell>
            Network
          </TableCell>
          <TableCell>
            <TextField
              size="small"
              value={connections.cobot280.ip}
              onChange={(e) => updateConnectionField('cobot280', 'ip', e.target.value)}
            />
          </TableCell>
          <TableCell>
            -
          </TableCell>
          <TableCell>
            <Button variant="contained" color="success" onClick={() => handleConnect('cobot280')}>
              Connect
            </Button>
          </TableCell>
        </TableRow>

        {/* ESP32 / Gripper */}
        <TableRow>
          <TableCell>
            ESP32
            <SvgIcon fontSize="small" color={connections.esp32.connected ? 'success' : 'error'} sx={{ ml: 1 }}>
              {connections.esp32.connected ? <CheckCircleIcon /> : <XCircleIcon />}
            </SvgIcon>
          </TableCell>
          <TableCell>Network</TableCell>
          <TableCell>
            <TextField
              size="small"
              value={connections.esp32.ip}
              onChange={(e) => updateConnectionField('esp32', 'ip', e.target.value)}
            />
          </TableCell>
          <TableCell>-</TableCell>
          <TableCell>
            <Button variant="contained" color="success" onClick={() => handleConnect('esp32')}>
              Connect
            </Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

Connections.propTypes = {
  setConnectionsParent: PropTypes.func, // optional, in case parent needs updates
};
