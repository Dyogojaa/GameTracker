// src/api/apiClient.js

import axios from "axios";
import Constants from "expo-constants";

// 🔗 Obtém a URL base configurada em app.json
const API_URL = Constants.expoConfig.extra.apiUrl;

// Log útil no terminal do Expo (para depuração)
console.log("📡 Conectando à API:", API_URL);

// 🧱 Cria a instância principal do Axios
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 segundos
});

// 🧠 Intercepta respostas com erro e exibe logs amigáveis
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `❌ Erro na API: ${error.response.status} - ${error.response.statusText}`
      );
    } else if (error.request) {
      console.error("⚠️ Nenhuma resposta da API (verifique IP e servidor)");
    } else {
      console.error("🚨 Erro inesperado:", error.message);
    }
    throw error;
  }
);

// ========================
// 🕹️ Endpoints iniciais
// ========================

// Lista todos os jogos
export async function getJogos() {
  const res = await api.get("/api/jogos");
  return res.data;
}

// Cadastra um novo jogo
export async function addJogo(jogo) {
  const res = await api.post("/api/jogos", jogo);
  return res.data;
}

// Atualiza um jogo
export async function updateJogo(id, jogo) {
  const res = await api.put(`/api/jogos/${id}`, jogo);
  return res.data;
}

// Remove um jogo
export async function deleteJogo(id) {
  const res = await api.delete(`/api/jogos/${id}`);
  return res.data;
}

// Dashboard resumido (finalizados, platinados etc.)
export async function getResumo() {
  const res = await api.get("/api/dashboard/resumo");
  return res.data;
}

// Exporta instância padrão para uso direto
export default api;
