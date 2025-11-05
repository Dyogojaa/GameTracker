import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  TextInput,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/apiClient";
import JogoCard from "../../components/JogoCard";

export default function JogosScreen({ navigation }) {
  const [jogos, setJogos] = useState([]);
  const [jogosFiltrados, setJogosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busca, setBusca] = useState("");
  const [statusFiltro, setStatusFiltro] = useState("Todos");

  // 🔹 Mapeamento de status (como no backend)
  const statusMap = {
    0: "Backlog",
    1: "Jogando",
    2: "Finalizado",
    3: "Platinado",
  };

  // 🔹 Carregar lista de jogos da API
  const carregarJogos = async () => {
    try {
      const response = await api.get("/api/jogos");
      setJogos(response.data);
      setJogosFiltrados(response.data);
    } catch (error) {
      console.error("Erro ao carregar jogos:", error);
      Alert.alert("Erro", "Não foi possível carregar os jogos.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      carregarJogos();
    });
    carregarJogos();
    return unsubscribe;
  }, [navigation]);

  // 🔹 Filtragem por busca + status
  useEffect(() => {
    let filtrados = jogos;

    if (busca.trim() !== "") {
      filtrados = filtrados.filter((j) =>
        j.titulo.toLowerCase().includes(busca.toLowerCase())
      );
    }

    if (statusFiltro !== "Todos") {
      filtrados = filtrados.filter(
        (j) => statusMap[j.status] === statusFiltro
      );
    }

    setJogosFiltrados(filtrados);
  }, [busca, statusFiltro, jogos]);

  // 🔹 Atualizar via "pull to refresh"
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarJogos();
  }, []);

  // 🔹 Excluir jogo
  const removerJogo = async (id) => {
    Alert.alert("Confirmação", "Deseja realmente excluir este jogo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Excluir",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/jogos/${id}`);
            setJogos((prev) => prev.filter((j) => j.id !== id));
          } catch {
            Alert.alert("Erro", "Falha ao excluir o jogo.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#58A6FF" />
        <Text style={{ color: "#ccc", marginTop: 10 }}>Carregando jogos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Gerenciar Jogos</Text>

      {/* 🔹 Barra de busca + filtro */}
      <View style={styles.filterRow}>
        <TextInput
          placeholder="Filtrar por título..."
          placeholderTextColor="#8B949E"
          style={styles.input}
          value={busca}
          onChangeText={setBusca}
        />
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={statusFiltro}
            onValueChange={(value) => setStatusFiltro(value)}
            dropdownIconColor="#58A6FF"
            style={styles.picker}
          >
            <Picker.Item label="Todos" value="Todos" />
            <Picker.Item label="Backlog" value="Backlog" />
            <Picker.Item label="Jogando" value="Jogando" />
            <Picker.Item label="Finalizado" value="Finalizado" />
            <Picker.Item label="Platinado" value="Platinado" />
          </Picker>
        </View>
      </View>

      {/* 🔹 Lista de jogos */}
      <FlatList
        data={jogosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <JogoCard
            jogo={item}
            onDelete={() => removerJogo(item.id)}
            onEdit={() => navigation.navigate("JogoForm", { jogo: item })}
          />
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Nenhum jogo encontrado 😕</Text>
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#58A6FF"
          />
        }
        contentContainerStyle={{ paddingBottom: 80 }}
      />

      {/* 🔹 Botão flutuante de adicionar */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("JogoForm")}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    paddingHorizontal: 12,
    paddingTop: 12,
  },
  title: {
    color: "#58A6FF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    flex: 1,
    backgroundColor: "#161B22",
    color: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 8,
  },
  pickerContainer: {
    width: 150,
    backgroundColor: "#161B22",
    borderRadius: 8,
  },
  picker: {
    color: "#FFF",
  },
  filterRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  emptyText: {
    color: "#8B949E",
    textAlign: "center",
    marginTop: 40,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#0D1117",
  },
  addButton: {
    position: "absolute",
    right: 20,
    bottom: 20,
    backgroundColor: "#238636",
    borderRadius: 50,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
  },
});
