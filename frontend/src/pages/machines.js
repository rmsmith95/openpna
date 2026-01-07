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
import CheckCircleIcon from '@heroicons/react/24/solid/CheckCircleIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';

const Page = () => {
  // Connection state
  const [serverStatus, setServerStatus] = useState("stopped");
  const [connectedTinyG, setConnectedTinyG] = useState(false);
  const [connectedArduino, setConnectedArduino] = useState(false);
  const [connectedCobot280, setConnectedCobot280] = useState(false);
  const [connectedServoGripper, setConnectedServoGripper] = useState(false);

  // Tabs
  const [selectedTab, setSelectedTab] = useState(0);
  const handleTabChange = (_, newValue) => setSelectedTab(newValue);

  const tabColors = ["black", "#1976d2", "#1976d2", "purple"];

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/health");
      setServerStatus(res.ok ? "connected" : "stopped");
    } catch {
      setServerStatus("stopped");
    }
  }, []);

  useEffect(() => {
    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, [checkServer]);

  return (
    <>
      <Head>
        <title>Machines</title>
      </Head>

      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            {/* Header */}
            <Stack spacing={1}>
              <Typography variant="h4" fontWeight="bold">
                Machines
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    fontSize: "0.75rem",
                    fontWeight: "bold",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    width: "fit-content",
                    bgcolor:
                      serverStatus === "connected"
                        ? "green"
                        : serverStatus === "loading"
                          ? "orange"
                          : "red",
                  }}
                >
                  {serverStatus === "loading" && (
                    <CircularProgress size={12} color="inherit" />
                  )}
                  {serverStatus === "connected"
                    ? "Connected"
                    : serverStatus === "loading"
                      ? "Loading"
                      : "Stopped"}
                </Box>
              </Stack>
            </Stack>

            <Card
              sx={{
                display: "flex",
                borderRadius: 2,
                boxShadow: 3,
                bgcolor: "#fafafa",
              }}
            >
              {/* Tabs */}
              <Tabs
                orientation="vertical"
                value={selectedTab}
                onChange={handleTabChange}
                sx={{
                  width: 180,
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
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Gantry
                    </Box>
                  }                  
                  sx={{
                    bgcolor: "#1976d2",
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
                  }}/>
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Cobot280
                    </Box>
                  } 
                  sx={{
                    bgcolor: "#1976d2",
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
                    "& .MuiTab-wrapper": {
                      justifyContent: "flex-start",
                      textAlign: "left",
                    },
                  }}
                />
                <Tab
                  label={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      Gripper
                    </Box>
                  } 
                  sx={{
                    bgcolor: "purple",
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
              </Tabs>

              {/* Tab content with left border to match tab color */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 1,
                  // ml: 1,
                  borderLeft: `6px solid ${tabColors[selectedTab]}`,
                  minHeight: 200,
                }}
              >
                {selectedTab === 0 && (
                  <Connections
                    connectedTinyG={connectedTinyG}
                    setConnectedTinyG={setConnectedTinyG}
                    connectedArduino={connectedArduino}
                    setConnectedArduino={setConnectedArduino}
                    connectedCobot280={connectedCobot280}
                    setConnectedCobot280={setConnectedCobot280}
                    connectedServoGripper={connectedServoGripper}
                    setConnectedServoGripper={setConnectedServoGripper}
                  />
                )}
                {selectedTab === 1 && 
                  <Gantry />
                }
                {selectedTab === 2 && 
                  <Cobot280 />
                }
                {selectedTab === 3 && 
                  <Gripper />
                }
              </Box>
            </Card>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
