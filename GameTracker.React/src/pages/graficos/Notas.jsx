import React, { useEffect, useState } from "react";
import { get } from "../../api/apiClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { FaStar } from "react-icons/fa";

export default function NotaMediaPorPlataforma() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await get("dashboard/resumo");
        setDados(data.notaMediaPorPlataforma || []);
      } catch (err) {
        console.error("Erro ao carregar gráfico de médias:", err);
      }
    }
    carregar();
  }, []);

  // 🎨 Paleta moderna e vibrante — estilo Hyperdyo
  const COLORS = [
    "#00C49F", // teal
    "#0088FE", // blue
    "#FFBB28", // amber
    "#FF8042", // orange
    "#AF19FF", // purple
    "#E91E63", // pink
    "#4CAF50", // green
    "#9C27B0", // violet
  ];

  // ✅ Tooltip customizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { nome, valor } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold text-emerald-700">{nome}</p>
          <p className="text-sm text-gray-600">Média: {valor.toFixed(2)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2 mb-4">
        <FaStar className="text-yellow-400" /> Nota Média por Plataforma
      </h1>

      {dados.length === 0 ? (
        <p className="text-gray-500">Carregando dados...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={dados}
              margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="nome" tick={{ fill: "#444" }} />
              <YAxis domain={[0, 10]} tick={{ fill: "#444" }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="valor"
                radius={[8, 8, 0, 0]}
                animationBegin={300}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {dados.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    stroke="#fff"
                    strokeWidth={1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
