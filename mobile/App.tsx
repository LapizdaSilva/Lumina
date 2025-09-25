import React, { useState, useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { Provider as PaperProvider } from "react-native-paper";
import { supabase } from "./src/supaconfig";
import { RootStackParamList } from "./src/navigation/types";

import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreen from "./src/screens/RegisterScreen";
import BottomTabs from "./src/navigation/BottomTabs";
import PsychologistBottomTabs from "./src/navigation/PsychologistBottomTabs";
import SearchScreen from "./src/screens/paciente/SearchScreen";
import HistoryScreen from "./src/screens/psicologo/HistoryScreen";
import PsicoAgenda from "./src/screens/psicologo/PsicoAgenda";
import ProfileScreen from "./src/screens/ProfileScreen";
import ChatScreen from "./src/screens/ChatScreen";
import PatientsScreen from "./src/screens/psicologo/PatientsScreen";
import VideoCallScreen from "./src/screens/VideoScreen";

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    let subscription: { unsubscribe: () => void } | null = null;

    const initSession = async () => {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      setSession(initialSession);
      
      if (initialSession?.user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", initialSession.user.id)
          .single();
        
        if (!error && data) {
          setUserRole(data.role);
        }
      }
      
      setLoading(false);

      const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
        setSession(session);
        
        if (session?.user) {
          const { data, error } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", session.user.id)
            .single();
          
          if (!error && data) {
            setUserRole(data.role);
          }
        } else {
          setUserRole(null);
        }
      });

      subscription = listener.subscription;
    };

    initSession();

    return () => {
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <PaperProvider>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </PaperProvider>
    );
  }

  const MainNavigator = userRole === "psychologist" ? PsychologistBottomTabs : BottomTabs;

  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session && session.user ? (
            <>
              <Stack.Screen name="Home" component={MainNavigator} />
              <Stack.Screen name="Search" component={SearchScreen} />
              <Stack.Screen name="History" component={HistoryScreen} />
              <Stack.Screen name="Queries" component={PsicoAgenda} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="Conversation" component={ChatScreen} />
              <Stack.Screen name="Patients" component={PatientsScreen} />
              <Stack.Screen name="VideoCall" component={VideoCallScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="Register" component={RegisterScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
