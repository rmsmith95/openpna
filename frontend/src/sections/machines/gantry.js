import PropTypes from 'prop-types';
import { useState } from 'react';
import ArrowDownIcon from '@heroicons/react/24/solid/ArrowDownIcon';
import ArrowUpIcon from '@heroicons/react/24/solid/ArrowUpIcon';
import CurrencyDollarIcon from '@heroicons/react/24/solid/CurrencyDollarIcon';
import {
  Avatar,
  Card,
  CardContent,
  Stack,
  SvgIcon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tabs,
  Tab,
  Box
} from '@mui/material';

export const Gantry = (props) => {
  const { difference, positive = false, sx, value } = props;
  const [tab, setTab] = useState(0);

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  return (
    <Card sx={sx}>
      <CardContent sx={{ pt: 0 }}>
        <Stack
          alignItems="flex-start"
          direction="row"
          justifyContent="space-between"
          spacing={3}
        >
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Gantry
            </Typography>
            <Typography variant="h4">{value}</Typography>
          </Stack>
          {/* <Avatar
            sx={{
              backgroundColor: 'error.main',
              height: 56,
              width: 56
            }}
          >
            <SvgIcon>
              <CurrencyDollarIcon />
            </SvgIcon>
          </Avatar> */}
        </Stack>

        {/* Tabs for tables */}
        <Box sx={{ mt: 3 }}>
          <Tabs
            value={tab}
            onChange={handleChange}
            textColor="primary"
            indicatorColor="primary"
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Axis" />
            <Tab label="Attachments" />
          </Tabs>
        </Box>

        {/* Tab Panels */}
        <Box sx={{ mt: 2 }}>
          {tab === 0 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Axis</TableCell>
                  <TableCell>Min</TableCell>
                  <TableCell>Position</TableCell>
                  <TableCell>Max</TableCell>
                  <TableCell>Rate</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>X</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>54</TableCell>
                  <TableCell>600</TableCell>
                  <TableCell>3mm/s</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Y</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>54</TableCell>
                  <TableCell>400</TableCell>
                  <TableCell>3mm/s</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Z</TableCell>
                  <TableCell>0</TableCell>
                  <TableCell>280</TableCell>
                  <TableCell>300</TableCell>
                  <TableCell>3mm/s</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
          {tab === 1 && (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Id</TableCell>
                  <TableCell>Class</TableCell>
                  <TableCell>Name</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Cad File</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>101</TableCell>
                  <TableCell>Gripper</TableCell>
                  <TableCell>Gripper1</TableCell>
                  <TableCell>Jaw range 60mm, Close rate 3mm/s</TableCell>
                  <TableCell>/home/gripper1</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>102</TableCell>
                  <TableCell>Soldering Iron</TableCell>
                  <TableCell>SolderingIron1</TableCell>
                  <TableCell></TableCell>
                  <TableCell>/home/SolderingIron1</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

Gantry.propTypes = {
  difference: PropTypes.number,
  positive: PropTypes.bool,
  sx: PropTypes.object,
  value: PropTypes.string.isRequired
};
