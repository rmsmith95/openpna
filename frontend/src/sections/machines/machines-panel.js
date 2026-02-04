import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableRow,
} from "@mui/material";
import { Connections } from "src/sections/machines/tabs/connections";
import { StatusFooter } from "src/components/status-footer";
import { useMachineStatus } from "src/components/server-status";
import { machineList } from "src/components/machine-list"


export const MachinePanel = ({ }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (_, newValue) => setSelectedTab(newValue);
  const serverStatus = useMachineStatus(5000);

  const tabSx = {
    justifyContent: "flex-start",
    textAlign: "left",
    fontWeight: "bold",
    px: '22px',
    py: 1.5,
    mb: 1,
    borderRadius: 1,
    "&.Mui-selected": {
      boxShadow: "inset 4px 0 0", color: "white",
    },
    "&:hover": {
      filter: "brightness(1.1)",
    },
    color: "white",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Box sx={{ display: "flex", }}>
        <Tabs
          orientation="vertical"
          value={selectedTab}
          onChange={handleTabChange}
          sx={{
            flexShrink: 0,
            pt: 2,
            "& .MuiTabs-flexContainer": { alignItems: "stretch" },
            "& .MuiTabs-indicator": { display: "none" },
            flex: "0 0 clamp(60px, 18%, 220px)",
          }}
        >
          <Tab
            label="Connect"
            sx={{ ...tabSx, bgcolor: "black" }}
          />
          <Tab
            label="Gantry"
            sx={{ ...tabSx, bgcolor: "#1976d2" }}
          />
          <Tab
            label="Cobot280"
            sx={{
              ...tabSx, bgcolor: "#1976d2",
              "& .MuiTab-wrapper": {
                justifyContent: "flex-start",
                textAlign: "left",
              },
            }}
          />
          <Tab
            label="Gripper"
            sx={{ ...tabSx, bgcolor: "purple" }}
          />
          <Tab
            label="Screwdriver"
            sx={{
              ...tabSx, bgcolor: "purple",
              "& .MuiTab-wrapper": {
                justifyContent: "flex-start",
                textAlign: "left",
              },
            }}
          />
        </Tabs>

        {/* Tab Content */}
        <Box
          sx={{
            flexGrow: 1,
            p: 1,
            borderLeft: `2px solid #dbdbdbff`,
            ml: 1,
            minHeight: 200,
          }}
        >
          {selectedTab === 0 && <Connections serverStatus={serverStatus} />}
          {machineList.map((machine, idx) => {
            const MachineComponent = machine.component;
            return selectedTab === idx + 1 ? <MachineComponent key={machine.name} /> : null;
          })}
        </Box>
      </Box>
      <Box>
        <StatusFooter />
      </Box>
    </Box>
  );
};
