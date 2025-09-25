import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Chip, ActivityIndicator, Avatar } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../services/supaconfig";
import { LuminaAPI, Appointment } from "../../services/api";

export default function QueriesScreen() {
  const [selectedFilter, setSelectedFilter] = useState("all");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");
  const navigation = useNavigation();

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          const patientAppointments = await LuminaAPI.getPatientAppointments(user.id);
          setAppointments(patientAppointments);
        }
      } catch (error) {
        console.error("Erro ao carregar consultas:", error);
        Alert.alert("Erro", "Não foi possível carregar suas consultas.");
      } finally {
        setLoading(false);
      }
    };
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter(appointment => {
    if (selectedFilter === "all") return true;
    return appointment.status.toLowerCase() === selectedFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "#4CAF50";
      case "pending":
        return "#FFC107";
      case "cancelled":
        return "#F44336";
      case "completed":
        return "#2196F3";
      default:
        return "#9E9E9E";
    }
  };

  const formatStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "cancelled":
        return "Cancelada";
      case "completed":
        return "Concluída";
      default:
        return status;
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Minhas Consultas" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.content}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          <TouchableOpacity onPress={() => setSelectedFilter("all")}>
            <Chip 
              selected={selectedFilter === "all"}
              style={[styles.filterChip, selectedFilter === "all" && styles.selectedChip]}
              textStyle={selectedFilter === "all" ? styles.selectedChipText : styles.chipText}
            >
              Todas
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter("pending")}>
            <Chip 
              selected={selectedFilter === "pending"}
              style={[styles.filterChip, selectedFilter === "pending" && styles.selectedChip]}
              textStyle={selectedFilter === "pending" ? styles.selectedChipText : styles.chipText}
            >
              Pendentes
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter("confirmed")}>
            <Chip 
              selected={selectedFilter === "confirmed"}
              style={[styles.filterChip, selectedFilter === "confirmed" && styles.selectedChip]}
              textStyle={selectedFilter === "confirmed" ? styles.selectedChipText : styles.chipText}
            >
              Confirmadas
            </Chip>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => setSelectedFilter("completed")}>
            <Chip 
              selected={selectedFilter === "completed"}
              style={[styles.filterChip, selectedFilter === "completed" && styles.selectedChip]}
              textStyle={selectedFilter === "completed" ? styles.selectedChipText : styles.chipText}
            >
              Concluídas
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter("cancelled")}>
            <Chip 
              selected={selectedFilter === "cancelled"}
              style={[styles.filterChip, selectedFilter === "cancelled" && styles.selectedChip]}
              textStyle={selectedFilter === "cancelled" ? styles.selectedChipText : styles.chipText}
            >
              Canceladas
            </Chip>
          </TouchableOpacity>
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Carregando consultas...</Text>
          </View>
        ) : filteredAppointments.length > 0 ? (
          <ScrollView>
            {filteredAppointments.map((appointment) => (
              <TouchableOpacity key={appointment.id} style={styles.appointmentCard}>
                <Avatar.Image 
                  size={50} 
                  source={{ uri: appointment.psychologist_avatar || "https://randomuser.me/api/portraits/men/1.jpg" }} 
                />
                <View style={styles.appointmentInfo}>
                  <Text style={styles.psychologistName}>{appointment.psychologist_name}</Text>
                  <Text style={styles.appointmentDate}>
                    <MaterialIcons name="calendar-today" size={14} color="#666" /> 
                    {new Date(appointment.appointment_date).toLocaleDateString("pt-BR")} às {appointment.appointment_time}
                  </Text>
                  <Text style={styles.appointmentType}>
                    <MaterialIcons name="videocam" size={14} color="#666" /> 
                    {appointment.session_type === "online" ? "Online" : "Presencial"} ({appointment.payment_type === "particular" ? "Particular" : "Convênio"})
                  </Text>
                  <View style={styles.statusRow}>
                    <MaterialIcons name="info-outline" size={14} color={getStatusColor(appointment.status)} />
                    <Text style={[styles.statusText, { color: getStatusColor(appointment.status) }]}>
                      {formatStatus(appointment.status)}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.moreButton}>
                  <MaterialIcons name="more-vert" size={24} color="#666" />
                </TouchableOpacity>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyContainer}>
            <MaterialIcons name="event-busy" size={64} color="#ccc" />
            <Text style={styles.emptyText}>Nenhuma consulta encontrada.</Text>
          </View>
        )}
      </View>
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
  content: {
    padding: 16,
  },
  filtersContainer: {
    marginBottom: 25,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: "#f5f5f5",
  },
  selectedChip: {
    backgroundColor: "#1976d2",
  },
  chipText: {
    color: "#666",
  },
  selectedChipText: {
    color: "white",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
    paddingHorizontal: 32,
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  appointmentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  psychologistName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  appointmentDate: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  appointmentType: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 4,
  },
  moreButton: {
    padding: 4,
  },
});

