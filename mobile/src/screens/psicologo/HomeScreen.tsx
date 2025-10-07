import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Appbar, Card, Text, Avatar, List } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../services/supaconfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";

interface Notification {
  id: string;
  patientName: string;
  message: string;
  avatar: string;
}

export default function PsychologistHomeScreen() {
  const [name, setName] = useState<string>("");
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      patientName: "Jaqueline Santos",
      message: "Marcou consulta online para 20/10",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
    },
    {
      id: "2",
      patientName: "Victor Araujo",
      message: "Pagamento confirmado",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
    },
    {
      id: "3",
      patientName: "Natália Silva",
      message: "Marcou consulta presencial para 13/10",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
    },
    {
      id: "4",
      patientName: "Hugo Pontes",
      message: "Confirmou consulta online para 12/11",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
    },
  ]);

  useEffect(() => {
    const getProfile = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", user.id)
          .single();

        if (!error && data) {
          setName(data.full_name);
        }
      }
    };

    getProfile();
  }, []);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
          <Text style={styles.nameText}>{name || "Carolina"}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Avatar.Image 
          size={50}
          source={{ uri: "https://randomuser.me/api/portraits/men/10.jpg" }} 
          />
        </TouchableOpacity>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Cards de Ações Principais */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <TouchableOpacity style={[styles.actionCard, styles.agendaCard]}
            onPress={() => navigation.navigate("Queries")}
            >
              <MaterialIcons name="calendar-today" size={24} color="white" />
              <Text style={styles.cardText}>Agenda</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionCard, styles.patientsCard, styles.fullWidth]}
              onPress={() => navigation.navigate("Patients")}
            >
              <MaterialIcons name="people" size={24} color="white" />
              <Text style={styles.cardText}>Meus pacientes</Text>
            </TouchableOpacity>
          </View>

          {/* Botão para navegação para tela de relatórios  */}
            {/* <TouchableOpacity style={[styles.actionCard, styles.reportsCard]}
              onPress={() => navigation.navigate ("Reports")}
            >
              <MaterialIcons name="assessment" size={24} color="white" />
              <Text style={styles.cardText}>Relatórios</Text>
            </TouchableOpacity> */}
        </View>

        {/* Notificações Recentes */}
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Notificações recentes</Text>
          
          {notifications.map((notification) => (
            <List.Item
              key={notification.id}
              title={notification.patientName}
              description={notification.message}
              left={() => (
                <Avatar.Image 
                  size={40} 
                  source={{ uri: notification.avatar }} 
                />
              )}
              style={styles.notificationItem}
              titleStyle={styles.notificationTitle}
              descriptionStyle={styles.notificationDescription}
            />
          ))}
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
  headerContent: {
    flex: 1,
    marginLeft: 10,
  },
  welcomeText: {
    fontSize: 18,
    color: "#1976d2",
    fontWeight: "bold",
  },
  nameText: {
    fontSize: 18,
    color: "#1976d2",
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  cardsContainer: {
    marginBottom: 24,
  },
  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    height: 100,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
  },
  fullWidth: {
    marginHorizontal: 4,
  },
  agendaCard: {
    backgroundColor: "#00bcd4",
  },
  reportsCard: {
    backgroundColor: "#2196f3",
  },
  patientsCard: {
    backgroundColor: "#9c27b0",
  },
  cardText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 8,
  },
  notificationsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  notificationItem: {
    backgroundColor: "#f9f9f9",
    marginBottom: 8,
    borderRadius: 8,
    paddingVertical: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
  },
  notificationDescription: {
    fontSize: 14,
    color: "#666",
  },
});

