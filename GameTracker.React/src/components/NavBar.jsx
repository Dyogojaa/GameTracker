import React from 'react';
import { NavLink } from 'react-router-dom';

export default function NavBar() {
  return (
    <header className="header-gradient text-white sticky top-0 z-40">
      <nav className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="font-bold text-lg">🕹️ GameTracker</NavLink>
          <NavLink to="/dashboard" className="nav-link">📊 Dashboard</NavLink>
          <NavLink to="/jogos" className="nav-link">🎮 Jogos</NavLink>
          <NavLink to="/importar" className="nav-link">📥 Importar CSV</NavLink>

          <div className="relative group">
            <button className="nav-link">📈 Gráficos ▾</button>
            <div className="absolute hidden group-hover:block bg-white text-gray-800 rounded shadow-md mt-2 py-1 min-w-[180px]">
              <NavLink to="/graficos/plataformas" className="block px-4 py-2 hover:bg-gray-100">🎮 Por Plataforma</NavLink>
              <NavLink to="/graficos/notas" className="block px-4 py-2 hover:bg-gray-100">⭐ Nota Média</NavLink>
              <NavLink to="/graficos/evolucao" className="block px-4 py-2 hover:bg-gray-100">📈 Evolução</NavLink>
            </div>
          </div>
        </div>

        <div>
          <a href="https://howlongtobeat.com/user/King_HyperDyo" target="_blank" rel="noreferrer" className="nav-link">ℹ️ Sobre mim</a>
        </div>
      </nav>
    </header>
  )
}
