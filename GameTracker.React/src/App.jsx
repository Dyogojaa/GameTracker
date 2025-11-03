import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Jogos from "./pages/Jogos";
import Importar from "./pages/Importar";
import Graficos from "./pages/Graficos";
import NavBar from "./components/NavBar";

export default function App() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <NavBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/jogos" element={<Jogos />} />
        <Route path="/importar" element={<Importar />} />
        <Route path="/graficos/*" element={<Graficos />} />
      </Routes>
    </div>
  );
}
