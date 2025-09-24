import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Appbar, Text, Avatar, Button, Chip } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface Appointment {
  id: string;
  time: string;
  endTime: string;
  type: "Online" | "Presencial";
  modality: "Particular" | "Convênio";
  patientName: string;
  patientAvatar: string;
  status: "confirmed" | "pending";
}

export default function PsicoAgenda() {
  const [selectedDate, setSelectedDate] = useState(10);
  const [selectedMonth, setSelectedMonth] = useState("Oct, 2025");
  const navigation = useNavigation();

  const appointments: Appointment[] = [
    {
      id: "1",
      time: "09:00",
      endTime: "09:30",
      type: "Online",
      modality: "Particular",
      patientName: "Victor Araujo",
      patientAvatar: "https://randomuser.me/api/portraits/men/2.jpg",
      status: "confirmed",
    },
    {
      id: "2",
      time: "12:00",
      endTime: "12:30",
      type: "Presencial",
      modality: "Convênio",
      patientName: "Hugo Pontes",
      patientAvatar: "https://randomuser.me/api/portraits/men/4.jpg",
      status: "pending",
    },
    {
      id: "3",
      time: "14:00",
      endTime: "14:30",
      type: "Presencial",
      modality: "Convênio",
      patientName: "Natália Silva",
      patientAvatar: "https://randomuser.me/api/portraits/women/3.jpg",
      status: "pending",
    },
  ];

  const weekDays = ["T", "F", "S", "S", "M"];
  const dates = [10, 11, 12, 13, 14,];

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() =>  navigation.goBack()} />
        <Appbar.Content title="Agenda" titleStyle={styles.headerTitle} />
        <Button 
          mode="contained" 
          onPress={() => {}}
          style={styles.addButton}
          labelStyle={styles.addButtonText}
        >
          Adicionar consulta
        </Button>
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Seletor de Data */}
        <View style={styles.dateSelector}>
          <Text style={styles.monthText}>{selectedMonth}</Text>
          
          <View style={styles.weekContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.dayColumn}>
                <Text style={styles.dayText}>{day}</Text>
                <TouchableOpacity
                  style={[
                    styles.dateButton,
                    dates[index] === selectedDate && styles.selectedDateButton
                  ]}
                  onPress={() => setSelectedDate(dates[index])}
                >
                  <Text style={[
                    styles.dateText,
                    dates[index] === selectedDate && styles.selectedDateText
                  ]}>
                    {dates[index]}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Lista de Consultas */}
        <View style={styles.appointmentsSection}>
          <View style={styles.appointmentsHeader}>
            <Text style={styles.sectionTitle}>Consultas agendadas</Text>
            <MaterialIcons name="sort" size={24} color="#666" />
          </View>

          {appointments.map((appointment) => (
            <View key={appointment.id} style={styles.appointmentCard}>
              <View style={styles.timeColumn}>
                <Text style={styles.timeText}>{appointment.time}</Text>
                <Text style={styles.endTimeText}>{appointment.endTime}</Text>
              </View>

              <View style={styles.appointmentDetails}>
                <View style={styles.typeRow}>
                  <Chip 
                    style={[
                      styles.typeChip,
                      appointment.type === "Online" ? styles.onlineChip : styles.presentialChip
                    ]}
                    textStyle={styles.chipText}
                  >
                    {appointment.type}
                  </Chip>
                  <Text style={styles.modalityText}>{appointment.modality}</Text>
                </View>

                <View style={styles.patientRow}>
                  <Avatar.Image 
                    size={32} 
                    source={{ uri: appointment.patientAvatar }} 
                  />
                  <Text style={styles.patientName}>{appointment.patientName}</Text>
                  {appointment.status === "confirmed" && (
                    <MaterialIcons name="check-circle" size={20} color="#4caf50" />
                  )}
                </View>
              </View>

              <TouchableOpacity style={styles.moreButton}>
                <MaterialIcons name="more-vert" size={24} color="#666" />
              </TouchableOpacity>
            </View>
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
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  endTimeText: {
    fontSize: 12,
    color: "#666",
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
});

