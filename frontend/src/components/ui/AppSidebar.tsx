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
    { title: "登出", url: "/", icon: LogIn },
    //{ title: "Register", url: "/register", icon: User },
    { title: "关于", url: "/about", icon: Inbox },
    //{ title: "Calendar", url: "/calender", icon: Calendar },
    { title: "预测", url: "/predict", icon: TrendingUp },
    { title: "训练", url: "/train", icon: Bot },
    { title: "MLP 训练", url: "/mlp-train", icon: Bot },
    { title: "我的模型", url: "/model", icon: Folder },
    { title: "设置", url: "/settings", icon: Settings },
    { title: "数据增强", url: "/augment", icon: Folder },
    { title: "3d模型", url: "/molecule", icon: Folder },
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
