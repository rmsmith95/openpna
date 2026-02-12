import { useState, useEffect } from 'react';
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  TextField, Button, Select, MenuItem, SvgIcon
} from '@mui/material';
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

export const Connections = ({ serverStatus }) => {
  // Editable machine config state
  const [machines, setMachines] = useState([
    { key: 'server', name: 'Server', method: 'network', ip: '127.0.0.1', port: 8000, com: 'COM1', baud: 115200 },
    { key: 'gantry', name: 'Gantry', method: 'serial', ip: '192.168.1.1', port: 8000, com: 'COM10', baud: 115200 },
    { key: 'arduino', name: 'Arduino', method: 'serial', ip: '192.168.1.1', port: 8000, com: 'COM3', baud: 115200 },
    { key: 'cobot280', name: 'Cobot280', method: 'network', ip: '10.163.187.60', port: 9000, com: 'COM4', baud: 115200 },
    { key: 'gripper', name: 'ESP32', method: 'network', ip: '192.168.4.1', port: 80, com: 'COM5', baud: 115200 },
  ]);

  const [connecting, setConnecting] = useState({});

  // Helper to update a field in local machine state
  const updateMachine = (key, field, value) => {
    setMachines(prev =>
      prev.map(m => (m.key === key ? { ...m, [field]: value } : m))
    );
  };

  const handleConnect = async (m) => {
    setConnecting(prev => ({ ...prev, [m.key]: true }));

    const body = {
      method: m.method,
      com: m.com,
      baud: m.baud,
      ip: m.ip,
      port: m.port,
    };

    try {
      const res = await fetch(`/api/${m.key}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      console.log(`${m.name} connect response:`, data);
      // You could optionally trigger a refresh of serverStatus here
    } catch (err) {
      console.error(`Failed to connect ${m.name}:`, err);
    } finally {
      setConnecting(prev => ({ ...prev, [m.key]: false }));
    }
  };

  return (
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>Board</TableCell>
          <TableCell>Method</TableCell>
          <TableCell>COM / IP</TableCell>
          <TableCell>Baud / Port</TableCell>
          <TableCell>Connect</TableCell>
        </TableRow>
      </TableHead>

      <TableBody>
        {machines.map((m) => {
          const connected =
            m.key === "server"
              ? serverStatus != null
              : serverStatus?.machines?.[m.key] ?? false;

          const isConnecting = connecting[m.key] || false;

          return (
            <TableRow key={m.key}>
              <TableCell>
                {m.name}
                <SvgIcon
                  fontSize="small"
                  color={connected ? 'success' : 'error'}
                  sx={{ ml: 1 }}
                >
                  {connected ? <CheckCircleIcon /> : <XCircleIcon />}
                </SvgIcon>
              </TableCell>

              <TableCell>
                <Select
                  size="small"
                  value={m.method}
                  onChange={e => updateMachine(m.key, 'method', e.target.value)}
                >
                  <MenuItem value="serial">serial</MenuItem>
                  <MenuItem value="network">network</MenuItem>
                </Select>
              </TableCell>

              <TableCell>
                <TextField
                  size="small"
                  value={m.method === 'serial' ? m.com : m.ip}
                  onChange={e =>
                    updateMachine(m.key, m.method === 'serial' ? 'com' : 'ip', e.target.value)
                  }
                />
              </TableCell>

              <TableCell>
                <TextField
                  size="small"
                  type="number"
                  value={m.method === 'serial' ? m.baud : m.port}
                  onChange={e =>
                    updateMachine(m.key, m.method === 'serial' ? 'baud' : 'port', Number(e.target.value))
                  }
                />
              </TableCell>

              <TableCell>
                <Button
                  variant="contained"
                  color="primary"
                  // disabled={isConnecting || connected}
                  onClick={() => handleConnect(m)}
                >
                  {isConnecting ? 'Connecting...' : 'Connect'}
                </Button>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};
