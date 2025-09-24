import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Appbar, Text, Avatar, Searchbar, Chip } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface Patient {
  id: string;
  name: string;
  avatar: string;
  lastSession: string;
  nextSession?: string;
  status: "active" | "inactive";
  sessionType: "Online" | "Presencial";
}

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  
  const navigation = useNavigation();

  const patients: Patient[] = [
    {
      id: "1",
      name: "Victor Araujo",
      avatar: "https://randomuser.me/api/portraits/men/2.jpg",
      lastSession: "15/12/2021",
      nextSession: "22/12/2021",
      status: "active",
      sessionType: "Online",
    },
    {
      id: "2",
      name: "Jaqueline Santos",
      avatar: "https://randomuser.me/api/portraits/women/1.jpg",
      lastSession: "20/12/2021",
      nextSession: "23/12/2021",
      status: "active",
      sessionType: "Online",
    },
    {
      id: "3",
      name: "Natália Silva",
      avatar: "https://randomuser.me/api/portraits/women/3.jpg",
      lastSession: "18/12/2021",
      nextSession: "21/12/2021",
      status: "active",
      sessionType: "Presencial",
    },
    {
      id: "4",
      name: "Hugo Pontes",
      avatar: "https://randomuser.me/api/portraits/men/4.jpg",
      lastSession: "10/12/2021",
      status: "inactive",
      sessionType: "Presencial",
    },
  ];

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         (selectedFilter === "active" && patient.status === "active") ||
                         (selectedFilter === "inactive" && patient.status === "inactive");
    return matchesSearch && matchesFilter;
  });

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Meus Pacientes" titleStyle={styles.headerTitle} />
        <Appbar.Action icon="plus" onPress={() => {}} />
      </Appbar.Header>

      <View style={styles.content}>
        {/* Barra de Pesquisa */}
        <Searchbar
          placeholder="Buscar paciente..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        {/* Filtros */}
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
              Todos
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter("active")}>
            <Chip 
              selected={selectedFilter === "active"}
              style={[styles.filterChip, selectedFilter === "active" && styles.selectedChip]}
              textStyle={selectedFilter === "active" ? styles.selectedChipText : styles.chipText}
            >
              Ativos
            </Chip>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={() => setSelectedFilter("inactive")}>
            <Chip 
              selected={selectedFilter === "inactive"}
              style={[styles.filterChip, selectedFilter === "inactive" && styles.selectedChip]}
              textStyle={selectedFilter === "inactive" ? styles.selectedChipText : styles.chipText}
            >
              Inativos
            </Chip>
          </TouchableOpacity>
        </ScrollView>

        {/* Lista de Pacientes */}
        <ScrollView>
          {filteredPatients.map((patient) => (
            <TouchableOpacity key={patient.id} style={styles.patientCard}>
              <Avatar.Image 
                size={50} 
                source={{ uri: patient.avatar }} 
              />
              
              <View style={styles.patientInfo}>
                <View style={styles.patientHeader}>
                  <Text style={styles.patientName}>{patient.name}</Text>
                  <View style={[
                    styles.statusIndicator,
                    patient.status === "active" ? styles.activeStatus : styles.inactiveStatus
                  ]} />
                </View>
                
                <Text style={styles.lastSessionText}>
                  Última sessão: {patient.lastSession}
                </Text>
                
                {patient.nextSession && (
                  <View style={styles.nextSessionRow}>
                    <MaterialIcons name="schedule" size={16} color="#1976d2" />
                    <Text style={styles.nextSessionText}>
                      Próxima: {patient.nextSession}
                    </Text>
                    <Chip 
                      style={[
                        styles.sessionTypeChip,
                        patient.sessionType === "Online" ? styles.onlineChip : styles.presentialChip
                      ]}
                      textStyle={styles.sessionTypeText}
                    >
                      {patient.sessionType}
                    </Chip>
                  </View>
                )}
              </View>

              <TouchableOpacity style={styles.moreButton}>
                <MaterialIcons name="more-vert" size={24} color="#666" />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
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
    flex: 1,
    padding: 16,
  },
  searchBar: {
    marginBottom: 16,
    elevation: 2,
  },
  filtersContainer: {
    marginBottom: 0,
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
  patientCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  patientInfo: {
    flex: 1,
    marginLeft: 12,
  },
  patientHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
  },
  activeStatus: {
    backgroundColor: "#4caf50",
  },
  inactiveStatus: {
    backgroundColor: "#f44336",
  },
  lastSessionText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 4,
  },
  nextSessionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nextSessionText: {
    fontSize: 12,
    color: "#1976d2",
    marginLeft: 4,
    flex: 1,
  },
  sessionTypeChip: {
    marginLeft: 8,
  },
  onlineChip: {
    backgroundColor: "#e3f2fd",
  },
  presentialChip: {
    backgroundColor: "#f3e5f5",
  },
  sessionTypeText: {
    fontSize: 10,
  },
  moreButton: {
    padding: 4,
  },
});

