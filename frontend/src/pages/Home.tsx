import React from "react";
import { Button } from "@/components/ui/button";
import FeatureCards from "@/components/FeatureCards";
export default function Home() {
    return (
        <div className="relative min-h-screen overflow-hidden">
            {/* 背景视频 */}
            <div className="fixed inset-0 z-0">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/background.mp4" type="video/mp4" />
                    <img
                        src="/background-fallback.jpg"
                        alt="背景"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                </video>
                <div className="absolute inset-0 bg-black/40"></div>
            </div>

            {/* 导航栏 */}
            <nav className="relative z-20 flex items-center justify-between px-6 py-4">
                <div className="text-xl font-bold text-white">聚智通</div>
                <div className="flex items-center gap-6">
                    <Button
                        variant="ghost"
                        className="text-white hover:bg-white/10"
                        onClick={() => window.location.href = "/about"}
                    >
                        About
                    </Button>
                    <Button
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => window.location.href = "/login"}
                    >
                        Login
                    </Button>
                </div>
            </nav>

            {/* 主要内容 */}
            <div className="relative z-10 container mx-auto px-4 py-24 h-full flex items-center">
                <div className="max-w-xl">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        AI<sup>+</sup> Polymers
                    </h1>
                    <p className="text-gray-300 text-lg mb-8">
                        依托人工智能，我们驱动创新，定制解决方案，并以数据驱动决策。通过人工智能与高分子专业知识的深度融合，我们正开启一场创新之旅，携手共创高分子材料未来的崭新时代！


                    </p>
                </div>
            </div>
            <FeatureCards />
        </div>
    );
}