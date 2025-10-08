// src/hooks/useCameraStreams.js
import { useEffect, useRef, useState } from "react";

export function useCameraStreams() {
  const videoRefs = useRef({});
  const [selectedCameras, setSelectedCameras] = useState({
    liteplacer: null,
    board: null,
    digital: true,
  });
  const [devices, setDevices] = useState([]);

  // persist streams across unmounts
  const streamsRef = useRef({});

  // enumerate cameras once
  useEffect(() => {
    async function loadDevices() {
      try {
        const allDevices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = allDevices.filter((d) => d.kind === "videoinput");

        setDevices(videoDevices);

        setSelectedCameras((prev) => ({
          ...prev,
          liteplacer: videoDevices[0]?.deviceId || null,
          board: videoDevices[1]?.deviceId || null,
        }));
      } catch (err) {
        console.error("Error enumerating cameras:", err);
      }
    }
    loadDevices();
  }, []);

  // start streams whenever selectedCameras changes
  useEffect(() => {
    Object.entries(selectedCameras).forEach(async ([key, deviceId]) => {
      if (!deviceId || key === "digital") return;

      // if we already have a stream for this camera, reuse it
      if (!streamsRef.current[deviceId]) {
        try {
          streamsRef.current[deviceId] = await navigator.mediaDevices.getUserMedia({
            video: { deviceId: { exact: deviceId } },
          });
        } catch (err) {
          console.error(`Error starting ${key} camera:`, err);
          return;
        }
      }

      // attach stream to video element if it exists
      if (videoRefs.current[key]) {
        videoRefs.current[key].srcObject = streamsRef.current[deviceId];
      }
    });
  }, [selectedCameras]);

  return { videoRefs, selectedCameras, devices, setSelectedCameras };
}
