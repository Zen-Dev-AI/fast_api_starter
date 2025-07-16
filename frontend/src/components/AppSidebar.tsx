import * as React from "react"
import { IconInnerShadowTop } from "@tabler/icons-react"


import { NavMain } from "@/components/NavMain"
import { NavUser } from "@/components/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

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
    url: `/dashboard/chat/`,
    icon: IconListDetails,
  },
  {
    title: 'Todo',
    url: `/dashboard/todo/`,
    icon: IconListDetails,
  },
];


import { useConversations } from "@/context/conversationProvider"
import { _uuidv4 } from "zod/v4/core"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { conversations } = useConversations()


  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
        <div className="mt-6 px-4 text-xs font-semibold text-gray-500">Your Chats</div>
        <NavMain items={conversations} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}
