import axios from "axios";

// 🔧 Define a URL base — usa .env se existir, ou cai no padrão localhost
const base =
  import.meta.env.VITE_API_BASE_URL || "https://localhost:7158/api";

console.log("🌐 API Base URL:", base);

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
  console.log("📡 GET →", `${base}/${path}`);
  const res = await api.get(path);
  return res.data;
}

// 🧩 POST genérico
export async function post(path, data) {
  console.log("📤 POST →", `${base}/${path}`, data);
  const res = await api.post(path, data);
  return res.data;
}

// 🧩 PUT genérico (caso use no editar)
export async function put(path, data) {
  console.log("🔄 PUT →", `${base}/${path}`, data);
  const res = await api.put(path, data);
  return res.data;
}

// 🧩 PATCH genérico
export async function patch(path, data) {
  console.log("✏️ PATCH →", `${base}/${path}`, data);
  const res = await api.patch(path, data);
  return res.data;
}

// 🗑️ DELETE genérico
export async function remove(path) {
  console.log("🗑️ DELETE →", `${base}/${path}`);
  const res = await api.delete(path);
  return res.data;
}

async function excluirJogo(id) {
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