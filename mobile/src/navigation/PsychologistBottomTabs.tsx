import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import PsychologistHomeScreen from "../screens/psicologo/HomeScreen";
import ChatListScreen from "../screens/paciente/ChatScreen";

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

          if (route.name === "HomeScreen") iconName = "home";
          if (route.name === "Mensagens"


          ) iconName = "chat";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="HomeScreen" 
        component={PsychologistHomeScreen} 
        options={{ title: "Home" }} 
      />
      <Tab.Screen 
        name="Mensagens" 
        component={ChatListScreen} 
        options={{ title: "Mensagens" }}
      />
    </Tab.Navigator>
  );
}

