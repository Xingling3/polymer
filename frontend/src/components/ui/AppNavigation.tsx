import * as React from "react"
import { Link, useLocation } from "react-router-dom"

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export function AppNavigation() {
    const location = useLocation()

    const isActive = (path: string) =>
        location.pathname === path

    const isModelSection =
        location.pathname.startsWith("/model") ||
        location.pathname.startsWith("/train")

    return (
        <div className="fixed top-0 left-0 w-full z-50">

            {/* 毛玻璃背景 */}
            <div className="
        bg-white/70
        backdrop-blur-xl
        shadow-[0_6px_20px_rgba(0,0,0,0.08)]
      ">
                <div className="max-w-7xl mx-auto px-16">
                    <NavigationMenu className="py-4">
                        <NavigationMenuList className="flex gap-20">

                            {/* Home */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/"))}
                                >
                                    <Link to="/">主页</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/introduct"))}
                                >
                                    <Link to="/introduct">介绍</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>


                            {/* Data Augment */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/augment"))}
                                >
                                    <Link to="/augment">数据增强</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* MLP Train */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/mlp-train"))}
                                >
                                    <Link to="/mlp-train">机器学习</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/mlp-train"))}
                                >
                                    <Link to="/train">深度学习训练</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>


                            {/* Predict */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/predict"))}
                                >
                                    <Link to="/predict">预测</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/predict"))}
                                >
                                    <Link to="/model">模型概览</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* Molecule */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/molecule"))}
                                >
                                    <Link to="/molecule">3d分子</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                            {/* About */}
                            <NavigationMenuItem>
                                <NavigationMenuLink
                                    asChild
                                    className={navStyle(isActive("/about"))}
                                >
                                    <Link to="/about">关于</Link>
                                </NavigationMenuLink>
                            </NavigationMenuItem>

                        </NavigationMenuList>
                    </NavigationMenu>
                </div>
            </div>

            {/* 底部淡蓝分割线 */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-blue-400/60 to-transparent" />

        </div>
    )
}

function ListItem({
    title,
    to,
}: {
    title: string
    to: string
}) {
    return (
        <li>
            <NavigationMenuLink asChild>
                <Link
                    to={to}
                    className="
            block rounded-lg px-4 py-2 text-sm
            text-black
            hover:text-blue-600
            hover:bg-blue-50
            transition-all duration-200
          "
                >
                    {title}
                </Link>
            </NavigationMenuLink>
        </li>
    )
}

function navStyle(active: boolean) {
    return `
    ${navigationMenuTriggerStyle()}
    relative px-6 py-2 rounded-lg
    text-sm font-medium
    transition-all duration-200

    ${active
            ? `
        text-blue-600
        bg-blue-50
        `
            : `
        text-black
        hover:text-blue-600
        hover:bg-blue-50
        `
        }
  `
}