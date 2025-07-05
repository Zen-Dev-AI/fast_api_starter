import { type Icon } from "@tabler/icons-react"


import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { useNavigate } from "react-router-dom"


export interface DashNavItemsI {
  title: string
  url: string
  icon?: Icon
}

interface NavMainPropsI {
  items: DashNavItemsI[]
}

export function NavMain({
  items,
}: NavMainPropsI) {

  let navigate = useNavigate();

  return (
    <SidebarGroup className="mt-4">
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title} className="py-1">
              <SidebarMenuButton onClick={() => navigate(item.url)} tooltip={item.title}>
                {item.icon && <item.icon />}
                <span className="text-lg">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
