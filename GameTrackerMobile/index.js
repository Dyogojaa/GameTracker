import { registerRootComponent } from "expo";
import App from "./app"; // o seu arquivo é app.js, tudo minúsculo

// ✅ Este arquivo substitui o expo-router/entry.js
registerRootComponent(App);
