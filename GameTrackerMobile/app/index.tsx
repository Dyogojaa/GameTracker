import React from "react";
import { NavigationIndependentTree } from "@react-navigation/native";
import { registerRootComponent } from "expo";
import App from "../app"; // app.js minúsculo

export default function Main() {
  return (
    <NavigationIndependentTree children={undefined}>
      <App />
    </NavigationIndependentTree>
  );
}

registerRootComponent(Main);
