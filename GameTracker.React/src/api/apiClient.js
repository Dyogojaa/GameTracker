import axios from "axios";

// 🌍 Detecta ambiente e define base URL inteligente
let base;

if (import.meta.env.DEV) {
  // 🧑‍💻 Ambiente local (rodando via npm run dev ou vite)
  base = import.meta.env.VITE_API_BASE_URL || "http://192.168.15.4:5012/api";
} else {
  // 🚀 Produção (rodando no Docker com Nginx proxy)
  base = import.meta.env.VITE_API_BASE_URL || "/api";
}

console.log("🌐 API Base URL ativa:", base);

// 🔥 Cria a instância principal do Axios
export const api = axios.create({
  baseURL: base,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// 🧩 GET genérico
export async function get(path) {
  console.log("📡 GET →", `${base.replace(/\/$/, "")}/${path}`);
  const res = await api.get(path);
  return res.data;
}

// 🧩 POST genérico
export async function post(path, data) {
  console.log("📤 POST →", `${base.replace(/\/$/, "")}/${path}`, data);
  const res = await api.post(path, data);
  return res.data;
}

// 🧩 PUT genérico
export async function put(path, data) {
  console.log("🔄 PUT →", `${base.replace(/\/$/, "")}/${path}`, data);
  const res = await api.put(path, data);
  return res.data;
}

// 🧩 PATCH genérico
export async function patch(path, data) {
  console.log("✏️ PATCH →", `${base.replace(/\/$/, "")}/${path}`, data);
  const res = await api.patch(path, data);
  return res.data;
}

// 🗑️ DELETE genérico
export async function remove(path) {
  console.log("🗑️ DELETE →", `${base.replace(/\/$/, "")}/${path}`);
  const res = await api.delete(path);
  return res.data;
}

// 🕹️ Função auxiliar para exclusão
export async function excluirJogo(id, setJogos) {
  if (!window.confirm("Tem certeza que deseja excluir este jogo?")) return;

  try {
    await remove(`jogos/${id}`);
    setJogos((prev) => prev.filter((j) => j.id !== id));
    alert("Jogo excluído com sucesso!");
  } catch (err) {
    console.error("Erro ao excluir jogo:", err);
    alert("Falha ao excluir o jogo. Verifique o console.");
  }
}
