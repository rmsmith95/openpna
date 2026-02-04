"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { screwdriverIn, screwdriverOut, screwdriverStop } from './gantry-actions';


const GantryTools = ({ toolend }) => {
  // tools / screwdriver
  const [threadPitch, setThreadPitch] = useState(5); // mm/turn
  const [depth, setDepth] = useState(12); // mm
  const [rotPs, setRotPs] = useState(1); // mm

  return (
    <Stack spacing={3} sx={{ p: 2 }}>
      {/* Toolend */}
      {toolend && (
        <Box display="flex" alignItems="center" gap={1}>
          <Typography variant="subtitle2" color="textSecondary">
            Tool End:
          </Typography>
          <Typography variant="body1" fontWeight="500">
            {toolend.effector || "None"}
          </Typography>
        </Box>
      )}
      <Typography variant="h6">Screwdriver Settings</Typography>

      {/* Thread pitch */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Thread Pitch (mm/turn):
        </Typography>
        <TextField
          type="number"
          size="small"
          value={threadPitch}
          onChange={(e) => setThreadPitch(Number(e.target.value))}
        />
      </Box>

      {/* Depth */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Depth (mm):
        </Typography>
        <TextField
          type="number"
          size="small"
          value={depth}
          onChange={(e) => setDepth(Number(e.target.value))}
        />
      </Box>

      {/* Speed */}
      <Box display="flex" alignItems="center" gap={2}>
        <Typography variant="subtitle2" color="textSecondary">
          Speed (turns/sec):
        </Typography>
        <TextField
          type="number"
          size="small"
          value={rotPs}
          onChange={(e) => setRotPs(Number(e.target.value))}
        />
      </Box>

      {/* Action buttons */}
      <Stack direction="row" spacing={2}>
        <Button
          variant="contained"
          color="primary"
          onClick={() => screwdriverIn(threadPitch, depth, rotPs)}
        >
          Screw In
        </Button>

        <Button
          variant="contained"
          color="secondary"
          onClick={() => screwdriverOut(threadPitch, depth, rotPs)}
        >
          Screw Out
        </Button>

        <Button
          variant="outlined"
          color="error"
          onClick={() => screwdriverStop({})}
        >
          Stop
        </Button>
      </Stack>
    </Stack>
  );
};

export default GantryTools;
