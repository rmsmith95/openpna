import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { Box, Button, CircularProgress, Container, Stack, SvgIcon, Typography } from "@mui/material";
import ArrowDownOnSquareIcon from "@heroicons/react/24/solid/ArrowDownOnSquareIcon";
import ArrowUpOnSquareIcon from "@heroicons/react/24/solid/ArrowUpOnSquareIcon";
import { Layout as DashboardLayout } from "src/layouts/dashboard/layout";
import { Gantry } from "src/sections/machines/gantry";
import { Arm6DOF } from "src/sections/machines/arm6dof";
import CollapsibleCard from "src/components/collapsible-card";

const Page = () => {
  const [serverStatus, setServerStatus] = useState("stopped"); // stopped | loading | connected

  const checkServer = useCallback(async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/health");
      setServerStatus(res.ok ? "connected" : "stopped");
    } catch {
      setServerStatus("stopped");
    }
  }, []);

  useEffect(() => {
    checkServer(); // check immediately
    const interval = setInterval(checkServer, 10000);
    return () => clearInterval(interval);
  }, [checkServer]);

  const startServer = async () => {
    setServerStatus("loading");
    try {
      const res = await fetch("/api/start-fastapi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      });
      await res.json();
      setTimeout(() => checkServer(), 2000);
    } catch {
      setServerStatus("stopped");
    }
  };

  return (
    <>
      <Head>
        <title>Machines</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Machines</Typography>
                <Stack alignItems="center" direction="row" spacing={1}>
                  <Box sx={{ px: 1.5, py: 0.5, borderRadius: 1, fontSize: "0.75rem", fontWeight: "bold", color: "white", display: "flex", alignItems: "center", gap: 0.5, bgcolor: serverStatus === "connected" ? "green" : serverStatus === "loading" ? "orange" : "red" }}>
                    {serverStatus === "loading" && <CircularProgress size={12} color="inherit" />}
                    {serverStatus === "connected" ? "Connected" : serverStatus === "loading" ? "Loading" : "Stopped"}
                  </Box>

                  <Button color="inherit" startIcon={<SvgIcon fontSize="small"><ArrowUpOnSquareIcon /></SvgIcon>}>Import</Button>
                  <Button color="inherit" startIcon={<SvgIcon fontSize="small"><ArrowDownOnSquareIcon /></SvgIcon>}>Export</Button>
                </Stack>
              </Stack>
            </Stack>

            <Stack spacing={2}>
              <CollapsibleCard title="LitePlacer1" color="secondary.main">
                <Gantry difference={12} positive sx={{ height: "100%" }} value="LitePlacer1" />
              </CollapsibleCard>

              <CollapsibleCard title="MyCobot1" color="success.main">
                <Arm6DOF difference={12} positive sx={{ height: "100%" }} value="MyCobot1" />
              </CollapsibleCard>
            </Stack>
          </Stack>
        </Container>
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;
export default Page;
