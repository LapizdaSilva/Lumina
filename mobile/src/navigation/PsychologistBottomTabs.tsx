import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import PsychologistHomeScreen from "../screens/psicologo/HomeScreen";
import ChatListScreen from "../screens/ChatListScreen";
import PsicoAgenda from "../screens/psicologo/PsicoAgenda";
import PatientsScreen from "../screens/psicologo/PatientsScreen";
import SettingsScreen from "../screens/SettingsScreen";

const Tab = createBottomTabNavigator();

export default function PsychologistBottomTabs() {
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
          if (route.name === "Configurações") iconName = "settings";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={PsychologistHomeScreen} 
        options={{ title: "Home" }} 
      />
      <Tab.Screen 
        name="Chat" 
        component={ChatListScreen} 
        options={{ title: "Chat" }}
      />
      <Tab.Screen 
        name="Configurações" 
        component={SettingsScreen} 
        options={{ title: "Config" }}
      />
    </Tab.Navigator>
  );
}

