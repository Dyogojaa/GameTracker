// src/screens/GraficosScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Dimensions, StyleSheet, ActivityIndicator } from "react-native";
import { PieChart, BarChart } from "react-native-chart-kit";
import api from "../api/apiClient";

const screenWidth = Dimensions.get("window").width - 32;

export default function GraficosScreen() {
  const [resumo, setResumo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarResumo();
  }, []);

  const carregarResumo = async () => {
    try {
      const response = await api.get("/api/dashboard/resumo");
      setResumo(response.data);
    } catch (error) {
      console.error("Erro ao carregar resumo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58A6FF" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>Carregando gráficos...</Text>
      </View>
    );
  }

  if (!resumo) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#ccc" }}>Sem dados disponíveis.</Text>
      </View>
    );
  }

  // 🔹 Prepara dados de pizza (por plataforma)
  const dadosPlataforma = resumo.porPlataforma.map((p, index) => ({
    name: p.nome,
    population: p.valor,
    color: cores[index % cores.length],
    legendFontColor: "#C9D1D9",
    legendFontSize: 13,
  }));

  // 🔹 Prepara dados de barras (nota média por plataforma)
  const dadosNotaMedia = {
    labels: resumo.notaMediaPorPlataforma.map((n) => n.nome),
    datasets: [
      {
        data: resumo.notaMediaPorPlataforma.map((n) => n.valor),
      },
    ],
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>📊 Estatísticas Visuais</Text>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>🎮 Jogos por Plataforma</Text>
        <PieChart
          data={dadosPlataforma}
          width={screenWidth}
          height={220}
          chartConfig={chartConfig}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
        />
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>⭐ Nota Média por Plataforma</Text>
        <BarChart
          data={dadosNotaMedia}
          width={screenWidth}
          height={250}
          chartConfig={chartConfig}
          verticalLabelRotation={15}
          style={{ borderRadius: 12 }}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          🔗 Fonte:{" "}
          <Text
            style={styles.link}
            onPress={() =>
              Linking.openURL("https://howlongtobeat.com/user/King_HyperDyo/")
            }
          >
            HowLongToBeat - King_HyperDyo
          </Text>
        </Text>
      </View>
    </ScrollView>
  );
}

const cores = [
  "#58A6FF",
  "#1F6FEB",
  "#2EA043",
  "#F85149",
  "#A371F7",
  "#DB61A2",
  "#D29922",
  "#238636",
  "#FF8C00",
];

const chartConfig = {
  backgroundGradientFrom: "#0D1117",
  backgroundGradientTo: "#0D1117",
  color: (opacity = 1) => `rgba(88, 166, 255, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(201, 209, 217, ${opacity})`,
  decimalPlaces: 1,
  barPercentage: 0.7,
};

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
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  chartTitle: {
    color: "#C9D1D9",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  footer: {
    marginTop: 20,
    alignItems: "center",
  },
  footerText: {
    color: "#8B949E",
  },
  link: {
    color: "#58A6FF",
    textDecorationLine: "underline",
  },
});
