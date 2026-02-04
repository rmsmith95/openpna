import {
  goto,
  stepMove,
  handleUnlockToolChanger,
  screwdriverIn,
  screwdriverOut,
  attach,
  detach,
} from '../machines/tabs/gantry-actions';

import {
  stepCloseGripper,
  stepOpenGripper,
  speedGripperDown,
  speedGripperUp
} from '../machines/tabs/gripper-actions';

import {
  moveJoint, moveJoints 
} from '../machines/tabs/cobot280-actions';


// Default templates for actions
export const PARAM_TEMPLATES = {
  gantry: {
    goto: { x: 0, y: 0, z: 0, a: 0, speed: 2000 },
    step: { x: 0, y: 0, z: 0, r: 0, speed: 1000 },
    unlock: {}
  },
  cobot280: {
    goto: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 },
    step: { j1: 0, j2: 0, j3: 0, j4: 0, j5: 0, j6: 0 }
  },
  gripper: {
    open: {},
    close: {},
    speedUp: {},
    speedDown: {}
  }
};

// Get default params for machine/action
export const getDefaultParams = (machine, action) =>
  PARAM_TEMPLATES?.[machine]?.[action]
    ? { ...PARAM_TEMPLATES[machine][action] }
    : {};

// Run a job action
export const runAction = (job) => {
  if (!job) return;

  const { machine, action, params } = job;
  console.log('Running job:', machine, action, params);

  switch (machine) {
    case 'gantry':
      switch (action) {
        case 'goto':
          return goto?.(params);
        case 'step':
          return stepMove?.(params);
        case 'unlock':
          return handleUnlockToolChanger?.(5);
        case 'detach':
          return detach?.();
        case 'attach':
          return attach?.(params);
        default:
          break;
      }
      break;

    case 'cobot280':
      switch (action) {
        case 'goto':
          return moveJoints?.(params);
        case 'step':
          return moveJoint?.(params);
        default:
          break;
      }
      break;

    case 'gripper':
      switch (action) {
        case 'open':
          return stepOpenGripper?.();
        case 'close':
          return stepCloseGripper?.();
        case 'speedUp':
          return speedGripperUp?.();
        case 'speedDown':
          return speedGripperDown?.();
        default:
          break;
      }
      break;
    
    case 'screwdriver':
      switch (action) {
        case 'screwIn':
          return screwdriverIn?.();
        case 'screwOut':
          return screwdriverOut?.();
        default:
          break;
      }
      break;

    default:
      console.warn('Unknown machine/action:', machine, action);
  }
};
