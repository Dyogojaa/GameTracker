import React, { useEffect, useState } from "react";
import { get, post, patch, remove } from "../api/apiClient";

export default function Jogos() {
  const [jogos, setJogos] = useState([]);
  const [jogoEditando, setJogoEditando] = useState(null);
  const [jogoNovo, setJogoNovo] = useState(false);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState("");

  const statusOptions = [
    { value: 0, label: "Backlog" },
    { value: 1, label: "Jogando" },
    { value: 2, label: "Finalizado" },
    { value: 3, label: "Platinado" },
  ];

  // 🔄 Carregar jogos ao iniciar
  useEffect(() => {
    buscarJogos();
  }, []);

  async function buscarJogos() {
    try {
      let url = "jogos";
      if (filtroTitulo || filtroStatus)
        url += `?titulo=${filtroTitulo}&status=${filtroStatus}`;

      const data = await get(url);
      setJogos(data);
    } catch (error) {
      console.error("Erro ao buscar jogos:", error);
      setJogos([]);
    }
  }

  function editarJogo(jogo) {
    setJogoEditando({ ...jogo });
    setJogoNovo(false);
  }

  function novoJogo() {
    setJogoEditando({
      titulo: "",
      plataforma: "",
      genero: "",
      status: 0,
      horasJogadas: 0,
      nota: 0,
      comentarios: "",
      dataInicio: "",
      dataFim: "",
    });
    setJogoNovo(true);
  }

  function cancelarEdicao() {
    setJogoEditando(null);
    setJogoNovo(false);
  }

  async function salvarAlteracoes() {
    try {
      const payload = {
        titulo: jogoEditando.titulo?.trim(),
        plataforma: jogoEditando.plataforma?.trim(),
        genero: jogoEditando.genero?.trim() || null,
        status: Number(jogoEditando.status) ?? 0,
        horasJogadas: Number(jogoEditando.horasJogadas) || 0,
        nota: Number(jogoEditando.nota) || 0,
        comentarios: jogoEditando.comentarios?.trim() || null,
        dataInicio: jogoEditando.dataInicio || null,
        dataFim: jogoEditando.dataFim || null,
      };

      if (jogoNovo) {
        await post("jogos", payload);
      } else {
        await patch(`jogos/${jogoEditando.id}`, payload);
      }

      cancelarEdicao();
      await buscarJogos();
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
      alert("Falha ao salvar jogo. Verifique os dados e tente novamente.");
    }
  }

  async function excluirJogo(id) {
    if (!window.confirm("Tem certeza que deseja excluir este jogo?")) return;

    try {
      await remove(`jogos/${id}`);
      setJogos((prev) => prev.filter((j) => j.id !== id));
      alert("Jogo excluído com sucesso!");
    } catch (error) {
      console.error("Erro ao excluir jogo:", error);
      alert("Falha ao excluir o jogo. Verifique o console.");
    }
  }

  const obterStatus = (valor) =>
    statusOptions.find((s) => s.value === valor)?.label || "Desconhecido";

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-emerald-700 flex items-center gap-2">
        🎮 Gerenciar Jogos
      </h2>

      {/* === FILTROS === */}
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          value={filtroTitulo}
          onChange={(e) => setFiltroTitulo(e.target.value)}
          placeholder="Filtrar por título"
          className="border border-gray-300 rounded px-2 py-1"
        />
        <select
          value={filtroStatus}
          onChange={(e) => setFiltroStatus(e.target.value)}
          className="border border-gray-300 rounded px-2 py-1"
        >
          <option value="">Todos</option>
          {statusOptions.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <button
          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
          onClick={buscarJogos}
        >
          Buscar
        </button>
        <button
          className="bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
          onClick={novoJogo}
        >
          ➕ Novo Jogo
        </button>
      </div>

      {/* === TABELA === */}
      <table className="min-w-full text-sm border border-gray-300 rounded-lg overflow-hidden shadow-sm bg-white">
        <thead className="bg-emerald-700 text-white uppercase text-xs tracking-wide">
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
          {jogos.map((jogo) => (
            <tr
              key={jogo.id}
              className="border-b border-gray-200 hover:bg-emerald-50 transition-colors text-gray-800"
            >
              <td className="p-2 font-medium">{jogo.titulo}</td>
              <td className="p-2">{jogo.plataforma}</td>
              <td className="p-2">
                <select
                  value={jogo.status}
                  onChange={async (e) => {
                    const novoStatus = parseInt(e.target.value);
                    try {
                      await patch(`jogos/${jogo.id}`, {
                        ...jogo,
                        status: novoStatus,
                      });
                      setJogos((prev) =>
                        prev.map((j) =>
                          j.id === jogo.id ? { ...j, status: novoStatus } : j
                        )
                      );
                    } catch (error) {
                      console.error("Erro ao atualizar status:", error);
                      alert("Falha ao atualizar status.");
                    }
                  }}
                  className="border border-gray-300 rounded px-2 py-1 text-sm bg-white hover:border-emerald-500"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </td>
              <td className="p-2 text-right">{jogo.nota?.toFixed(1) ?? "-"}</td>
              <td className="p-2 text-right">{jogo.horasJogadas}</td>
              <td className="p-2 text-center flex justify-center gap-2">
                <button
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                  onClick={() => editarJogo(jogo)}
                >
                  ✏️ Editar
                </button>
                <button
                  className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                  onClick={() => excluirJogo(jogo.id)}
                >
                  🗑️ Excluir
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* === MODAL === */}
      {jogoEditando && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 shadow-lg">
            <h4 className="text-lg font-bold mb-3 text-emerald-700">
              {jogoNovo ? "Novo Jogo" : "Editar Jogo"}
            </h4>

            <div className="space-y-3 text-gray-700">
              {[
                { label: "Título", key: "titulo" },
                { label: "Plataforma", key: "plataforma" },
                { label: "Gênero", key: "genero" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold">{label}</label>
                  <input
                    type="text"
                    value={jogoEditando[key]}
                    onChange={(e) =>
                      setJogoEditando({
                        ...jogoEditando,
                        [key]: e.target.value,
                      })
                    }
                    className="border rounded w-full px-2 py-1 mt-1"
                  />
                </div>
              ))}

              <div>
                <label className="block text-sm font-semibold">Status</label>
                <select
                  value={jogoEditando.status}
                  onChange={(e) =>
                    setJogoEditando({
                      ...jogoEditando,
                      status: parseInt(e.target.value),
                    })
                  }
                  className="border rounded w-full px-2 py-1 mt-1"
                >
                  {statusOptions.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold">Horas Jogadas</label>
                <input
                  type="number"
                  step="0.5"
                  value={jogoEditando.horasJogadas}
                  onChange={(e) =>
                    setJogoEditando({
                      ...jogoEditando,
                      horasJogadas: parseFloat(e.target.value),
                    })
                  }
                  className="border rounded w-full px-2 py-1 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Nota</label>
                <input
                  type="number"
                  step="0.1"
                  value={jogoEditando.nota}
                  onChange={(e) =>
                    setJogoEditando({
                      ...jogoEditando,
                      nota: parseFloat(e.target.value),
                    })
                  }
                  className="border rounded w-full px-2 py-1 mt-1"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">Comentários</label>
                <textarea
                  rows="2"
                  value={jogoEditando.comentarios}
                  onChange={(e) =>
                    setJogoEditando({
                      ...jogoEditando,
                      comentarios: e.target.value,
                    })
                  }
                  className="border rounded w-full px-2 py-1 mt-1"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-5">
              <button
                className="bg-gray-400 px-3 py-1 rounded text-white hover:bg-gray-500"
                onClick={cancelarEdicao}
              >
                Cancelar
              </button>
              <button
                className="bg-blue-600 px-3 py-1 rounded text-white hover:bg-blue-700"
                onClick={salvarAlteracoes}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
