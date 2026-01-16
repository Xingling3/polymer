import {
    Calendar, Home, Inbox, Search, Settings,
    LogIn, User, Bot, TrendingUp, Folder
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar";

// 菜单项
const items = [
    { title: "Login", url: "/login", icon: LogIn },
    { title: "Register", url: "/register", icon: User },
    { title: "About", url: "/about", icon: Inbox },
    { title: "Calendar", url: "/", icon: Calendar },
    { title: "Predict", url: "/predict", icon: TrendingUp },
    { title: "Train", url: "/train", icon: Bot },
    { title: "MyModels", url: "/model", icon: Folder },
    { title: "Settings", url: "/settings", icon: Settings },
];

export function AppSidebar() {
    const location = useLocation();

    return (
        <Sidebar>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Application</SidebarGroupLabel>

                    <SidebarGroupContent>
                        <SidebarMenu>
                            {items.map((item) => {
                                const active = location.pathname === item.url;

                                return (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild isActive={active}>
                                            <Link to={item.url} className="flex items-center gap-2">
                                                <item.icon className="h-4 w-4" />
                                                <span>{item.title}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}
