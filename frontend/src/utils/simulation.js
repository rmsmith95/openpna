// utils/simulation.ts
import { useState, useCallback } from 'react';

// Initial jobs
export const initialJobs = [
  { id: '1', part: 'Body', target: 'Body Jig', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '2', part: 'Arm1', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '4', part: 'Arm3', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '3', part: 'Arm2', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '5', part: 'Arm4', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '6', part: 'Electric Speed Controller', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '7', part: 'Flight Controller', target: 'Electric Speed Controller', machines: 'LitePlacer1', status: 'To Do', description: '' },
];

// Initial parts
export const initialParts = [
  { id: 'p1', name: 'Body', class: 'part', mass: '0.3', description: '3d printed', cad: '/home/body.stl', assembled: false },
  { id: 'p2', name: 'Body Jig', class: 'jig', mass: '0.3', description: '3d printed', cad: '/home/body_jig.stl', assembled: false },
  { id: 'p3', name: 'ARm1', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p4', name: 'Arm2', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p5', name: 'Arm3', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p6', name: 'Arm4', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p7', name: 'Motor1', class: 'part', mass: '0.3', description: 'EMax', cad: '/home/motor.stl', assembled: false },
  { id: 'p8', name: 'Electric Speed Controller', class: 'part', mass: '0.3', description: 'SpeedyBee', cad: '/home/esc.stl', assembled: false },
  { id: 'p9', name: 'Flight Controller', class: 'part', mass: '0.3', description: 'SpeedyBee', cad: '/home/fc.stl', assembled: false },
];


export const useSimulation = ({ jobs, setJobs, parts, setParts }) => {
  const [currentJobId, setCurrentJobId] = useState(null);

  const step = useCallback(() => {
    // Find next "To Do" job
    const nextJob = jobs.find(j => j.status === 'To Do');
    if (!nextJob) {
      setCurrentJobId(null);
      return;
    }

    setCurrentJobId(nextJob.id);

    // Immediately mark job done and part assembled
    setJobs(prev =>
      prev.map(j => j.id === nextJob.id ? { ...j, status: 'Done' } : j)
    );
    setParts(prev =>
      prev.map(p => p.name === nextJob.part ? { ...p, assembled: true } : p)
    );

    // Keep currentJobId briefly if you want, or clear immediately
    setTimeout(() => setCurrentJobId(null), 500); // optional short highlight
  }, [jobs, setJobs, setParts]);

  const reset = useCallback(() => {
    setCurrentJobId(null);
    setJobs(initialJobs.map(j => ({ ...j, status: 'To Do' })));
    setParts(initialParts.map(p => ({ ...p, assembled: false })));
  }, [setJobs, setParts]);

  return { currentJobId, step, reset };
};
