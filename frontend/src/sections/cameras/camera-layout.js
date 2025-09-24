// app/camera-dashboard/page.tsx
"use client";

import { useState } from "react";
import {
  Box,
  Tab,
  Tabs,
  Typography,
  Grid,
  Paper,
  Container,
  Divider,
} from "@mui/material";

const cameraList = ["Camera 1", "Camera 2"];

export default function CameraDashboard() {
  const [selectedTab, setSelectedTab] = useState(0);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const renderCameraPlaceholder = (cameraName) => (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderRadius: 2,
        height: 360, // same as your example
        backgroundColor: "grey.900",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "grey.300",
        fontSize: 18,
        fontWeight: 500,
        letterSpacing: 1,
        border: "2px solid grey",
      }}
    >
      {cameraName}
    </Paper>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 5 }}>
      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        textColor="primary"
        indicatorColor="primary"
        sx={{ mb: 4 }}
      >
        <Tab label="All Cameras" />
        {cameraList.map((cam, index) => (
          <Tab key={index} label={cam} />
        ))}
      </Tabs>

      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {cameraList.map((cam, index) => (
            <Grid item xs={12} md={6} key={index}>
              {renderCameraPlaceholder(cam)}
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && renderCameraPlaceholder("Camera 1")}
      {selectedTab === 2 && renderCameraPlaceholder("Camera 2")}
    </Container>
  );
}
