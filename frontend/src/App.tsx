import { Routes, Route } from "react-router-dom";
import {
  SidebarProvider,
  SidebarInset,
} from "@/components/ui/sidebar";

import { AppSidebar } from "./components/ui/AppSidebar";

import Home from "./pages/Home";
import About from "./pages/About";
import PolymerPredict from "./pages/predict";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Model from "./pages/Models";
import Train from "./pages/Train";

export default function App() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        {/* 左侧 Sidebar */}
        <AppSidebar />

        {/* 右侧内容 - 修改这里 */}
        <SidebarInset className="flex-1 min-w-0">
          {/* 添加这个滚动容器 */}
          <div className="h-full overflow-y-auto p-6">
            <div className="min-w-0">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/predict" element={<PolymerPredict />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/model" element={<Model />} />
                <Route path="/train" element={<Train />} />
              </Routes>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}