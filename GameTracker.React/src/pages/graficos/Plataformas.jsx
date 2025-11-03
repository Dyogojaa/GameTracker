import React, { useEffect, useState } from "react";
import { get } from "../../api/apiClient";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { FaGamepad } from "react-icons/fa";

export default function PorPlataforma() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await get("dashboard/resumo");
        setDados(data.porPlataforma || []);
      } catch (err) {
        console.error("Erro ao carregar gráfico de plataformas:", err);
      }
    }
    carregar();
  }, []);

  // 🎨 Paleta moderna estilo Hyperdyo (tons contrastantes e vibrantes)
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

  // ✅ Tooltip personalizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { nome, valor, percentual } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold text-emerald-700">{nome}</p>
          <p className="text-sm text-gray-600">{valor} jogos</p>
          <p className="text-sm text-gray-500">{percentual.toFixed(1)}% do total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2 mb-4">
        <FaGamepad /> Jogos por Plataforma
      </h1>

      {dados.length === 0 ? (
        <p className="text-gray-500">Carregando dados...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dados}
                dataKey="valor"
                cx="50%"
                cy="50%"
                outerRadius={130}
                fill="#26a69a"
                label={({ nome, percentual }) =>
                  `${nome} (${percentual.toFixed(1)}%)`
                }
                animationBegin={300}
                animationDuration={1000}
                animationEasing="ease-out"
              >
                {dados.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
