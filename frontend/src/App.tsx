import { Routes, Route, useLocation } from "react-router-dom"
import { AppNavigation } from "./components/ui/AppNavigation"

import Home from "./pages/Home"
import About from "./pages/About"
import PolymerPredict from "./pages/predict"
import Login from "./pages/Login"
import Register from "./pages/Register"
import Model from "./pages/Models"
import Train from "./pages/Train"
import MLPTrain from "./pages/MLPTrain"
import Admin from "./pages/admin"
import Chart from "./pages/chart"
import Molecule from "./pages/Molecule"
import MoleculeBackground from "./components/MoleculeBackground"
import Augment from "./pages/Augment"
import Introduct from "./pages/Introduct"

export default function App() {
  const location = useLocation()

  const hideNav =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/admin"

  return (
    <>
      <MoleculeBackground />

      <div className="flex flex-col h-screen w-full overflow-hidden">

        {/* 顶部导航 */}
        {!hideNav && <AppNavigation />}

        {/* 页面内容 */}
        <div className="flex-1 overflow-y-auto pt-24 px-6">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/predict" element={<PolymerPredict />} />
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/model" element={<Model />} />
            <Route path="/train" element={<Train />} />
            <Route path="/mlp-train" element={<MLPTrain />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/molecule" element={<Molecule />} />
            <Route path="/augment" element={<Augment />} />
            <Route path="/chart" element={<Chart />} />
            <Route path="/introduct" element={<Introduct />} />
          </Routes>
        </div>

      </div>
    </>
  )
}