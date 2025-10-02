import MagnifyingGlassIcon from '@heroicons/react/24/solid/MagnifyingGlassIcon';
import { Card, InputAdornment, OutlinedInput, SvgIcon } from '@mui/material';

export const JobSearch = ({ value, onChange }) => (
  <Card sx={{ p: 2 }}>
    <OutlinedInput
      value={value}
      onChange={onChange}
      fullWidth
      placeholder="Search jobs"
      startAdornment={(
        <InputAdornment position="start">
          <SvgIcon color="action" fontSize="small">
            <MagnifyingGlassIcon />
          </SvgIcon>
        </InputAdornment>
      )}
      sx={{ maxWidth: 300 }}
    />
  </Card>
);