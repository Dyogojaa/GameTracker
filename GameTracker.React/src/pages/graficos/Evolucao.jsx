import React, { useEffect, useState } from "react";
import { get } from "../../api/apiClient";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { FaChartLine } from "react-icons/fa6";

export default function Evolucao() {
  const [dados, setDados] = useState([]);

  useEffect(() => {
    async function carregar() {
      try {
        const data = await get("dashboard/resumo");

        // 🧠 Simulação (caso ainda não venha da API)
        const simulacao = [
          { mes: "Jan", finalizados: 2 },
          { mes: "Fev", finalizados: 1 },
          { mes: "Mar", finalizados: 4 },
          { mes: "Abr", finalizados: 3 },
          { mes: "Mai", finalizados: 5 },
          { mes: "Jun", finalizados: 2 },
          { mes: "Jul", finalizados: 4 },
          { mes: "Ago", finalizados: 3 },
          { mes: "Set", finalizados: 2 },
          { mes: "Out", finalizados: 3 },
          { mes: "Nov", finalizados: 1 },
          { mes: "Dez", finalizados: 2 },
        ];

        setDados(data.evolucaoMensal || simulacao);
      } catch (err) {
        console.error("Erro ao carregar gráfico de evolução:", err);
      }
    }
    carregar();
  }, []);

  // ✅ Tooltip customizado
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { mes, finalizados } = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-md">
          <p className="font-semibold text-emerald-700">{mes}</p>
          <p className="text-sm text-gray-600">
            {finalizados} jogos finalizados
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-emerald-700 flex items-center gap-2 mb-4">
        <FaChartLine /> Evolução de Jogos Finalizados
      </h1>

      {dados.length === 0 ? (
        <p className="text-gray-500">Carregando dados...</p>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-md">
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={dados}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="mes" tick={{ fill: "#444" }} />
              <YAxis tick={{ fill: "#444" }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="finalizados"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ r: 6, fill: "#10b981", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 8, fill: "#059669" }}
                animationDuration={1000}
              >
                {/* 🎯 Mostra os valores acima de cada ponto */}
                <LabelList
                  dataKey="finalizados"
                  position="top"
                  fill="#064e3b"
                  fontSize={14}
                  fontWeight={600}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
