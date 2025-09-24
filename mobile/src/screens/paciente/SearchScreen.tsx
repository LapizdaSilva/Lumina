import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Appbar, Text, Avatar, Searchbar, Chip, Button } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

interface Psychologist {
  id: string;
  name: string;
  specialty: string;
  rating: number;
  reviewCount: number;
  avatar: string;
  paymentType: "Particular" | "Convênio";
  consultationPrice: number;
  availability: string[];
  isFavorite: boolean;
}

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const navigation = useNavigation();

  const psychologists: Psychologist[] = [
    {
      id: "1",
      name: "Fábio Almeida",
      specialty: "Psicólogo",
      rating: 5.0,
      reviewCount: 83,
      avatar: "https://randomuser.me/api/portraits/men/10.jpg",
      paymentType: "Particular",
      consultationPrice: 250.00,
      availability: ["11:00", "12:00"],
      isFavorite: false,
    },
    {
      id: "2",
      name: "Anna Borges",
      specialty: "Psicóloga",
      rating: 5.0,
      reviewCount: 73,
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      paymentType: "Particular",
      consultationPrice: 200.00,
      availability: ["8:00", "9:00", "11:00"],
      isFavorite: false,
    },
    {
      id: "3",
      name: "Juliana Dias",
      specialty: "Psicóloga",
      rating: 4.9,
      reviewCount: 66,
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      paymentType: "Particular",
      consultationPrice: 255.00,
      availability: [],
      isFavorite: false,
    },
    {
      id: "4",
      name: "Marcos Castro",
      specialty: "Psiquiatra",
      rating: 4.3,
      reviewCount: 23,
      avatar: "https://randomuser.me/api/portraits/lego/6.jpg",
      paymentType: "Particular",
      consultationPrice: 188.00,
      availability: ["10:00", "14:00", "16:00"],
      isFavorite: true,
    },
  ];

  const specialties = ["Todos", "Psicólogo", "Psiquiatra", "Terapeuta", "Neuropsicólogo"];

  const filteredPsychologists = psychologists.filter(psychologist => {
    const matchesSearch = psychologist.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSpecialty = !selectedSpecialty || selectedSpecialty === "Todos" || 
                            psychologist.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const toggleFavorite = (id: string) => {
    // falta tela favoritos
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
                  selectedSpecialty === specialty && styles.selectedChip
                ]}
                textStyle={
                  selectedSpecialty === specialty ? styles.selectedChipText : styles.chipText
                }
              >
                {specialty}
              </Chip>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ScrollView>
          {filteredPsychologists.map((psychologist) => (
            <TouchableOpacity key={psychologist.id} style={styles.psychologistCard}>
              <Avatar.Image 
                size={60} 
                source={{ uri: psychologist.avatar }} 
              />
              <View style={styles.psychologistInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.psychologistName}>{psychologist.name}</Text>
                  <TouchableOpacity onPress={() => toggleFavorite(psychologist.id)}>
                    <MaterialIcons 
                      name={psychologist.isFavorite ? "favorite" : "favorite-border"} 
                      size={24}
                      color={psychologist.isFavorite ? "#f44336" : "#666"} 
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
                    {psychologist.rating} | {psychologist.reviewCount} avaliações
                  </Text>
                </View>
                
                <View style={styles.paymentRow}>
                  <Text style={styles.paymentLabel}>Forma de pagamento:</Text>
                  <Text style={styles.paymentType}>{psychologist.paymentType}</Text>
                </View>
                
                <View style={styles.priceRow}>
                  <Text style={styles.priceLabel}>Consulta:</Text>
                  <Text style={styles.price}>R$ {psychologist.consultationPrice.toFixed(2)}</Text>
                </View>
                
                <Text style={styles.modalityText}>Online e Presencial</Text>
                
                <Text style={styles.dateText}>Terça 14 - Dezembro</Text>
                
                {psychologist.availability.length > 0 ? (
                  <View style={styles.availabilityRow}>
                    {psychologist.availability.map((time, index) => (
                      <Button
                        key={index}
                        mode="contained"
                        style={styles.timeButton}
                        labelStyle={styles.timeButtonText}
                      >
                        {time}
                      </Button>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.noAvailabilityText}>Sem horários disponíveis</Text>
                )}
              </View>
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
    fontSize: 18,
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
    marginBottom: 30,
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
  psychologistCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    marginTop: 2,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  psychologistInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  psychologistName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
  },
  specialty: {
    fontSize: 14,
    color: "#666",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  paymentRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  paymentLabel: {
    fontSize: 12,
    color: "#666",
  },
  paymentType: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginLeft: 4,
  },
  priceRow: {
    flexDirection: "row",
    marginBottom: 4,
  },
  priceLabel: {
    fontSize: 12,
    color: "#666",
  },
  price: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    marginLeft: 4,
  },
  modalityText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  dateText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  availabilityRow: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  timeButton: {
    backgroundColor: "#1976d2",
    marginRight: 8,
    marginBottom: 4,
  },
  timeButtonText: {
    fontSize: 12,
    color: "white",
  },
  noAvailabilityText: {
    fontSize: 12,
    color: "#f44336",
    fontStyle: "italic",
  },
});

