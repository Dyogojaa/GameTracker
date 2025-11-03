import React, { useState } from "react";
import { api } from "../api/apiClient";

export default function Importar() {
  const [arquivo, setArquivo] = useState(null);
  const [status, setStatus] = useState("");

  const handleImport = async () => {
    if (!arquivo) {
      alert("Selecione um arquivo CSV antes de importar!");
      return;
    }

    const formData = new FormData();
    // 👇 precisa ter o mesmo nome da propriedade do DTO: "Arquivo"
    formData.append("Arquivo", arquivo);

    try {
      const response = await api.post("importacao/csv", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setStatus(`✅ Importação concluída! Lidos: ${response.data.totalLidos ?? "?"}`);
      console.log("📦 Resposta:", response.data);
    } catch (err) {
      console.error("❌ Erro ao importar:", err);
      setStatus(`Erro: ${err.response?.data?.mensagem ?? err.message}`);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white rounded shadow p-6 mt-8">
      <h1 className="text-2xl font-bold mb-4">📥 Importar Arquivo CSV</h1>

      <input
        type="file"
        accept=".csv"
        onChange={(e) => setArquivo(e.target.files[0])}
        className="mb-4"
      />

      <button
        onClick={handleImport}
        disabled={!arquivo}
        className={`px-4 py-2 rounded text-white ${
          arquivo ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Importar Arquivo
      </button>

      {status && <p className="mt-4 text-sm">{status}</p>}
    </div>
  );
}
