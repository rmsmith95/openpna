import * as GantryActions from 'src/sections/machines/tabs/gantry-actions';
import * as Cobot280Actions from 'src/sections/machines/tabs/cobot280-actions';
import * as GripperActions from 'src/sections/machines/tabs/gripper-actions';
import * as ScrewdriverActions from 'src/sections/machines/tabs/screwdriver-actions';
import { MacroRecorder } from './macro-recorder';

export const recorder = MacroRecorder();

// Wrap functions to auto-record
const recordable = (machine, action, fn) => {
  return async (params) => {
    recorder.addJob({ machine, action, params }); // now recorder exists
    return await fn(params);
  };
};

// Gantry
export const goto = recordable('gantry', 'goto', GantryActions.goto);
export const stepMove = recordable('gantry', 'step', GantryActions.stepMove);
export const handleUnlockToolChanger = recordable('gantry', 'unlock', GantryActions.handleUnlockToolChanger);
export const attach = recordable('gantry', 'attach', GantryActions.attach);
export const detach = recordable('gantry', 'detach', GantryActions.detach);
// ganntry + screwdriver combo
export const screwIn = recordable('screwdriver', 'screwIn', GantryActions.screwdriverIn);
export const screwOut = recordable('screwdriver', 'screwOut', GantryActions.screwdriverOut);
export const screwStop = recordable('screwdriver', 'stop', GantryActions.screwStop);

// Gripper
export const stepOpenGripper = recordable('gripper', 'stepOpenGripper', GripperActions.stepOpenGripper);
export const stepCloseGripper = recordable('gripper', 'stepCloseGripper', GripperActions.stepCloseGripper);
export const setGripperSpeed = recordable('gripper', 'setGripperSpeed', GripperActions.setGripperSpeed);
export const gripperGoTo = recordable('gripper', 'gripperGoTo', GripperActions.gripperGoTo);
export const speedGripperUp = recordable('gripper', 'speedGripperUp', GripperActions.speedGripperUp);
export const speedGripperDown = recordable('gripper', 'speedGripperDown', GripperActions.speedGripperDown);

// screwdriver
export const screwCW = recordable('screwdriver', 'screwCW', ScrewdriverActions.screwCW);
export const screwCCW = recordable('screwdriver', 'screwCCW', ScrewdriverActions.screwCCW);
export const screwdriverStop = recordable('screwdriver', 'screwdriverStop', ScrewdriverActions.screwdriverStop);

// Cobot280
export const moveJoint = recordable('cobot280', 'moveJoint', Cobot280Actions.moveJoint);
export const moveJoints = recordable('cobot280', 'moveJoints', Cobot280Actions.moveJoints);
export const fetchPositions = recordable('cobot280', 'fetchPositions', Cobot280Actions.fetchPositions);