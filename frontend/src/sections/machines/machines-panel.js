import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Card,
  CircularProgress,
  Container,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { Gantry } from "src/sections/machines/gantry";
import { Cobot280 } from "src/sections/machines/cobot280";
import { Gripper } from "src/sections/machines/gripper";
import { Connections } from "src/components/connections";


// Default machine list (can be passed as prop if needed)
const defaultMachines = [
  { name: "Gantry", component: Gantry, color: "#1976d2" },
  { name: "Cobot280", component: Cobot280, color: "#1976d2" },
  { name: "Gripper", component: Gripper, color: "purple" },
];

export const MachinePanel = ({ machines = defaultMachines, connectionsProps }) => {
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (_, newValue) => setSelectedTab(newValue);

  const tabColors = ["black", ...machines.map((m) => m.color)];

  return (
    <Card sx={{ display: "flex", borderRadius: 2, boxShadow: 3, bgcolor: "#fafafa" }}>
      {/* Tabs */}
      <Tabs
        orientation="vertical"
        value={selectedTab}
        onChange={handleTabChange}
        sx={{
          minWidth: 150,
          flexShrink: 0,
          bgcolor: "#f0f0f0",
          "& .MuiTabs-flexContainer": { alignItems: "stretch" },
        }}
      >
        <Tab
          label="Connections"
          sx={{
            bgcolor: "black",
            color: "white",
            fontWeight: "bold",
            textAlign: "left",
            justifyContent: "flex-start",
            px: 2,
            py: 1.5,
            mb: 1,
            borderRadius: 1,
            "&.Mui-selected": { boxShadow: "inset 4px 0 0 white" },
            "&:hover": { filter: "brightness(1.1)" },
          }}
        />
        {machines.map((machine, idx) => (
          <Tab
            key={machine.name}
            label={machine.name}
            sx={{
              bgcolor: machine.color,
              color: "white",
              fontWeight: "bold",
              textAlign: "left",
              justifyContent: "flex-start",
              px: 2,
              py: 1.5,
              mb: 1,
              borderRadius: 1,
              "&.Mui-selected": { boxShadow: "inset 4px 0 0 white" },
              "&:hover": { filter: "brightness(1.1)" },
            }}
          />
        ))}
      </Tabs>

      {/* Tab Content */}
      <Box
        sx={{
          flexGrow: 1,
          p: 1,
          borderLeft: `6px solid ${tabColors[selectedTab]}`,
          minHeight: 200,
        }}
      >
        {selectedTab === 0 && <Connections {...connectionsProps} />}
        {machines.map((machine, idx) => {
          const MachineComponent = machine.component;
          return selectedTab === idx + 1 ? <MachineComponent key={machine.name} /> : null;
        })}
      </Box>
    </Card>
  );
};
