import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Appbar, Text, Avatar, List } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../services/supaconfig";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../../navigation/types";
import { LuminaAPI, Notification } from "../../services/api";

export default function PsychologistHomeScreen() {
  const [name, setName] = useState("");
  const [userId, setUserId] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();

  useEffect(() => {
    const loadProfile = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) return;
      setUserId(data.user.id);

      const profile = await LuminaAPI.getUserProfile(data.user.id);
      if (profile?.full_name) setName(profile.full_name);
    };

    loadProfile();
  }, []);

  const loadNotifications = async () => {
    try {
      if (!userId) return;
      const result = await LuminaAPI.getNotifications(userId);
      setNotifications(result);
    } catch (e) {
      console.log("Erro ao carregar notificações:", e);
    }
  };

  const openNotification = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await LuminaAPI.markNotificationAsRead(notification.id);
      }
      await loadNotifications();
    } catch (e) {
      console.log("Erro ao marcar como lida:", e);
    }
  };

  useEffect(() => {
    if (!userId) return;

    loadNotifications();

    const subscription = LuminaAPI.subscribeToNotifications(userId, () => {
      loadNotifications();
    });

    return () => {
      supabase.removeChannel(subscription);
    };
  }, [userId]);

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
          <Text style={styles.nameText}>{name}</Text>
        </View>

        <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
          <Avatar.Image
            size={50}
            source={{
              uri: "https://randomuser.me/api/portraits/men/10.jpg",
            }}
          />
        </TouchableOpacity>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Agenda */}
        <View style={styles.cardsContainer}>
          <View style={styles.cardRow}>
            <TouchableOpacity
              style={[styles.actionCard, styles.agendaCard]}
              onPress={() => navigation.navigate("Queries")}
            >
              <MaterialIcons name="calendar-today" size={24} color="white" />
              <Text style={styles.cardText}>Agenda</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notificações Recentes */}
        <View style={styles.notificationsSection}>
          <Text style={styles.sectionTitle}>Notificações recentes</Text>

          {notifications.map((n) => (
            <TouchableOpacity key={n.id} onPress={() => openNotification(n)}>
              <List.Item
                title={n.title}
                description={n.message}
                left={() => (
                  <Avatar.Icon size={35} icon="bell" style={{ backgroundColor: "#1976d2", marginLeft: 12, alignSelf: 'center' }} />
                )}
                right={() =>
                  !n.is_read ? <View style={styles.unreadDot} /> : null
                }
                style={[
                  styles.notificationItem,
                  !n.is_read && styles.unreadBackground,
                ]}
                titleStyle={styles.notificationTitle}
                descriptionStyle={styles.notificationDescription}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#f5f5f5", elevation: 0 },
  headerContent: { flex: 1, marginLeft: 10 },
  welcomeText: { fontSize: 18, color: "#1976d2", fontWeight: "bold" },
  nameText: { fontSize: 18, color: "#1976d2", fontWeight: "bold" },
  content: { padding: 16 },
  cardsContainer: { marginBottom: 24 },
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
  agendaCard: { backgroundColor: "#00bcd4" },
  cardText: { color: "white", fontSize: 16, fontWeight: "bold", marginTop: 8 },
  notificationsSection: { flex: 1 },
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
  unreadBackground: { backgroundColor: "rgba(25, 118, 210, 0.1)" },
  unreadDot: {
    width: 10,
    height: 10,
    backgroundColor: "#1976d2",
    borderRadius: 5,
    marginLeft: 12,
    marginRight: 8,
    alignSelf: "center",
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1976d2",
  },
  notificationDescription: { fontSize: 14, color: "#666" },
});
