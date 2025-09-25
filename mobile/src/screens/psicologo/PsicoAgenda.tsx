import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Avatar, Button, Chip, ActivityIndicator, Modal, Portal, Provider } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../supaconfig";
import { LuminaAPI, AgendaItem } from "../../services/api";

export default function PsicoAgenda() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appointments, setAppointments] = useState<AgendaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<AgendaItem | null>(null);
  const navigation = useNavigation();

  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          loadAgenda(user.id, selectedDate);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    };
    loadData();
  }, []);

  const loadAgenda = async (psychologistId: string, date: Date) => {
    try {
      setLoading(true);
      const dateString = date.toISOString().split('T')[0];
      const agendaData = await LuminaAPI.getPsychologistAgenda(psychologistId, dateString);
      setAppointments(agendaData);
    } catch (error) {
      console.error("Erro ao carregar agenda:", error);
      Alert.alert("Erro", "Não foi possível carregar a agenda.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      loadAgenda(userId, selectedDate);
    }
  }, [selectedDate, userId]);

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
  };

  const openModal = (appointment: AgendaItem) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedAppointment(null);
  };

  const updateAppointmentStatus = async (newStatus: string) => {
    if (!selectedAppointment) return;
    try {
      await LuminaAPI.updateAppointmentStatus(selectedAppointment.id, newStatus);
      Alert.alert("Sucesso", `Consulta ${newStatus === 'confirmed' ? 'confirmada' : 'cancelada'} com sucesso!`);
      loadAgenda(userId, selectedDate);
      closeModal();
    } catch (error) {
      console.error("Erro ao atualizar status:", error);
      Alert.alert("Erro", "Não foi possível atualizar o status da consulta.");
    }
  };

  const renderDateSelector = () => {
    const dates = [];
    for (let i = -2; i <= 2; i++) {
      const date = new Date(selectedDate);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    return (
      <View style={styles.dateSelector}>
        <Text style={styles.monthText}>
          {selectedDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
        </Text>
        <View style={styles.weekContainer}>
          {dates.map((date, index) => (
            <View key={index} style={styles.dayColumn}>
              <Text style={styles.dayText}>
                {date.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 1)}
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  date.toDateString() === selectedDate.toDateString() && styles.selectedDateButton
                ]}
                onPress={() => handleDateChange(date)}
              >
                <Text style={[
                  styles.dateText,
                  date.toDateString() === selectedDate.toDateString() && styles.selectedDateText
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Portal>
          <Modal visible={modalVisible} onDismiss={closeModal} contentContainerStyle={styles.modalContainer}>
            {selectedAppointment && (
              <View>
                <Text style={styles.modalTitle}>Gerenciar Consulta</Text>
                <Text style={styles.modalPatientName}>{selectedAppointment.patient_name}</Text>
                <Text style={styles.modalDetails}>Horário: {selectedAppointment.appointment_time}</Text>
                <Text style={styles.modalDetails}>Tipo: {selectedAppointment.session_type === 'online' ? 'Online' : 'Presencial'}</Text>
                <Text style={styles.modalDetails}>Pagamento: {selectedAppointment.payment_type === 'particular' ? 'Particular' : 'Convênio'}</Text>
                <View style={styles.modalButtons}>
                  <Button 
                    mode="outlined" 
                    onPress={() => updateAppointmentStatus('cancelled')} 
                    style={styles.modalButton}
                    color="#F44336"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    mode="contained" 
                    onPress={() => updateAppointmentStatus('confirmed')} 
                    style={styles.modalButton}
                  >
                    Confirmar
                  </Button>
                </View>
              </View>
            )}
          </Modal>
        </Portal>

        <Appbar.Header style={styles.header}>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Agenda" titleStyle={styles.headerTitle} />
          <Button 
            mode="contained" 
            onPress={() => Alert.alert("Adicionar Consulta", "Funcionalidade a ser implementada.")}
            style={styles.addButton}
            labelStyle={styles.addButtonText}
          >
            Adicionar
          </Button>
        </Appbar.Header>

        <ScrollView style={styles.content}>
          {renderDateSelector()}

          <View style={styles.appointmentsSection}>
            <View style={styles.appointmentsHeader}>
              <Text style={styles.sectionTitle}>Consultas agendadas</Text>
              <MaterialIcons name="sort" size={24} color="#666" />
            </View>

            {loading ? (
              <ActivityIndicator size="large" color="#1976d2" style={{ marginTop: 50 }} />
            ) : appointments.length > 0 ? (
              appointments.map((appointment) => (
                <TouchableOpacity key={appointment.id} style={styles.appointmentCard} onPress={() => openModal(appointment)}>
                  <View style={styles.timeColumn}>
                    <Text style={styles.timeText}>{appointment.appointment_time.slice(0, 5)}</Text>
                  </View>

                  <View style={styles.appointmentDetails}>
                    <View style={styles.typeRow}>
                      <Chip 
                        style={[
                          styles.typeChip,
                          appointment.session_type === "online" ? styles.onlineChip : styles.presentialChip
                        ]}
                        textStyle={styles.chipText}
                      >
                        {appointment.session_type === "online" ? "Online" : "Presencial"}
                      </Chip>
                      <Text style={styles.modalityText}>{appointment.payment_type === "particular" ? "Particular" : "Convênio"}</Text>
                    </View>

                    <View style={styles.patientRow}>
                      <Avatar.Image 
                        size={32} 
                        source={{ uri: appointment.patient_avatar || "https://randomuser.me/api/portraits/men/1.jpg" }} 
                      />
                      <Text style={styles.patientName}>{appointment.patient_name}</Text>
                      {appointment.status === "confirmed" && (
                        <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                      )}
                      {appointment.status === "pending" && (
                        <MaterialIcons name="hourglass-empty" size={20} color="#FFC107" />
                      )}
                    </View>
                  </View>

                  <TouchableOpacity style={styles.moreButton} onPress={() => openModal(appointment)}>
                    <MaterialIcons name="more-vert" size={24} color="#666" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="event-busy" size={64} color="#ccc" />
                <Text style={styles.emptyText}>Nenhuma consulta para esta data.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </Provider>
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
  addButton: {
    backgroundColor: "#1976d2",
    marginRight: 8,
  },
  addButtonText: {
    fontSize: 12,
    color: "white",
  },
  content: {
    flex: 1,
  },
  dateSelector: {
    padding: 16,
    backgroundColor: "#f9f9f9",
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
    marginBottom: 16,
    textAlign: 'center',
  },
  weekContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  dayColumn: {
    alignItems: "center",
  },
  dayText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  dateButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  selectedDateButton: {
    backgroundColor: "#1976d2",
  },
  dateText: {
    fontSize: 16,
    color: "#333",
  },
  selectedDateText: {
    color: "white",
    fontWeight: "bold",
  },
  appointmentsSection: {
    padding: 16,
  },
  appointmentsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  appointmentCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
  },
  timeColumn: {
    marginRight: 16,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  appointmentDetails: {
    flex: 1,
  },
  typeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  typeChip: {
    marginRight: 8,
  },
  onlineChip: {
    backgroundColor: "#e3f2fd",
  },
  presentialChip: {
    backgroundColor: "#f3e5f5",
  },
  chipText: {
    fontSize: 12,
  },
  modalityText: {
    fontSize: 12,
    color: "#666",
  },
  patientRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  patientName: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  moreButton: {
    padding: 4,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 16,
  },
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    margin: 20,
    borderRadius: 12,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalPatientName: {
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalDetails: {
    fontSize: 16,
    marginBottom: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

