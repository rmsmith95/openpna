import { useState } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, SvgIcon, MenuItem, Select
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Connections = () => {
  const [connections, setConnections] = useState({
    tinyg: {
      name: 'TinyG',
      method: 'serial',
      com: 'COM10',
      baud: 115200,
      ip: '',
      port: -1,
      connected: false,
    },

    arduino: {
      name: 'Arduino',
      method: 'serial',
      com: 'COM3',
      baud: 9600,
      ip: '',
      port: -1,
      connected: false,
    },

    cobot280: {
      name: 'Cobot280',
      method: 'network',
      com: '',
      baud: 115200,
      ip: '10.163.187.60',
      port: 9000,
      connected: false,
    },

    esp32: {
      name: 'ESP32',
      method: 'network',
      com: '',
      baud: 115200,
      ip: '10.163.187.219',
      port: 8005,
      connected: false,
    },
  });

  // Flat updater
  const update = (key, field, value) => {
    setConnections(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value,
      },
    }));
  };

  // Connect API call — always send all values
  const handleConnect = async (key) => {
    const c = connections[key];

    const body = {
      method: c.method,
      com: c.com,
      baud: c.baud,
      ip: c.ip,
      port: c.port,
    };

    try {
      const res = await fetch(`/api/${key}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      const connected = data.status === 'ok' || data.status === 'connected';

      setConnections(prev => ({
        ...prev,
        [key]: { ...prev[key], connected },
      }));
    } catch (err) {
      console.error(`Failed to connect ${key}`, err);
      setConnections(prev => ({
        ...prev,
        [key]: { ...prev[key], connected: false },
      }));
    }
  };

  // Render COM / IP field
  const renderAddressCell = (key, c) => (
    <TextField
      size="small"
      value={c.method === 'serial' ? c.com : c.ip}
      onChange={e =>
        update(key, c.method === 'serial' ? 'com' : 'ip', e.target.value)
      }
    />
  );

  // Render Baud / Port field
  const renderBaudOrPortCell = (key, c) => (
    <TextField
      size="small"
      type="number"
      value={c.method === 'serial' ? c.baud : c.port}
      onChange={e =>
        update(
          key,
          c.method === 'serial' ? 'baud' : 'port',
          Number(e.target.value)
        )
      }
    />
  );

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Board</TableCell>
          <TableCell>Method</TableCell>
          <TableCell sx={{ minWidth: 180 }}>COM / IP</TableCell>
          <TableCell sx={{ minWidth: 180 }}>Baud / Port</TableCell>
          <TableCell>Connect</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {Object.entries(connections).map(([key, c]) => (
          <TableRow key={key}>
            <TableCell>
              {c.name}
              <SvgIcon
                fontSize="small"
                color={c.connected ? 'success' : 'error'}
                sx={{ ml: 1 }}
              >
                {c.connected ? <CheckCircleIcon /> : <XCircleIcon />}
              </SvgIcon>
            </TableCell>

            <TableCell>
              <Select
                size="small"
                value={c.method}
                onChange={e => update(key, 'method', e.target.value)}
              >
                <MenuItem value="serial">serial</MenuItem>
                <MenuItem value="network">network</MenuItem>
              </Select>
            </TableCell>

            <TableCell>{renderAddressCell(key, c)}</TableCell>
            <TableCell>{renderBaudOrPortCell(key, c)}</TableCell>

            <TableCell>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleConnect(key)}
              >
                Connect
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
