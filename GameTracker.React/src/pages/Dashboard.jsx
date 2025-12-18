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
  const [anoSelecionado, setAnoSelecionado] = useState(null);
  const [loading, setLoading] = useState(true);

  const anoAtual = new Date().getFullYear();
  const anosDisponiveis = [];

  for (let ano = anoAtual; ano >= anoAtual - 5; ano--) {
    anosDisponiveis.push(ano);
  }

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);

        let url = "dashboard/resumo";
        if (anoSelecionado) {
          url += `?ano=${anoSelecionado}`;
        }

        const data = await get(url);
        setResumo(data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, [anoSelecionado]);

  const renderStars = (nota) => {
    if (!nota) return null;

    const stars = [];
    const fullStars = Math.floor(nota);
    const hasHalfStar = nota % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`s${i}`} className="text-yellow-400" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="text-yellow-400" />);
    }

    while (stars.length < 5) {
      stars.push(
        <FaRegStar key={`e${stars.length}`} className="text-gray-300" />
      );
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="text-center text-gray-500 mt-10">
        Carregando dados do Dashboard...
      </div>
    );
  }

  if (!resumo || resumo.totalJogos === 0) {
    return (
      <div className="p-6">
        <Header
          anosDisponiveis={anosDisponiveis}
          anoSelecionado={anoSelecionado}
          setAnoSelecionado={setAnoSelecionado}
        />
        <div className="text-center text-gray-500 mt-20">
          Nenhum jogo encontrado para este ano.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <Header
        anosDisponiveis={anosDisponiveis}
        anoSelecionado={anoSelecionado}
        setAnoSelecionado={setAnoSelecionado}
      />

      {/* CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card icon={<FaGamepad />} title="Jogos no Ano" value={resumo.totalJogos} />
        <Card icon={<FaCheckCircle />} title="Finalizados" value={resumo.jogosFinalizados} />
        <Card icon={<FaClock />} title="Horas Jogadas" value={resumo.horasTotais} />
        <Card icon={<FaStar />} title="Nota Média" value={resumo.notaMediaGeral.toFixed(1)} yellow />
        <Card icon={<FaTrophy />} title="Platinados" value={resumo.jogosPlatinados} yellow pulse />
      </div>

      {/* TOP JOGOS */}
      {resumo.topJogos?.length > 0 && (
        <Section title="Top Jogos" icon={<FaTrophy />}>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {resumo.topJogos.map((jogo, idx) => (
              <div
                key={idx}
                className="border rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition flex gap-4"
              >
                {/* CAPA */}
                <img
                  src={jogo.capaUrl || "/no-cover.png"}
                  alt={jogo.titulo}
                  loading="lazy"
                  className="w-20 h-28 object-cover rounded shadow flex-shrink-0 bg-gray-200"
                />

                {/* INFO */}
                <div className="flex flex-col justify-between overflow-hidden">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 truncate">
                      {jogo.titulo}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      Plataforma: {jogo.plataforma}
                    </p>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {renderStars(jogo.nota / 2)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* ÚLTIMOS FINALIZADOS */}
      {resumo.ultimosJogosFinalizados?.length > 0 && (
        <Section title="Últimos Finalizados" icon={<FaCheckCircle />}>
          <ul className="space-y-2">
            {resumo.ultimosJogosFinalizados.map((jogo, idx) => (
              <li key={idx} className="border-b last:border-none pb-2 flex justify-between">
                <span>{jogo.titulo}</span>
                <span className="text-sm text-gray-500">{jogo.plataforma}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

/* =========================
   COMPONENTES AUXILIARES
   ========================= */

function Header({ anosDisponiveis, anoSelecionado, setAnoSelecionado }) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h1 className="text-3xl font-bold text-emerald-700 flex items-center gap-2">
        <FaGamepad className="text-emerald-600" /> Dashboard GameTracker
      </h1>

      <select
        className="border rounded-lg px-3 py-2 text-gray-700 shadow-sm"
        value={anoSelecionado ?? ""}
        onChange={(e) =>
          setAnoSelecionado(e.target.value ? Number(e.target.value) : null)
        }
      >
        <option value="">Ano atual</option>
        {anosDisponiveis.map((ano) => (
          <option key={ano} value={ano}>
            {ano}
          </option>
        ))}
      </select>
    </div>
  );
}

function Card({ icon, title, value, yellow, pulse }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-5 flex flex-col items-center border-t-4 ${
        yellow ? "border-yellow-400" : "border-emerald-500"
      }`}
    >
      <div
        className={`text-3xl mb-2 ${
          yellow ? "text-yellow-500" : "text-emerald-600"
        } ${pulse ? "animate-pulse" : ""}`}
      >
        {icon}
      </div>
      <h3 className="font-semibold text-gray-600">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-8">
      <h2 className="text-2xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
        <span className="text-yellow-500">{icon}</span> {title}
      </h2>
      {children}
    </div>
  );
}
