import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import ChatListScreen from "../screens/ChatScreen";
import QueriesScreen from "../screens/QueriesScreen";

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
          if (route.name === "ChatScreen") iconName = "chat";
          if (route.name === "Consultas") iconName = "calendar-today";

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: "Home" }} />
      <Tab.Screen name="ChatScreen" component={ChatListScreen} options={{ title: "Chat"}}/>
      <Tab.Screen name="Consultas" component={QueriesScreen} options={{ title: "Consultas "}}/>
    </Tab.Navigator>
  );
}