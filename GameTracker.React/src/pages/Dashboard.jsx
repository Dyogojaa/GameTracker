import React, { useEffect, useState } from "react";
import { get } from "../api/apiClient";
import {
  FaClock,
  FaGamepad,
  FaTrophy,
  FaCheckCircle,
  FaStar,
  FaStarHalfAlt,
  FaRegStar,
} from "react-icons/fa";

export default function Dashboard() {
  const [resumo, setResumo] = useState(null);

  useEffect(() => {
    async function carregarDados() {
      try {
        const data = await get("dashboard/resumo");
        setResumo(data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      }
    }
    carregarDados();
  }, []);

  const renderStars = (nota) => {
    const stars = [];
    const fullStars = Math.floor(nota);
    const hasHalfStar = nota % 1 >= 0.5;
    for (let i = 0; i < fullStars; i++)
      stars.push(<FaStar key={`s${i}`} className="text-yellow-400" />);
    if (hasHalfStar)
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    while (stars.length < 5)
      stars.push(<FaRegStar key={`e${stars.length}`} className="text-gray-400" />);
    return stars;
  };

  if (!resumo)
    return (
      <div className="text-center text-gray-500 mt-10">
        Carregando dados do Dashboard...
      </div>
    );

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-emerald-700 mb-6 flex items-center gap-2">
        <FaGamepad className="text-emerald-600" /> Dashboard GameTracker
      </h1>

      {/* === CARDS DE RESUMO === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center border-t-4 border-emerald-500">
          <FaGamepad className="text-emerald-600 text-3xl mb-2" />
          <h3 className="font-semibold text-gray-600">Total de Jogos</h3>
          <p className="text-2xl font-bold text-gray-900">{resumo.totalJogos}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center border-t-4 border-emerald-500">
          <FaCheckCircle className="text-emerald-600 text-3xl mb-2" />
          <h3 className="font-semibold text-gray-600">Finalizados</h3>
          <p className="text-2xl font-bold text-gray-900">
            {resumo.jogosFinalizados}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center border-t-4 border-emerald-500">
          <FaClock className="text-emerald-600 text-3xl mb-2" />
          <h3 className="font-semibold text-gray-600">Horas Jogadas</h3>
          <p className="text-2xl font-bold text-gray-900">{resumo.horasTotais}</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-5 flex flex-col items-center border-t-4 border-emerald-500">
          <FaStar className="text-yellow-500 text-3xl mb-2" />
          <h3 className="font-semibold text-gray-600">Nota Média</h3>
          <p className="text-2xl font-bold text-gray-900">
            {resumo.notaMediaGeral.toFixed(1)}
          </p>
        </div>
      </div>

      {/* === TOP JOGOS === */}
      {resumo.topJogos?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <FaTrophy className="text-yellow-500" /> Top Jogos
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumo.topJogos.map((jogo, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 flex flex-col bg-gray-50 hover:bg-gray-100 transition"
              >
                <h3 className="text-lg font-semibold text-gray-800">
                  {jogo.titulo}
                </h3>
                <p className="text-sm text-gray-500 mb-2">
                  Plataforma: {jogo.plataforma}
                </p>
                <div className="flex items-center gap-1">
                  {renderStars(jogo.nota / 2)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* === ÚLTIMOS FINALIZADOS === */}
      {resumo.ultimosJogosFinalizados?.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
            <FaCheckCircle className="text-emerald-500" /> Últimos Finalizados
          </h2>
          <ul className="space-y-2">
            {resumo.ultimosJogosFinalizados.map((jogo, idx) => (
              <li
                key={idx}
                className="border-b last:border-none pb-2 flex justify-between text-gray-700"
              >
                <span>{jogo.titulo}</span>
                <span className="text-sm text-gray-500">
                  {jogo.plataforma}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
