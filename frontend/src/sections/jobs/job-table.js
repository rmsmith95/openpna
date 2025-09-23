import PropTypes from 'prop-types';
import {
  Box,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  LinearProgress
} from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

export const JobsTable = (props) => {
  const {
    count = 0,
    items = [],
    currentJobId = null,
    onDeselectAll,
    onDeselectOne,
    onPageChange = () => {},
    onRowsPerPageChange,
    onSelectAll,
    onSelectOne,
    page = 0,
    rowsPerPage = 0,
    selected = []
  } = props;

  // Compute progress
  const completedCount = items.filter(j => j.status === 'Done').length;
  const progressPercent = (completedCount / count) * 100;

  return (
    <Card>
      <Scrollbar>
        <Box sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Job</TableCell>
                <TableCell>Part</TableCell>
                <TableCell>Target</TableCell>
                <TableCell>Machines</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {items.map((job) => {
                const isSelected = selected.includes(job.id);
                const isCurrent = job.id === currentJobId;
                return (
                  <TableRow
                    hover
                    key={job.id}
                    selected={isSelected}
                    sx={isCurrent ? { backgroundColor: 'rgba(76, 175, 80, 0.2)' } : {}}
                  >
                    <TableCell>{job.id}</TableCell>
                    <TableCell>{job.part}</TableCell>
                    <TableCell>{job.target}</TableCell>
                    <TableCell>{job.machines}</TableCell>
                    <TableCell>{job.status}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </Scrollbar>

      {/* Pagination with progress bar to the left and x/y jobs to the right */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1
        }}
      >
        {/* Progress bar fills remaining space */}
        <Box sx={{ flex: 1, mr: 1 }}>
          <LinearProgress variant="determinate" value={progressPercent} sx={{ height: 10, borderRadius: 5 }} />
        </Box>

        {/* x/y jobs text to the right of the progress bar */}
        <Typography variant="body2" color="textSecondary" sx={{ ml: 2, mr: 2, whiteSpace: 'nowrap' }}>
          {completedCount} / {count} jobs
        </Typography>

        {/* Pagination on the right */}
        <TablePagination
          component="div"
          count={count}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          page={page}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          sx={{ m: 0 }}
        />
      </Box>
    </Card>
  );
};

JobsTable.propTypes = {
  count: PropTypes.number,
  items: PropTypes.array,
  onDeselectAll: PropTypes.func,
  onDeselectOne: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  onSelectAll: PropTypes.func,
  onSelectOne: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  selected: PropTypes.array,
};
