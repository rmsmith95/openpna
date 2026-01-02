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
// import GantryActions from '../../components/gantry-actions';
import GripperControls from '../../components/gripper-controls';
import { useFactory } from "src/utils/factory-context";


export const Gripper = (props) => {
  const { connectedServoGripper } = props;

  const [tab, setTab] = useState(0);
  const handleChange = (event, newValue) => setTab(newValue);

  return (
    <Card >
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
            <Tab
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <span>Gripper</span>
                  {connectedServoGripper ? (
                    <SvgIcon fontSize="small" color="success">
                      <CheckCircleIcon />
                    </SvgIcon>
                  ) : (
                    <SvgIcon fontSize="small" color="error">
                      <XCircleIcon />
                    </SvgIcon>
                  )}
                </Stack>
              }
            />
            <Box
              sx={{
                borderRadius: 2,
                width: 220,
                textAlign: "center",
                py: 1.5
              }}
            >
            </Box>

          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <GripperControls/>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Gripper.propTypes = {
  connectedServoGripper: PropTypes.bool
};
