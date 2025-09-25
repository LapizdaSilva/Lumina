import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Avatar, Searchbar, Chip, Button, ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../../supaconfig";
import { LuminaAPI, PsychologistSearch } from "../../services/api";

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [psychologists, setPsychologists] = useState<PsychologistSearch[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>("");

  const navigation = useNavigation();

  const specialties = ["Todos", "Psicólogo Clínico", "Psicóloga", "Psiquiatra", "Terapeuta", "Neuropsicólogo"];

  useEffect(() => {
    initializeScreen();
  }, []);

  useEffect(() => {
    if (userId) {
      searchPsychologists();
    }
  }, [searchQuery, selectedSpecialty, userId]);

  const initializeScreen = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
    }
  };

  const searchPsychologists = async () => {
    try {
      setLoading(true);
      const specialtyFilter = selectedSpecialty === "Todos" || !selectedSpecialty ? undefined : selectedSpecialty;
      const data = await LuminaAPI.searchPsychologists(searchQuery, specialtyFilter, userId);
      setPsychologists(data);
    } catch (error) {
      console.error("Erro ao buscar psicólogos:", error);
      Alert.alert("Erro", "Não foi possível carregar os psicólogos");
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = async (psychologistId: string) => {
    try {
      const isFavorite = await LuminaAPI.toggleFavorite(userId, psychologistId);

      setPsychologists((prev) =>
        prev.map((psych) =>
          psych.id === psychologistId
            ? { ...psych, is_favorite: isFavorite }
            : psych
        )
      );
    } catch (error) {
      console.error("Erro ao alterar favorito:", error);
      Alert.alert("Erro", "Não foi possível alterar o favorito");
    }
  };

  const handleScheduleAppointment = async (psychologistId: string, time: string) => {
    try {
      Alert.alert(
        "Agendar Consulta",
        `Deseja agendar uma consulta para ${time}?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Confirmar",
            onPress: async () => {
              try {
                const today = new Date();
                const appointmentDate = today.toISOString().split("T")[0];

                await LuminaAPI.createAppointment(
                  userId,
                  psychologistId,
                  appointmentDate,
                  time,
                  "online",
                  "particular",
                  "Consulta agendada via busca"
                );

                Alert.alert("Sucesso", "Consulta agendada com sucesso!");
              } catch (error) {
                console.error("Erro ao agendar consulta:", error);
                Alert.alert("Erro", "Não foi possível agendar a consulta");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Erro no agendamento:", error);
    }
  };

  const getAvailableTimes = () => {
    return ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
  };

  const formatPaymentTypes = (paymentTypes: string[]) => {
    return paymentTypes
      .map((type) => (type === "particular" ? "Particular" : "Convênio"))
      .join(", ");
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Busca por psicólogos" titleStyle={styles.headerTitle} />
      </Appbar.Header>

      <View style={styles.content}>
        <Searchbar
          placeholder="Encontre pela especialidade desejada"
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
        >
          {specialties.map((specialty) => (
            <TouchableOpacity
              key={specialty}
              onPress={() => setSelectedSpecialty(specialty)}
            >
              <Chip
                selected={selectedSpecialty === specialty}
                style={[
                  styles.filterChip,
                  selectedSpecialty === specialty && styles.selectedChip,
                ]}
                textStyle={
                  selectedSpecialty === specialty
                    ? styles.selectedChipText
                    : styles.chipText
                }
              >
                {specialty}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#1976d2" />
            <Text style={styles.loadingText}>Buscando psicólogos...</Text>
          </View>
        ) : (
          <ScrollView>
            {psychologists.length > 0 ? (
              psychologists.map((psychologist) => (
                <TouchableOpacity key={psychologist.id} style={styles.psychologistCard}>
                  <Avatar.Image
                    size={50}
                    source={{
                      uri: psychologist.avatar_url || "https://randomuser.me/api/portraits/men/1.jpg",
                    }}
                  />
                  <View style={styles.psychologistInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.psychologistName}>{psychologist.name}</Text>
                      <TouchableOpacity onPress={() => toggleFavorite(psychologist.id)}>
                        <MaterialIcons
                          name={psychologist.is_favorite ? "favorite" : "favorite-border"}
                          size={22}
                          color={psychologist.is_favorite ? "#f44336" : "#666"}
                        />
                      </TouchableOpacity>
                    </View>

                    <Text style={styles.specialty}>{psychologist.specialty}</Text>

                    <View style={styles.ratingRow}>
                      {[...Array(5)].map((_, index) => (
                        <MaterialIcons
                          key={index}
                          name="star"
                          size={16}
                          color={index < Math.floor(psychologist.rating) ? "#ffc107" : "#e0e0e0"}
                        />
                      ))}
                      <Text style={styles.ratingText}>
                        {psychologist.rating} | {psychologist.review_count} avaliações
                      </Text>
                    </View>

                    <Text style={styles.paymentText}>
                      Forma de pagamento: {formatPaymentTypes(psychologist.payment_types)}
                    </Text>

                    <Text style={styles.priceText}>
                      Consulta: R$ {psychologist.consultation_price?.toFixed(2) || "0,00"}
                    </Text>

                    <Text style={styles.modalityText}>
                      {psychologist.session_types
                        .map((type) => (type === "online" ? "Online" : "Presencial"))
                        .join(" e ")}
                    </Text>

                    <Text style={styles.dateText}>Horários Disponíveis</Text>

                    <View style={styles.availabilityRow}>
                      {getAvailableTimes().slice(0, 3).map((time, index) => (
                        <Button
                          key={index}
                          mode="contained"
                          style={styles.timeButton}
                          labelStyle={styles.timeButtonText}
                          onPress={() => handleScheduleAppointment(psychologist.id, time)}
                        >
                          {time}
                        </Button>
                      ))}
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="search-off" size={64} color="#ccc" />
                <Text style={styles.emptyText}>
                  {searchQuery || selectedSpecialty
                    ? "Nenhum psicólogo encontrado com os filtros aplicados"
                    : "Nenhum psicólogo disponível no momento"}
                </Text>
              </View>
            )}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#f5f5f5", elevation: 0 },
  headerTitle: { fontWeight: "bold", fontSize: 20 },
  content: { flex: 1, padding: 16 },
  searchBar: { marginBottom: 16, elevation: 2 },
  filtersContainer: { marginBottom: 25 },
  filterChip: { marginRight: 8, backgroundColor: "#f5f5f5" },
  selectedChip: { backgroundColor: "#1976d2" },
  chipText: { color: "#666" },
  selectedChipText: { color: "white" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 },
  loadingText: { marginTop: 16, fontSize: 16, color: "#666" },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center", paddingTop: 50 },
  emptyText: { fontSize: 16, color: "#666", textAlign: "center", marginTop: 16, paddingHorizontal: 32 },
  psychologistCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  psychologistInfo: { flex: 1, marginLeft: 12 },
  nameRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 2 },
  psychologistName: { fontSize: 16, fontWeight: "bold", color: "#333" },
  specialty: { fontSize: 14, color: "#666", marginBottom: 4 },
  ratingRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  ratingText: { fontSize: 12, color: "#666", marginLeft: 4 },
  paymentText: { fontSize: 12, color: "#666", marginBottom: 2 },
  priceText: { fontSize: 12, color: "#666", marginBottom: 2 },
  modalityText: { fontSize: 12, color: "#666", marginBottom: 6 },
  dateText: { fontSize: 14, fontWeight: "bold", color: "#333", marginBottom: 6 },
  availabilityRow: { flexDirection: "row", flexWrap: "wrap" },
  timeButton: { backgroundColor: "#1976d2", marginRight: 8, marginBottom: 4, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  timeButtonText: { fontSize: 12, color: "white" },
});
