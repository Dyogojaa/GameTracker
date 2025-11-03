import axios from "axios";

const base = import.meta.env.VITE_API_BASE_URL?.trim();

if (!base) {
  console.error("⚠️ ERRO: VITE_API_BASE_URL não definida no .env");
} else {
  console.log("🌐 Base URL carregada:", base);
}

// Corrige / duplicadas ou faltantes
const baseURL = base?.replace(/\/+$/, "") + "/";

export const api = axios.create({
  baseURL,
  headers: { "Accept": "application/json" },
});

// Funções padrão
export async function get(path) {
  const url = path.startsWith("/") ? path.slice(1) : path;
  console.log("📡 GET →", `${baseURL}${url}`);
  const res = await api.get(url);
  return res.data;
}

export async function post(path, data) {
  const url = path.startsWith("/") ? path.slice(1) : path;
  console.log("📡 POST →", `${baseURL}${url}`);
  const res = await api.post(url, data);
  return res.data;
}

export async function patch(path, data) {
  const url = path.startsWith("/") ? path.slice(1) : path;
  console.log("📡 PATCH →", `${baseURL}${url}`);
  return api.patch(url, data);
}
