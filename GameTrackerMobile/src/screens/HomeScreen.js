import * as React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar, SafeAreaView } from "react-native";
import * as Animatable from "react-native-animatable";

export default function HomeScreen({ navigation }) {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0D1117" />

      <Animatable.Image
        animation="fadeInDown"
        duration={1200}
        source={require("../../assets/images/home-banner.png")}
        style={styles.banner}
        resizeMode="contain"
      />

      <Animatable.View animation="fadeInUp" delay={300} style={styles.textContainer}>
        <Text style={styles.title}>🎮 GameTracker</Text>
        <Text style={styles.subtitle}>
          Gerencie seus jogos, conquistas e estatísticas!
        </Text>
      </Animatable.View>

      <Animatable.View animation="pulse" iterationCount="infinite" duration={2500}>
        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.button}
          onPress={() => navigation.navigate("Dashboard")}
        >
          <Text style={styles.buttonText}>📊 Entrar no Dashboard</Text>
        </TouchableOpacity>
      </Animatable.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0D1117",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  banner: {
    width: "90%",
    height: 220,
    marginBottom: 30,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    color: "#58A6FF",
    fontSize: 32,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    color: "#C9D1D9",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
  },
  button: {
    backgroundColor: "#238636",
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
});
