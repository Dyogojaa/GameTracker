import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

// 🔹 Telas principais
import SplashScreen from "./src/screens/SplashScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DashboardScreen from "./src/screens/DashboardScreen";
import JogosScreen from "./src/screens/JogosScreen";
import JogoFormScreen from "./src/screens/JogoFormScreen";
import GraficosScreen from "./src/screens/GraficosScreen";
import AboutScreen from "./src/screens/AboutScreen";


const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

/**
 * Stack de Jogos — permite navegar entre a listagem e o formulário
 */
function JogosStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: "#0D1117" },
        headerTintColor: "#FFF",
        headerTitleStyle: { fontWeight: "bold" },
      }}
    >
      <Stack.Screen
        name="JogosList"
        component={JogosScreen}
        options={{ title: "Meus Jogos" }}
      />
      <Stack.Screen
        name="JogoForm"
        component={JogoFormScreen}
        options={{ title: "Cadastro / Edição" }}
      />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Splash" // 👑 Splash como primeira tela
        screenOptions={{
          headerStyle: { backgroundColor: "#0D1117" },
          headerTintColor: "#FFF",
          headerTitleStyle: { fontWeight: "bold" },
          drawerStyle: { backgroundColor: "#0D1117", width: 240 },
          drawerActiveTintColor: "#58A6FF",
          drawerInactiveTintColor: "#8B949E",
          drawerLabelStyle: { fontSize: 15, fontWeight: "bold" },
        }}
      >
        {/* 👑 Tela de abertura (não aparece no menu) */}
        <Drawer.Screen
          name="Splash"
          component={SplashScreen}
          options={{
            title: "Abertura",
            drawerItemStyle: { display: "none" },
            headerShown: false, // remove o header
          }}
        />

        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Início",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: "Dashboard",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="stats-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Jogos"
          component={JogosStack}
          options={{
            title: "Jogos",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="game-controller-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Gráficos"
          component={GraficosScreen}
          options={{
            title: "Gráficos",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="bar-chart-outline" size={size} color={color} />
            ),
          }}
        />
        <Drawer.Screen
          name="Sobre"
          component={AboutScreen}
          options={{
            title: "Sobre",
            drawerIcon: ({ color, size }) => (
              <Ionicons name="information-circle-outline" size={size} color={color} />
            ),
          }}
        />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
