import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/paciente/HomeScreen";
import ChatListScreen from "../screens/ChatListScreen";
import QueriesScreen from "../screens/paciente/QueriesScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { NavigationContainer } from "@react-navigation/native";

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: "#1976d2",
          tabBarInactiveTintColor: "gray",
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof MaterialIcons.glyphMap = "home";
            if (route.name === "Home") iconName = "home";
            if (route.name === "Chat") iconName = "chat";
            if (route.name === "Consultas") iconName = "calendar-today";
            if (route.name === "Configurações") iconName = "settings";
            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
        <Tab.Screen name="Chat" component={ChatListScreen} options={{ title: "Chat" }} />
        <Tab.Screen name="Consultas" component={QueriesScreen} options={{ title: "Consultas" }} />
        <Tab.Screen name="Configurações" component={SettingsScreen} options={{ title: "Config" }} />
      </Tab.Navigator>
  );
}