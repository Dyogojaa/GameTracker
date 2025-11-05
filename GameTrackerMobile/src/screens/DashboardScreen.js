import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/apiClient";

export default function DashboardScreen() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);

  const carregarDashboard = async () => {
    try {
      const { data } = await api.get("/api/dashboard/resumo");
      setResumo(data);
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDashboard();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58A6FF" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>
          Carregando estatísticas...
        </Text>
      </View>
    );
  }

  if (!resumo) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#ccc" }}>Nenhum dado disponível.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Dashboard</Text>

      {/* 🔹 Cards Resumo */}
      <View style={styles.cardsRow}>
        <View style={styles.card}>
          <Ionicons name="checkmark-circle-outline" size={28} color="#4ADE80" />
          <Text style={styles.cardNumber}>{resumo.jogosFinalizados}</Text>
          <Text style={styles.cardLabel}>Finalizados</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="trophy-outline" size={28} color="#FACC15" />
          <Text style={styles.cardNumber}>{resumo.jogosPlatinados}</Text>
          <Text style={styles.cardLabel}>Platinados</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="time-outline" size={28} color="#60A5FA" />
          <Text style={styles.cardNumber}>{resumo.horasTotais}</Text>
          <Text style={styles.cardLabel}>Horas Jogadas</Text>
        </View>

        <View style={styles.card}>
          <Ionicons name="star-outline" size={28} color="#F59E0B" />
          <Text style={styles.cardNumber}>
            {resumo.notaMediaGeral?.toFixed(1)}
          </Text>
          <Text style={styles.cardLabel}>Nota Média</Text>
        </View>
      </View>

      {/* 🔹 Top 5 Jogos */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⭐ Top 5 Jogos</Text>
        {resumo.topJogos?.length > 0 ? (
          resumo.topJogos.map((j, i) => (
            <View key={i} style={styles.listItem}>
              <Text style={styles.rank}>{i + 1}.</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.jogoTitulo}>{j.titulo}</Text>
                <Text style={styles.jogoPlataforma}>{j.plataforma}</Text>
              </View>
              <Text style={styles.jogoNota}>⭐ {j.nota}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum jogo avaliado ainda.</Text>
        )}
      </View>

      {/* 🔹 Últimos Jogados */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎮 Últimos Finalizados</Text>
        {resumo.ultimosJogosFinalizados?.length > 0 ? (
          resumo.ultimosJogosFinalizados.map((j, i) => (
            <View key={i} style={styles.listItem}>
              <Ionicons name="game-controller-outline" size={20} color="#58A6FF" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.jogoTitulo}>{j.titulo}</Text>
                <Text style={styles.jogoPlataforma}>
                  {j.plataforma} —{" "}
                  {new Date(j.dataFim).toLocaleDateString("pt-BR")}
                </Text>
              </View>
              <Text style={styles.jogoNota}>⭐ {j.nota}</Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>Nenhum jogo recente.</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    padding: 16,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D1117",
  },
  title: {
    color: "#58A6FF",
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  cardsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  card: {
    backgroundColor: "#161B22",
    flexBasis: "48%",
    alignItems: "center",
    marginBottom: 10,
    borderRadius: 10,
    paddingVertical: 16,
  },
  cardNumber: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 8,
  },
  cardLabel: {
    color: "#8B949E",
    fontSize: 14,
  },
  section: {
    marginTop: 20,
  },
  sectionTitle: {
    color: "#58A6FF",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161B22",
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  rank: {
    color: "#C9D1D9",
    fontSize: 16,
    width: 25,
    textAlign: "center",
  },
  jogoTitulo: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  jogoPlataforma: {
    color: "#8B949E",
    fontSize: 14,
  },
  jogoNota: {
    color: "#FACC15",
    fontSize: 16,
    fontWeight: "bold",
  },
  emptyText: {
    color: "#8B949E",
    textAlign: "center",
    marginTop: 10,
  },
});
