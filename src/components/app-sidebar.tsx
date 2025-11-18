import * as React from "react"
import { NavLink } from "react-router-dom"
import { GalleryVerticalEnd, LayoutDashboard, Users, Package2 } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../components/ui/sidebar"

const mainNav = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Users", to: "/users", icon: Users },
  { title: "Products", to: "/products", icon: Package2 },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/dashboard" className="flex items-center gap-2">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">SevenFox</span>
                  <span className="text-xs text-muted-foreground">Panel</span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.to}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    [
                      "flex items-center gap-2",
                      isActive ? "font-semibold text-sidebar-primary" : "",
                    ]
                      .filter(Boolean)
                      .join(" ")
                  }
                >
                  <item.icon className="size-4" />
                  <span>{item.title}</span>
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
