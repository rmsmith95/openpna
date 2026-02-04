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
import GripperControls from './tabs/gripper-controls';


export const Gripper = () => {
  const [tab, setTab] = useState(0);
  const handleChange = (event, newValue) => setTab(newValue);

  return (
    <Card>
      <CardContent sx={{ pt: 0 }}>
        <Box>
          <Tabs
            value={tab}
            onChange={handleChange}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Gripper</span>
                </Stack>
              }
            />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box>
          {tab === 0 && (
            <GripperControls/>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};
