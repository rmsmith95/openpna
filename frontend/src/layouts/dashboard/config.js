import ChartBarIcon from '@heroicons/react/24/solid/ChartBarIcon';
import CogIcon from '@heroicons/react/24/solid/CogIcon';
import LockClosedIcon from '@heroicons/react/24/solid/LockClosedIcon';
import CameraIcon from '@heroicons/react/24/solid/CameraIcon';
import UserIcon from '@heroicons/react/24/solid/UserIcon';
import UserPlusIcon from '@heroicons/react/24/solid/UserPlusIcon';
import CircleStackIcon from '@heroicons/react/24/solid/CircleStackIcon';
import XCircleIcon from '@heroicons/react/24/solid/XCircleIcon';
import { SvgIcon } from '@mui/material';

export const items = [
  {
    title: 'Overview',
    path: '/',
    icon: (
      <SvgIcon fontSize="small">
        <ChartBarIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Cameras',
    path: '/cameras',
    icon: (
      <SvgIcon fontSize="small">
        <CameraIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Jobs',
    path: '/jobs',
    icon: (
      <SvgIcon fontSize="small">
        <CircleStackIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Parts',
    path: '/parts',
    icon: (
      <SvgIcon fontSize="small">
        <UserIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Machines',
    path: '/machines',
    icon: (
      <SvgIcon fontSize="small">
        <CogIcon />
      </SvgIcon>
    )
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: (
      <SvgIcon fontSize="small">
        <CogIcon />
      </SvgIcon>
    )
  }
  // {
  //   title: 'Login',
  //   path: '/auth/login',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <LockClosedIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Register',
  //   path: '/auth/register',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <UserPlusIcon />
  //     </SvgIcon>
  //   )
  // },
  // {
  //   title: 'Error',
  //   path: '/404',
  //   icon: (
  //     <SvgIcon fontSize="small">
  //       <XCircleIcon />
  //     </SvgIcon>
  //   )
  // }
];
