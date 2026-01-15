import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, SvgIcon, MenuItem, Select
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Connections = () => {
  const [connections, setConnections] = useState({
    tinyG: {
      name: 'TinyG',
      type: 'serial',
      serial: {
        port: 'COM10',
        baud: 115200,
      },
      network: null,
      connected: false,
    },

    arduino: {
      name: 'Arduino',
      type: 'serial',
      serial: {
        port: 'COM3',
        baud: 9600,
      },
      network: null,
      connected: false,
    },

    cobot280: {
      name: 'Cobot280',
      type: 'network',
      serial: null,
      network: {
        ip: '10.163.187.60',
        port: 502,
      },
      connected: false,
    },

    esp32: {
      name: 'ESP32',
      type: 'network',
      serial: null,
      network: {
        ip: '10.163.187.219',
        port: 80,
      },
      connected: false,
    },
  });


  const update = (key, field, value) => {
    setConnections(prev => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleConnect = async (key) => {
    const c = connections[key];

    let endpoint = '';
    let body = {};

    if (c.type === 'serial') {
      endpoint = `/api/${key}/connect`;
      body = { port: c.port, baud: c.baud };
    } else {
      endpoint = `/api/${key}/connect_network`;
      body = { ip: c.ip, port: c.port };
    }

    try {
      const res = await fetch(endpoint, {
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

  const renderAddressCell = (key, c) => {
    return c.type === 'serial' ? (
      <TextField
        size="small"
        value={c.port}
        onChange={e => update(key, 'port', e.target.value)}
      />
    ) : (
      <TextField
        size="small"
        value={c.ip}
        onChange={e => update(key, 'ip', e.target.value)}
      />
    );
  };

  const renderBaudOrPortCell = (key, c) => {
    return c.type === 'serial' ? (
      <TextField
        size="small"
        type="number"
        value={c.baud}
        onChange={e => update(key, 'baud', Number(e.target.value))}
      />
    ) : (
      <TextField
        size="small"
        type="number"
        value={c.port}
        onChange={e => update(key, 'port', Number(e.target.value))}
      />
    );
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Name</TableCell>
          <TableCell>Type</TableCell>
          <TableCell>COM / IP</TableCell>
          <TableCell>Baud / Port</TableCell>
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
                value={c.type}
                onChange={e => update(key, 'type', e.target.value)}
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

Connections.propTypes = {};
