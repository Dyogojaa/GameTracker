import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import api from "../api/apiClient";
import "react-native-get-random-values";
import { v4 as uuidv4 } from "uuid";

export default function JogoFormScreen({ route, navigation }) {
  const jogoEditando = route.params?.jogo || null;

  const [titulo, setTitulo] = useState("");
  const [plataforma, setPlataforma] = useState("");
  const [genero, setGenero] = useState("");
  const [status, setStatus] = useState("0");
  const [horasJogadas, setHorasJogadas] = useState("");
  const [nota, setNota] = useState("");
  const [comentarios, setComentarios] = useState("");

  useEffect(() => {
    if (jogoEditando) {
      setTitulo(jogoEditando.titulo || "");
      setPlataforma(jogoEditando.plataforma || "");
      setGenero(jogoEditando.genero || "");
      setStatus(jogoEditando.status?.toString() || "0");
      setHorasJogadas(jogoEditando.horasJogadas?.toString() || "");
      setNota(jogoEditando.nota?.toString() || "");
      setComentarios(jogoEditando.comentarios || "");
    }
  }, [jogoEditando]);

  const salvar = async () => {
    if (!titulo.trim()) {
      Alert.alert("Atenção", "Informe o título do jogo.");
      return;
    }

    const payload = {
      id: jogoEditando?.id || uuidv4(),
      titulo: titulo.trim(),
      plataforma: plataforma.trim(),
      genero: genero.trim(),
      status: parseInt(status),
      dataInicio: new Date().toISOString(),
      dataFim: new Date().toISOString(),
      horasJogadas: parseInt(horasJogadas) || 0,
      nota: parseInt(nota) || 0,
      comentarios: comentarios.trim(),
      usuarioId: uuidv4(), // ajuste temporário
    };

    console.log("📦 Enviando payload:", payload);

    try {
      if (jogoEditando) {
        await api.put(`/api/jogos/${jogoEditando.id}`, payload);
        Alert.alert("Sucesso", "Jogo atualizado com sucesso!");
      } else {
        await api.post("/api/jogos", payload);
        Alert.alert("Sucesso", "Jogo cadastrado com sucesso!");
      }

      navigation.goBack();
    } catch (error) {
      console.error("Erro ao salvar jogo:", error);
      Alert.alert("Erro", "Falha ao salvar o jogo.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Text style={styles.title}>
          {jogoEditando ? "✏️ Editar Jogo" : "🎮 Novo Jogo"}
        </Text>

        <Text style={styles.label}>Título</Text>
        <TextInput
          style={styles.input}
          value={titulo}
          onChangeText={setTitulo}
          placeholder="Ex: Dragon’s Crown"
          placeholderTextColor="#8B949E"
        />

        <Text style={styles.label}>Plataforma</Text>
        <TextInput
          style={styles.input}
          value={plataforma}
          onChangeText={setPlataforma}
          placeholder="Ex: PlayStation 4"
          placeholderTextColor="#8B949E"
        />

        <Text style={styles.label}>Gênero</Text>
        <TextInput
          style={styles.input}
          value={genero}
          onChangeText={setGenero}
          placeholder="Ex: Ação / RPG"
          placeholderTextColor="#8B949E"
        />

        <Text style={styles.label}>Status</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={status}
            onValueChange={(v) => setStatus(v)}
            style={styles.picker}
            dropdownIconColor="#58A6FF"
          >
            <Picker.Item label="Backlog" value="0" />
            <Picker.Item label="Jogando" value="1" />
            <Picker.Item label="Finalizado" value="2" />
            <Picker.Item label="Platinado" value="3" />
          </Picker>
        </View>

        <Text style={styles.label}>Horas Jogadas</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={horasJogadas}
          onChangeText={setHorasJogadas}
          placeholder="Ex: 10"
          placeholderTextColor="#8B949E"
        />

        <Text style={styles.label}>Nota (0 a 10)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={nota}
          onChangeText={setNota}
          placeholder="Ex: 8"
          placeholderTextColor="#8B949E"
        />

        <Text style={styles.label}>Comentários</Text>
        <TextInput
          style={[styles.input, { height: 100, textAlignVertical: "top" }]}
          multiline
          value={comentarios}
          onChangeText={setComentarios}
          placeholder="Ex: Origem: PlayStation Store"
          placeholderTextColor="#8B949E"
        />

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.cancelButton]}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>Cancelar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.saveButton]}
            onPress={salvar}
          >
            <Ionicons name="save-outline" size={18} color="#FFF" />
            <Text style={[styles.buttonText, { marginLeft: 6 }]}>Salvar</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    padding: 20,
  },
  title: {
    color: "#58A6FF",
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    color: "#C9D1D9",
    fontSize: 16,
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#161B22",
    color: "#FFF",
    padding: 12,
    borderRadius: 8,
  },
  pickerContainer: {
    backgroundColor: "#161B22",
    borderRadius: 8,
    marginBottom: 10,
  },
  picker: {
    color: "#FFF",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: "#6E7681",
  },
  saveButton: {
    backgroundColor: "#238636",
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
