import * as React from "react"
import { useEffect, useState } from "react"
import { NavLink } from "react-router-dom"
import {
  GalleryVerticalEnd,
  LayoutDashboard,
  Users,
  Package2,
  Truck,
  User,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "../components/ui/sidebar"
import { apiGetMe } from "../lib/api-auth"

const mainNav = [
  { title: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
  { title: "Users", to: "/users", icon: Users },
  { title: "Products", to: "/products", icon: Package2 },
  { title: "Shipping", to: "/shipping", icon: Truck },
]

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    apiGetMe()
      .then(me => setRole(me.role ?? "user"))
      .catch(() => setRole(null))
  }, [])

  const filteredNav = mainNav.filter(item => {
    if (item.title === "Users") return role === "admin"
    return true
  })

 
  const fullNav = [...filteredNav, { title: "Mi Perfil", to: "/profile", icon: User }]

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
          {fullNav.map((item) => (
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