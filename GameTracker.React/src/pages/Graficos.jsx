import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Plataformas from './graficos/Plataformas';
import Notas from './graficos/Notas';
import Evolucao from './graficos/Evolucao'; // 👈 Adicione esta linha

export default function Graficos() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">Gráficos</h1>
      <div className="mb-4 flex flex-wrap gap-2">
        <Link to="plataformas" className="px-3 py-1 bg-emerald-600 text-white rounded">Por Plataforma</Link>
        <Link to="notas" className="px-3 py-1 bg-emerald-600 text-white rounded">Nota Média</Link>
        <Link to="evolucao" className="px-3 py-1 bg-emerald-600 text-white rounded">Evolução</Link> {/* 👈 Novo botão */}
      </div>

      <Routes>
        <Route path="/" element={<div>Escolha um gráfico</div>} />
        <Route path="plataformas" element={<Plataformas />} />
        <Route path="notas" element={<Notas />} />
        <Route path="evolucao" element={<Evolucao />} /> {/* 👈 Nova rota */}
      </Routes>
    </div>
  );
}
