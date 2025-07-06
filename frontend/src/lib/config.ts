import type { DashNavItemsI } from '@/components/NavMain';
import { IconDashboard, IconListDetails } from '@tabler/icons-react';

export const navMain: DashNavItemsI[] = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: IconDashboard,
  },
  {
    title: 'Chat',
    url: '/dashboard/chat',
    icon: IconListDetails,
  },
];
