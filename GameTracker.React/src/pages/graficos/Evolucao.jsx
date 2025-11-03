import React, { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";

function formatMonthLabel(yyyymm) {
  try {
    const [year, month] = yyyymm.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);
    return date.toLocaleDateString("pt-BR", { month: "short" });
  } catch {
    return yyyymm;
  }
}

export default function Evolucao() {
  const [data, setData] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const anoAtual = new Date().getFullYear();

  useEffect(() => {
    async function carregarDados() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dashboard/evolucao");

        if (!res.ok) {
          throw new Error(`Erro HTTP ${res.status}`);
        }

        const json = await res.json();

        const dados = (json || [])
          .map((r) => ({
            mes: r.mes,
            quantidade: Number(r.quantidade ?? 0),
            label: formatMonthLabel(r.mes),
          }))
          .sort((a, b) => a.mes.localeCompare(b.mes));

        setData(dados);
        setTotal(dados.reduce((acc, cur) => acc + cur.quantidade, 0));
      } catch (err) {
        console.error("Erro ao buscar evolução:", err);
        setError(err.message || "Erro ao carregar dados");
      } finally {
        setLoading(false);
      }
    }

    carregarDados();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-1">
          📈 Evolução de Jogos Finalizados —{" "}
          <span className="text-emerald-600">{anoAtual}</span>
        </h2>
        <p className="text-gray-600 mb-4">
          Total acumulado:{" "}
          <span className="text-emerald-600 font-semibold">{total}</span> jogos
        </p>

        {loading && <p className="text-gray-600">Carregando dados...</p>}
        {error && <p className="text-red-600">Erro: {error}</p>}

        {!loading && !error && data.length === 0 && (
          <p className="text-gray-600">Nenhum dado encontrado.</p>
        )}

        {!loading && !error && data.length > 0 && (
          <div style={{ width: "100%", height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 16, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  formatter={(value) => [`${value} jogos`, "Finalizados"]}
                  labelFormatter={(label) => `Mês: ${label}`}
                />
                <Bar dataKey="quantidade" fill="#10B981" radius={[6, 6, 0, 0]}>
                  <LabelList dataKey="quantidade" position="top" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
