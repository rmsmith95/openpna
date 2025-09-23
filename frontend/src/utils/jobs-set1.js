// Initial jobs
export const initialJobs = [
  { id: '1', part: 'Body', target: 'Body Jig', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '2', part: 'Arm1', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '4', part: 'Arm2', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '3', part: 'Arm3', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '5', part: 'Arm4', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '6', part: 'Electric Speed Controller', target: 'Body', machines: 'LitePlacer1', status: 'To Do', description: '' },
  { id: '7', part: 'Flight Controller', target: 'Electric Speed Controller', machines: 'LitePlacer1', status: 'To Do', description: '' },
];

// Initial parts
export const initialParts = [
  { id: 'p1', name: 'Body', class: 'part', mass: '0.3', description: '3d printed', cad: '/home/body.stl', assembled: false },
  { id: 'p2', name: 'Body Jig', class: 'jig', mass: '0.3', description: '3d printed', cad: '/home/body_jig.stl', assembled: false },
  { id: 'p3', name: 'Arm1', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p4', name: 'Arm2', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p5', name: 'Arm3', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p6', name: 'Arm4', class: 'part', mass: '0.2', description: '3d printed', cad: '/home/arm.stl', assembled: false },
  { id: 'p7', name: 'Motor1', class: 'part', mass: '0.3', description: 'EMax', cad: '/home/motor.stl', assembled: false },
  { id: 'p8', name: 'Electric Speed Controller', class: 'part', mass: '0.3', description: 'SpeedyBee', cad: '/home/esc.stl', assembled: false },
  { id: 'p9', name: 'Flight Controller', class: 'part', mass: '0.3', description: 'SpeedyBee', cad: '/home/fc.stl', assembled: false },
];
