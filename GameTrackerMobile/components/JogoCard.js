import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Mapeia o código numérico do status para texto
const statusMap = {
  0: "Backlog",
  1: "Jogando",
  2: "Finalizado",
  3: "Platinado",
  4: "Abandonado",
};

export default function JogoCard({ jogo, onEdit, onDelete }) {
  return (
    <View style={styles.card}>
      <View style={{ flex: 1 }}>
        {/* 🔹 Nome do jogo */}
        <Text style={styles.titulo}>{jogo.titulo}</Text>

        {/* 🔹 Informações adicionais */}
        <Text style={styles.subInfo}>
          🎮 {jogo.plataforma || "Sem plataforma"}
        </Text>

        <Text style={styles.subInfo}>
          📊 {statusMap[jogo.status] || "Desconhecido"} • ⏱️{" "}
          {jogo.horasJogadas || 0}h
        </Text>

        {jogo.nota > 0 && (
          <Text style={styles.subInfo}>⭐ Nota: {jogo.nota}/10</Text>
        )}
      </View>

      {/* 🔹 Botões de ação */}
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit} style={styles.iconButton}>
          <Ionicons name="create-outline" size={22} color="#58A6FF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} style={styles.iconButton}>
          <Ionicons name="trash-outline" size={22} color="#FF6B6B" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#161B22",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,
  },
  titulo: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  subInfo: {
    color: "#8B949E",
    fontSize: 14,
    marginTop: 3,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    marginLeft: 10,
  },
});
