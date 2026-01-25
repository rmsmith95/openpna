import { useCallback, useEffect, useState } from "react";
import {
  Box,
  Tab,
  Tabs,
} from "@mui/material";
import { Gantry } from "src/sections/machines/gantry";
import { Cobot280 } from "src/sections/machines/cobot280";
import { Gripper } from "src/sections/machines/gripper";
import { Screwdriver } from "src/sections/machines/screwdriver";
import { Connections } from "src/components/connections";


// Default machine list (can be passed as prop if needed)
const defaultMachines = [
  { name: "Gantry", component: Gantry, color: "#1976d2" },
  { name: "Cobot280", component: Cobot280, color: "#1976d2" },
  { name: "Gripper", component: Gripper, color: "purple" },
  { name: "Screwdriver", component: Screwdriver, color: "purple" },
];

export const useMachineStatus = (intervalMs = 5000) => {
  const [serverStatus, setServerStatus] = useState({
    status: "stopped",
    machines: {},
  });

  useEffect(() => {
    const fetchStatus = async () => {
      setServerStatus((prev) => ({ ...prev, status: "loading" }));
      try {
        const res = await fetch("/api/get_health");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setServerStatus({
          status: "connected",
          machines: data.machines || {},
        });
      } catch {
        setServerStatus({ status: "stopped", machines: {} });
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, intervalMs);

    return () => clearInterval(interval);
  }, [intervalMs]);
  // console.log(serverStatus); // true/false
  return serverStatus;
};

export const MachinePanel = ({ machines = defaultMachines }) => {
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
        {selectedTab === 0 && <Connections serverStatus={serverStatus}/>}
        {machines.map((machine, idx) => {
          const MachineComponent = machine.component;
          return selectedTab === idx + 1 ? <MachineComponent key={machine.name} /> : null;
        })}
      </Box>
    </Box>
  );
};
