import React, { useEffect, useState } from "react";
import { get, patch } from "../api/apiClient";
import { motion } from "framer-motion";

export default function Jogos() {
  const [jogos, setJogos] = useState([]);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");
  const [jogoEditando, setJogoEditando] = useState(null);
  const [loading, setLoading] = useState(false);

  const buscarJogos = async () => {
    setLoading(true);
    try {
      let url = "jogos";
      if (filtroTitulo || filtroStatus)
        url += `?titulo=${filtroTitulo}&status=${filtroStatus}`;

      const data = await get(url);
      setJogos(data || []);
    } catch (err) {
      console.error("Erro ao buscar jogos:", err);
    } finally {
      setLoading(false);
    }
  };

  const salvarAlteracoes = async () => {
    if (!jogoEditando) return;

    try {
      await patch(`jogos/${jogoEditando.id}`, {
        nota: jogoEditando.nota,
        horasJogadas: jogoEditando.horasJogadas,
        comentarios: jogoEditando.comentarios
      });
      setJogoEditando(null);
      buscarJogos();
    } catch (err) {
      console.error("Erro ao salvar alterações:", err);
      alert("❌ Erro ao salvar alterações!");
    }
  };

  useEffect(() => {
    buscarJogos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
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
          className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700 transition"
        >
          Buscar
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : jogos.length === 0 ? (
        <p>Nenhum jogo encontrado.</p>
      ) : (
        <table className="min-w-full text-sm border border-gray-300 bg-white rounded shadow-md">
          <thead className="bg-emerald-600 text-white">
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
              <tr key={j.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{j.titulo}</td>
                <td className="p-2">{j.plataforma}</td>
                <td className="p-2">{j.status}</td>
                <td className="p-2 text-right">{j.nota ?? "-"}</td>
                <td className="p-2 text-right">{j.horasJogadas ?? "-"}</td>
                <td className="p-2 text-center">
                  <button
                    onClick={() => setJogoEditando(j)}
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
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-lg p-6 shadow-lg w-96"
          >
            <h2 className="text-xl font-semibold mb-4">
              ✏️ Editar {jogoEditando.titulo}
            </h2>

            <label className="block mb-2 text-sm font-medium">
              Nota
              <input
                type="number"
                value={jogoEditando.nota || ""}
                onChange={(e) =>
                  setJogoEditando({ ...jogoEditando, nota: e.target.value })
                }
                className="border rounded w-full px-2 py-1"
              />
            </label>

            <label className="block mb-2 text-sm font-medium">
              Horas Jogadas
              <input
                type="number"
                value={jogoEditando.horasJogadas || ""}
                onChange={(e) =>
                  setJogoEditando({
                    ...jogoEditando,
                    horasJogadas: e.target.value
                  })
                }
                className="border rounded w-full px-2 py-1"
              />
            </label>

            <label className="block mb-3 text-sm font-medium">
              Comentários
              <textarea
                value={jogoEditando.comentarios || ""}
                onChange={(e) =>
                  setJogoEditando({
                    ...jogoEditando,
                    comentarios: e.target.value
                  })
                }
                rows="3"
                className="border rounded w-full px-2 py-1"
              />
            </label>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setJogoEditando(null)}
                className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={salvarAlteracoes}
                className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
              >
                Salvar
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
