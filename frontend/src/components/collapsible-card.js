import { useState } from 'react';
import {
  Box,
  Card,
  Collapse,
  IconButton,
  Typography
} from '@mui/material';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

const CollapsibleCard = ({ title, color = "primary.main", children }) => {
  const [open, setOpen] = useState(true);

  return (
    <Card
      sx={{
        mb: 0,
        overflow: "hidden",
        borderLeft: "1px solid",
        borderBottom: "1px solid",
        borderColor: color,   // match header bar
        borderTop: "none",    // remove border on top
      }}
    >
      {/* Header Bar */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 2,
          py: 1,
          bgcolor: color,
          color: "white",
          cursor: "pointer",
        }}
        onClick={() => setOpen(!open)}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        <IconButton
          size="small"
          sx={{ color: "white" }}
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
        >
          {open ? (
            <ChevronUpIcon style={{ width: 20, height: 20 }} />
          ) : (
            <ChevronDownIcon style={{ width: 20, height: 20 }} />
          )}
        </IconButton>
      </Box>

      {/* Collapsible Content */}
      <Collapse in={open}>
        <Box sx={{ pl: 1, pt: 1, mx: "auto" }}>
          {children}
        </Box>
      </Collapse>
    </Card>
  );
};

export default CollapsibleCard;
