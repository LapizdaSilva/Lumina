import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Appbar, Text, Avatar, Button, TextInput, ActivityIndicator } from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../services/supaconfig";
import { LuminaAPI } from "../services/api";

interface UserProfile {
  id: string;
  full_name: string;
  cpf: string;
  dob: string;
  role: string;
  avatar_url: string | null;
}

interface PsychologistData {
  specialty: string;
  bio: string | null;
  consultation_price: number | null;
  payment_types: string[];
  session_types: string[];
  rating: number;
  review_count: number;
}

export default function ProfileScreen() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [psychologistData, setPsychologistData] = useState<PsychologistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [editedPsychologistData, setEditedPsychologistData] = useState<Partial<PsychologistData>>({});
  
  const navigation = useNavigation();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const profileData = await LuminaAPI.getUserProfile(user.id);
        setProfile(profileData);
        setEditedProfile(profileData);

        // Se for psicólogo, carregar dados específicos
        if (profileData.role === 'psychologist') {
          try {
            const psychData = await LuminaAPI.getPsychologistData(user.id);
            setPsychologistData(psychData);
            setEditedPsychologistData(psychData);
          } catch (error) {
            // Se não existir dados do psicólogo, criar estrutura vazia
            const emptyPsychData = {
              specialty: '',
              bio: '',
              consultation_price: 0,
              payment_types: ['particular'],
              session_types: ['online'],
              rating: 0,
              review_count: 0
            };
            setPsychologistData(emptyPsychData);
            setEditedPsychologistData(emptyPsychData);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      Alert.alert('Erro', 'Não foi possível carregar o perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!profile) return;

      // Atualizar perfil básico
      await LuminaAPI.updateUserProfile(profile.id, editedProfile);

      // Se for psicólogo, atualizar dados específicos
      if (profile.role === 'psychologist' && editedPsychologistData) {
        await LuminaAPI.updatePsychologistData(profile.id, editedPsychologistData);
      }

      setProfile({ ...profile, ...editedProfile });
      if (psychologistData) {
        setPsychologistData({ ...psychologistData, ...editedPsychologistData });
      }
      
      setEditing(false);
      Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      Alert.alert('Erro', 'Não foi possível salvar as alterações');
    }
  };

  const handleCancel = () => {
    setEditedProfile(profile || {});
    setEditedPsychologistData(psychologistData || {});
    setEditing(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1976d2" />
        <Text style={styles.loadingText}>Carregando perfil...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erro ao carregar perfil</Text>
        <Button mode="contained" onPress={loadProfile}>
          Tentar novamente
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Meu Perfil" titleStyle={styles.headerTitle} />
        <Appbar.Action 
          icon={editing ? "close" : "pencil"} 
          onPress={editing ? handleCancel : () => setEditing(true)} 
        />
      </Appbar.Header>

      <ScrollView style={styles.content}>
        {/* Avatar e Nome */}
        <View style={styles.avatarSection}>
          <Avatar.Image 
            size={100} 
            source={{ 
              uri: profile.avatar_url || "https://randomuser.me/api/portraits/men/1.jpg" 
            }} 
          />
          {editing ? (
            <TextInput
              value={editedProfile.full_name || ''}
              onChangeText={(text) => setEditedProfile({ ...editedProfile, full_name: text })}
              style={styles.nameInput}
              mode="outlined"
              label="Nome completo"
            />
          ) : (
            <Text style={styles.userName}>{profile.full_name}</Text>
          )}
          <Text style={styles.userRole}>
            {profile.role === 'psychologist' ? 'Psicólogo(a)' : 'Paciente'}
          </Text>
        </View>

        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Básicas</Text>
          
          <View style={styles.infoRow}>
            <MaterialIcons name="badge" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>CPF</Text>
              <Text style={styles.infoValue}>{formatCPF(profile.cpf)}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="cake" size={20} color="#666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Data de Nascimento</Text>
              <Text style={styles.infoValue}>{formatDate(profile.dob)}</Text>
            </View>
          </View>
        </View>

        {/* Informações do Psicólogo */}
        {profile.role === 'psychologist' && psychologistData && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Informações Profissionais</Text>
            
            <View style={styles.infoRow}>
              <MaterialIcons name="work" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Especialidade</Text>
                {editing ? (
                  <TextInput
                    value={editedPsychologistData.specialty || ''}
                    onChangeText={(text) => setEditedPsychologistData({ ...editedPsychologistData, specialty: text })}
                    style={styles.editInput}
                    mode="outlined"
                    dense
                  />
                ) : (
                  <Text style={styles.infoValue}>{psychologistData.specialty || 'Não informado'}</Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="attach-money" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Valor da Consulta</Text>
                {editing ? (
                  <TextInput
                    value={editedPsychologistData.consultation_price?.toString() || ''}
                    onChangeText={(text) => setEditedPsychologistData({ 
                      ...editedPsychologistData, 
                      consultation_price: parseFloat(text) || 0 
                    })}
                    style={styles.editInput}
                    mode="outlined"
                    dense
                    keyboardType="numeric"
                  />
                ) : (
                  <Text style={styles.infoValue}>
                    R$ {psychologistData.consultation_price?.toFixed(2) || '0,00'}
                  </Text>
                )}
              </View>
            </View>

            <View style={styles.infoRow}>
              <MaterialIcons name="star" size={20} color="#666" />
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Avaliação</Text>
                <Text style={styles.infoValue}>
                  {psychologistData.rating.toFixed(1)} ⭐ ({psychologistData.review_count} avaliações)
                </Text>
              </View>
            </View>

            {editing && (
              <View style={styles.bioSection}>
                <Text style={styles.infoLabel}>Biografia</Text>
                <TextInput
                  value={editedPsychologistData.bio || ''}
                  onChangeText={(text) => setEditedPsychologistData({ ...editedPsychologistData, bio: text })}
                  style={styles.bioInput}
                  mode="outlined"
                  multiline
                  numberOfLines={4}
                  placeholder="Conte um pouco sobre sua experiência e abordagem..."
                />
              </View>
            )}

            {!editing && psychologistData.bio && (
              <View style={styles.bioSection}>
                <Text style={styles.infoLabel}>Biografia</Text>
                <Text style={styles.bioText}>{psychologistData.bio}</Text>
              </View>
            )}
          </View>
        )}

        {/* Botões de Ação */}
        {editing && (
          <View style={styles.actionButtons}>
            <Button 
              mode="outlined" 
              onPress={handleCancel}
              style={styles.cancelButton}
            >
              Cancelar
            </Button>
            <Button 
              mode="contained" 
              onPress={handleSave}
              style={styles.saveButton}
            >
              Salvar
            </Button>
          </View>
        )}
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
  content: {
    flex: 1,
    padding: 16,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: "#f44336",
    marginBottom: 16,
    textAlign: "center",
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    textAlign: "center",
  },
  nameInput: {
    marginTop: 16,
    width: "100%",
  },
  userRole: {
    fontSize: 16,
    color: "#1976d2",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  editInput: {
    marginTop: 4,
  },
  bioSection: {
    marginTop: 16,
  },
  bioInput: {
    marginTop: 8,
  },
  bioText: {
    fontSize: 14,
    color: "#333",
    lineHeight: 20,
    marginTop: 8,
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 24,
    marginBottom: 32,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  saveButton: {
    flex: 1,
    marginLeft: 8,
  },
});

