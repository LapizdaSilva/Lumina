import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Button, Text } from 'react-native-paper';
import { supabase } from '.././supaconfig';

export default function HomeScreen() {
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || 'Usuário');
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert('Erro ao Sair', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo {userEmail}!</Text>
      <Text style={styles.subtitle}>Tela inicial</Text>
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.button}
      >
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
    color: '#333',
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 30,
    textAlign: 'center',
    color: '#555',
  },
  button: {
    marginTop: 20,
  },
});
