import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Avatar, Searchbar, ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { supabase } from "../../supaconfig";
import { LuminaAPI, PsychologistRecommendation } from "../../services/api";

export default function HomeScreen({ navigation }: any) {
  const [name, setName] = useState<string>("");
  const [userId, setUserId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendations, setRecommendations] = useState<PsychologistRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfileAndRecommendations = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          setUserId(user.id);
          
          const { data, error } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", user.id)
            .single();

          if (!error && data) {
            setName(data.full_name);
          }

          // Carregar recomendações de psicólogos
          const recommendationsData = await LuminaAPI.getPsychologistRecommendations(user.id);
          setRecommendations(recommendationsData);
        }
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        Alert.alert('Erro', 'Não foi possível carregar as recomendações');
      } finally {
        setLoading(false);
      }
    };

    getProfileAndRecommendations();
  }, []);

  const toggleFavorite = async (psychologistId: string) => {
    try {
      const isFavorite = await LuminaAPI.toggleFavorite(userId, psychologistId);
      
      // Atualizar o estado local
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === psychologistId 
            ? { ...rec, is_favorite: isFavorite }
            : rec
        )
      );
    } catch (error) {
      console.error('Erro ao alterar favorito:', error);
      Alert.alert('Erro', 'Não foi possível alterar o favorito');
    }
  };

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
          <Text style={styles.nameText}>{name || "Usuário"}</Text>
        </View>
        <Avatar.Image 
          size={40} 
          source={{ uri: "https://randomuser.me/api/portraits/men/2.jpg" }} 
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Seção de Busca */}
        <View style={styles.searchSection}>
          <Text style={styles.searchTitle}>Em busca de um profissional?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("Search")}>
            <Searchbar
              placeholder="Encontre pela especialidade desejada"
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchBar}
              editable={false}
            />
          </TouchableOpacity>
        </View>

        {/* Recomendações */}
        <View style={styles.recommendationsSection}>
          <Text style={styles.sectionTitle}>Recomendações</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#1976d2" />
              <Text style={styles.loadingText}>Carregando recomendações...</Text>
            </View>
          ) : recommendations.length > 0 ? (
            recommendations.map((recommendation) => (
              <TouchableOpacity key={recommendation.id} style={styles.recommendationCard}>
                <Avatar.Image 
                  size={60} 
                  source={{ 
                    uri: recommendation.avatar_url || "https://randomuser.me/api/portraits/men/1.jpg" 
                  }} 
                />
                <View style={styles.recommendationInfo}>
                  <View style={styles.nameRow}>
                    <Text style={styles.recommendationName}>{recommendation.name}</Text>
                    <TouchableOpacity onPress={() => toggleFavorite(recommendation.id)}>
                      <MaterialIcons 
                        name={recommendation.is_favorite ? "favorite" : "favorite-border"} 
                        size={24} 
                        color={recommendation.is_favorite ? "#f44336" : "#666"} 
                      />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.specialty}>{recommendation.specialty}</Text>
                  
                  <View style={styles.ratingRow}>
                    {[...Array(5)].map((_, index) => (
                      <MaterialIcons 
                        key={index}
                        name="star" 
                        size={16} 
                        color={index < Math.floor(recommendation.rating) ? "#ffc107" : "#e0e0e0"} 
                      />
                    ))}
                    <Text style={styles.ratingText}>
                      {recommendation.rating} | {recommendation.review_count} avaliações
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>Nenhuma recomendação disponível</Text>
            </View>
          )}
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
  searchSection: {
    marginBottom: 24,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  searchBar: {
    elevation: 2,
  },
  recommendationsSection: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  recommendationCard: {
    flexDirection: "row",
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: "flex-start",
  },
  recommendationInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  recommendationName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
  },
  specialty: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
});

