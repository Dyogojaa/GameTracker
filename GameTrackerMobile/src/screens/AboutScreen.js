import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function AboutScreen() {
  const openHowLongToBeat = () => {
    Linking.openURL("https://howlongtobeat.com/user/King_HyperDyo/");
  };

  return (
    <View style={styles.container}>
      <Ionicons name="information-circle-outline" size={80} color="#58A6FF" />
      <Text style={styles.title}>KingHyperDyo GameTracker</Text>
      <Text style={styles.subtitle}>
        Acompanhe seu progresso em jogos e veja suas estatísticas pessoais!
      </Text>

      <TouchableOpacity style={styles.button} onPress={openHowLongToBeat}>
        <Ionicons name="link-outline" size={20} color="#FFF" />
        <Text style={styles.buttonText}>Abrir Perfil HowLongToBeat</Text>
      </TouchableOpacity>

      <Text style={styles.footer}>Versão 1.0.0 • © {new Date().getFullYear()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#58A6FF",
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 10,
  },
  subtitle: {
    color: "#C9D1D9",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 30,
    fontSize: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#238636",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  footer: {
    color: "#8B949E",
    fontSize: 12,
    position: "absolute",
    bottom: 20,
  },
});
