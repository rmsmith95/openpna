import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import {
  Box,
  Paper,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { MachinePanel } from "src/sections/machines/machines-panel";

const Page = () => {
  const [serverStatus, setServerStatus] = useState("stopped");

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

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: 2,
          p: "clamp(8px, 4vw, 80px)",
        }}
      >
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

          {/* Panel */}
          <Paper
            elevation={3}
            sx={{
              borderRadius: 2,
              display: "flex",
              flexDirection: "column",
              maxHeight: "50vh",
              overflow: "auto",
              p: 1,
            }}
          >
            <MachinePanel />
          </Paper>
        </Stack>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
