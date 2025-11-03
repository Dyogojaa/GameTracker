import React, { useEffect, useState } from "react";
import { api } from "../api/apiClient";

export default function Jogos() {
  const [jogos, setJogos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState("");
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [jogoEditando, setJogoEditando] = useState(null);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    buscarJogos();
  }, []);

  async function buscarJogos() {
    try {
      setErro("");
      setLoading(true);

      const params = new URLSearchParams();
      if (filtroTitulo) params.append("titulo", filtroTitulo);
      if (filtroStatus) params.append("status", filtroStatus);



      const url = `/jogos${params.toString() ? "?" + params.toString() : ""}`;
      console.log("📡 Buscando jogos em:", url);

      const response = await api.get(url);
      console.log("✅ Resposta recebida:", response);

      const data = response?.data ?? response;
      if (!Array.isArray(data)) throw new Error("Resposta inesperada da API");

      setJogos(data);
    } catch (err) {
      console.error("❌ Erro ao buscar jogos:", err);
      setErro(err.message || "Falha ao carregar lista de jogos.");
    } finally {
      setLoading(false);
    }
  }

  function abrirEdicao(jogo) {
    console.log("📝 Editando:", jogo);
    setJogoEditando({ ...jogo });
  }

  async function salvarEdicao() {
    if (!jogoEditando) return;
    setSalvando(true);

    try {
      console.log("✏️ Salvando PUT →", jogoEditando);
      await api.put(`/jogos/${jogoEditando.id}`, jogoEditando, {
        headers: { "Content-Type": "application/json" },
      });
      console.log("✅ Atualizado com sucesso");

      setJogos((lista) =>
        lista.map((j) => (j.id === jogoEditando.id ? jogoEditando : j))
      );
      setJogoEditando(null);
    } catch (err) {
      console.error("❌ Erro ao salvar alterações:", err);
      setErro("Erro ao salvar alterações.");
    } finally {
      setSalvando(false);
    }
  }

  const obterStatusTexto = (status) => {
    const map = {
      0: "Backlog",
      1: "Jogando",
      2: "Finalizado",
      3: "Platinado",
    };
    return map[Number(status)] ?? String(status ?? "");
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">🎮 Lista de Jogos</h1>

      <div className="flex gap-2 mb-4">
        <input
          value={filtroTitulo}
          onChange={(e) => setFiltroTitulo(e.target.value)}
          placeholder="Filtrar por título"
          className="border rounded px-2 py-1"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border rounded px-2 py-1"
        >
          <option value="">Todos</option>
          <option value="0">Backlog</option>
          <option value="1">Jogando</option>
          <option value="2">Finalizado</option>
          <option value="3">Platinado</option>
        </select>
        <button
          onClick={buscarJogos}
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          Buscar
        </button>
      </div>

      {erro && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          ⚠️ {erro}
        </div>
      )}

      {loading ? (
        <p>Carregando jogos...</p>
      ) : (
        <table className="w-full text-sm border border-gray-700">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="p-2 text-left">Título</th>
              <th className="p-2 text-left">Plataforma</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right">Nota</th>
              <th className="p-2 text-right">Horas</th>
              <th className="p-2 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {jogos.map((j) => (
              <tr key={j.id} className="border-b border-gray-600 hover:bg-gray-700">
                <td className="p-2">{j.titulo}</td>
                <td className="p-2">{j.plataforma}</td>
                <td className="p-2">{obterStatusTexto(j.status)}</td>
                <td className="p-2 text-right">{j.nota ?? "-"}</td>
                <td className="p-2 text-right">{j.horasJogadas ?? "-"}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => abrirEdicao(j)}
                    className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  >
                    ✏️ Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {jogoEditando && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg w-96 p-6">
          <h2 className="text-lg font-bold mb-3">Editar Jogo</h2>

          {/* 🔤 Título */}
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text"
            value={jogoEditando.titulo}
            onChange={(e) =>
              setJogoEditando({ ...jogoEditando, titulo: e.target.value })
            }
            className="w-full border rounded px-2 py-1 mb-2"
          />

          {/* 🕹️ Plataforma */}
          <label className="block text-sm font-medium mb-1">Plataforma</label>
          <input
            type="text"
            value={jogoEditando.plataforma ?? ""}
            onChange={(e) =>
              setJogoEditando({ ...jogoEditando, plataforma: e.target.value })
            }
            className="w-full border rounded px-2 py-1 mb-2"
          />

          {/* 🎯 Status */}
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            value={jogoEditando.status ?? ""}
            onChange={(e) =>
              setJogoEditando({
                ...jogoEditando,
                status: Number(e.target.value),
              })
            }
            className="w-full border rounded px-2 py-1 mb-2"
          >
            <option value="0">Backlog</option>
            <option value="1">Jogando</option>
            <option value="2">Finalizado</option>
            <option value="3">Platinado</option>
          </select>

          {/* ⭐ Nota */}
          <label className="block text-sm font-medium mb-1">Nota</label>
          <input
            type="number"
            step="0.1"
            value={jogoEditando.nota ?? ""}
            onChange={(e) =>
              setJogoEditando({
                ...jogoEditando,
                nota:
                  e.target.value === "" ? null : parseFloat(e.target.value),
              })
            }
            className="w-full border rounded px-2 py-1 mb-2"
          />

          {/* ⏱️ Horas Jogadas */}
          <label className="block text-sm font-medium mb-1">Horas Jogadas</label>
          <input
            type="number"
            step="0.5"
            value={jogoEditando.horasJogadas ?? ""}
            onChange={(e) =>
              setJogoEditando({
                ...jogoEditando,
                horasJogadas:
                  e.target.value === "" ? null : parseFloat(e.target.value),
              })
            }
            className="w-full border rounded px-2 py-1 mb-2"
          />

          {/* 💬 Comentários */}
          <label className="block text-sm font-medium mb-1">Comentários</label>
          <textarea
            rows="3"
            value={jogoEditando.comentarios ?? ""}
            onChange={(e) =>
              setJogoEditando({
                ...jogoEditando,
                comentarios: e.target.value,
              })
            }
            className="w-full border rounded px-2 py-1 mb-4"
          />

          {/* Botões */}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setJogoEditando(null)}
              className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
            >
              Cancelar
            </button>
            <button
              onClick={salvarEdicao}
              disabled={salvando}
              className={`${
                salvando ? "bg-blue-300" : "bg-blue-600 hover:bg-blue-700"
              } text-white px-3 py-1 rounded`}
            >
              {salvando ? "Salvando..." : "Salvar"}
            </button>
          </div>
        </div>
      </div>
    )}
    </div>
  );
}
