"use client";
import { useEffect, useRef, useState } from "react";

const cameraList = [
  "Camera 1",
  "Camera 2",
  "Camera 3",
  "Camera 4",
  "Camera 5",
];

export default function CameraDashboard() {
  const [selectedCameras, setSelectedCameras] = useState([]);
  const videoRefs = useRef({});

  // Start a fake webcam stream for demo
  useEffect(() => {
    async function enableCamera(cam) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
        if (videoRefs.current[cam]) {
          videoRefs.current[cam].srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing webcam:", err);
      }
    }

    selectedCameras.forEach((cam) => enableCamera(cam));
  }, [selectedCameras]);

  const toggleCamera = (cam) => {
    setSelectedCameras((prev) =>
      prev.includes(cam) ? prev.filter((c) => c !== cam) : [...prev, cam]
    );
  };

  return (
    <div className="p-6">
      {/* Camera Selection */}
      <div className="mb-4">
        {cameraList.map((cam) => (
          <label key={cam} className="block cursor-pointer">
            <input
              type="checkbox"
              checked={selectedCameras.includes(cam)}
              onChange={() => toggleCamera(cam)}
              className="mr-2"
            />
            {cam}
          </label>
        ))}
      </div>

      {/* Video Grid */}
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${Math.min(
            selectedCameras.length,
            2
          )}, 1fr)`,
        }}
      >
        {selectedCameras.map((cam) => (
          <div
            key={cam}
            className="bg-black rounded-lg overflow-hidden shadow-md"
          >
            <video
              ref={(el) => (videoRefs.current[cam] = el)}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
