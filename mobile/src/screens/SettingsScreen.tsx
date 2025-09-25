import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { 
  Appbar, 
  Text, 
  Avatar, 
  List, 
  Switch, 
  Divider, 
  ActivityIndicator,
  Button 
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supaconfig";
import { LuminaAPI } from "../services/api";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../navigation/types";

// Removed unused NavigationProp type

interface UserProfile {
  id: string;
  full_name: string;
  role: string;
  avatar_url: string | null;
}

export default function SettingsScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const profileData = await LuminaAPI.getUserProfile(user.id);
        setProfile(profileData);
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Sair da conta",
      "Tem certeza que deseja sair da sua conta?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Sair", 
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              Alert.alert("Sucesso", "Você foi desconectado com sucesso!");
            } catch (error) {
              console.error("Erro ao fazer logout:", error);
              Alert.alert("Erro", "Não foi possível sair da conta.");
            }
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      "Sobre o Lumina",
      "Lumina v1.0.0\n\nUm aplicativo para conectar pacientes e psicólogos de forma segura e eficiente.\n\n© 2024 Lumina Team",
      [{ text: "OK" }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      "Suporte",
      "Para suporte técnico, entre em contato:\n\nEmail: suporte@lumina.com\nTelefone: (11) 9999-9999",
      [{ text: "OK" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "Política de Privacidade",
      "Sua privacidade é importante para nós. Todos os dados são criptografados e protegidos conforme a LGPD.",
      [{ text: "OK" }]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Carregando configurações...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Configurações" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Seção do Perfil */}
        <TouchableOpacity style={styles.profileSection} onPress={()=> navigation.navigate("Profile")}>
          <Avatar.Image 
            size={60} 
            source={{ 
              uri: profile?.avatar_url || "https://randomuser.me/api/portraits/men/1.jpg" 
            }} 
          />
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{profile?.full_name || "Usuário"}</Text>
            <Text style={styles.profileRole}>
              {profile?.role === 'psychologist' ? 'Psicólogo(a)' : 'Paciente'}
            </Text>
            <Text style={styles.profileAction}>Toque para editar perfil</Text>
          </View>
          <MaterialIcons name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <Divider style={styles.divider} />

        {/* Configurações de Notificação */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notificações</Text>
          
          <List.Item
            title="Notificações Push"
            description="Receber notificações de mensagens e consultas"
            left={(props) => <List.Icon {...props} icon="bell-outline" />}
            right={() => (
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                color="#1976d2"
              />
            )}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Configurações de Aparência */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aparência</Text>
          
          <List.Item
            title="Modo Escuro"
            description="Ativar tema escuro"
            left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={darkModeEnabled}
                onValueChange={setDarkModeEnabled}
                color="#1976d2"
              />
            )}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Configurações de Conta */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          
          <List.Item
            title="Meu Perfil"
            description="Visualizar e editar informações pessoais"
            left={(props) => <List.Icon {...props} icon="account-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={()=> navigation.navigate("Profile")}
          />
          
          <List.Item
            title="Privacidade"
            description="Política de privacidade e dados"
            left={(props) => <List.Icon {...props} icon="shield-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handlePrivacy}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Suporte e Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Suporte</Text>
          
          <List.Item
            title="Central de Ajuda"
            description="Obter suporte técnico"
            left={(props) => <List.Icon {...props} icon="help-circle-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleSupport}
          />
          
          <List.Item
            title="Sobre o Lumina"
            description="Informações sobre o aplicativo"
            left={(props) => <List.Icon {...props} icon="information-outline" />}
            right={(props) => <List.Icon {...props} icon="chevron-right" />}
            onPress={handleAbout}
          />
        </View>

        <Divider style={styles.divider} />

        {/* Botão de Logout */}
        <View style={styles.logoutSection}>
          <Button
            mode="outlined"
            onPress={handleLogout}
            style={styles.logoutButton}
            labelStyle={styles.logoutButtonText}
            icon="logout"
          >
            Sair da Conta
          </Button>
        </View>

        {/* Versão do App */}
        <View style={styles.versionSection}>
          <Text style={styles.versionText}>Versão 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#f5f5f5",
    elevation: 0,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  content: {
    flex: 1,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  profileInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  profileRole: {
    fontSize: 14,
    color: "#1976d2",
    marginTop: 2,
  },
  profileAction: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
  },
  section: {
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  logoutSection: {
    padding: 20,
    alignItems: "center",
  },
  logoutButton: {
    borderColor: "#f44336",
    width: "100%",
  },
  logoutButtonText: {
    color: "#f44336",
    fontSize: 16,
  },
  versionSection: {
    alignItems: "center",
    paddingVertical: 20,
  },
  versionText: {
    fontSize: 12,
    color: "#999",
  },
});

