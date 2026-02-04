import { useEffect, useRef } from 'react';
import Head from 'next/head';
import * as THREE from 'three';
import { Box } from '@mui/material';
import { Layout as DashboardLayout } from 'src/layouts/dashboard/layout';

const Page = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / 400,
      0.1,
      1000
    );
    camera.position.z = 3;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mountRef.current.clientWidth, 400);
    mountRef.current.appendChild(renderer.domElement);

    // Geometry
    const geometry = new THREE.BoxGeometry();
    const material = new THREE.MeshStandardMaterial({
      color: 0x44aa88,
    });
    const cube = new THREE.Mesh(geometry, material);
    scene.add(cube);

    // Light
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(2, 2, 5);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    // Animation
    const animate = () => {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;

      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      renderer.dispose();
      mountRef.current.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <Head>
        <title>MicroFactory Dashboard</title>
      </Head>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 'clamp(8px, 4vw, 80px)'
        }}
      >
        <Box
          ref={mountRef}
          sx={{
            width: '100%',
            maxWidth: 800,
            margin: '0 auto'
          }}
        />
      </Box>
    </>
  );
};

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>;

export default Page;
