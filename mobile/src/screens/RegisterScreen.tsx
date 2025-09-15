import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton } from 'react-native-paper';
import { supabase } from '.././supaconfig';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [dob, setDob] = useState(''); 
  const [userType, setUserType] = useState('patient'); 
  const [loading, setLoading] = useState(false);


    const formatDate = (value: string) => {
    let date = value.replace(/\D/g, '');

    date = date.substring(0, 8);

    if (date.length > 4) {
        date = date.replace(/(\d{2})(\d{2})(\d{0,4})/, '$1/$2/$3');
    } else if (date.length > 2) {
        date = date.replace(/(\d{2})(\d{0,2})/, '$1/$2');
    }   

    return date;
    };

    const formatCPF = (value: string) => {
    let cpf = value.replace(/\D/g, '');

    cpf = cpf.substring(0, 11);

    if (cpf.length > 6) {
        cpf = cpf.replace(/(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3');
    } else if (cpf.length > 3) {
        cpf = cpf.replace(/(\d{3})(\d{0,3})/, '$1.$2');
    }

    if (cpf.length > 9) {
        cpf = cpf.replace(/(\d{3})\.(\d{3})\.(\d{3})(\d{0,2})/, '$1.$2.$3-$4');
    }

    return cpf;
    };

    const isValidCPF = (cpf: string) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;

        let sum = 0;
        let remainder;

        for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    };

    const isValidDate = (dateString: string) => {
        const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
        const match = dateString.match(regex);
        if (!match) return false;

        const day = parseInt(match[1], 10);
        const month = parseInt(match[2], 10) - 1; 
        const year = parseInt(match[3], 10);

        const date = new Date(year, month, day);
        return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
    };

    const handleRegister = async () => {
    setLoading(true);

    if (password.length < 6) {
        Alert.alert('Erro de Registro', 'A senha deve ter no mínimo 6 caracteres.');
        setLoading(false);
        return;
    }

    if (!isValidCPF(cpf)) {
        Alert.alert('Erro de Registro', 'CPF inválido.');
        setLoading(false);
        return;
    }

    if (!isValidDate(dob)) {
        Alert.alert('Erro de Registro', 'Data de nascimento inválida.');
        setLoading(false);
        return;
    }

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
        data: { name, cpf, dob, user_type: userType },
        },
    });

    if (error) {
        Alert.alert('Erro de Registro', error.message);
    } else {
        Alert.alert('Sucesso', 'Verifique seu e-mail para confirmar o registro!');
        navigation.navigate('Login');
    }
    setLoading(false);
    };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Conta</Text>
      <TextInput
        label="Nome Completo"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        autoCapitalize="words"
      />

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="outlined"
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      <TextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        label="Confirme sua Senha"
        value={password}
        onChangeText={setPassword}
        mode="outlined"
        secureTextEntry
        style={styles.input}
      />

      <TextInput
        label="CPF"
        value={cpf}
        onChangeText={text => setCpf(formatCPF(text))}
        mode="outlined"
        style={styles.input}
        keyboardType="numeric"
      />

      <TextInput
        label="Data de Nascimento (DD/MM/AAAA)"
        value={dob}
        onChangeText={text => setDob(formatDate(text))} 
        mode="outlined"
        style={styles.input}    
        keyboardType="numeric"
        placeholder="DD/MM/AAAA"
      />

      <View style={styles.radioGroup}>
        <Text style={styles.radioLabel}>Você é:</Text>
        <RadioButton.Group onValueChange={setUserType} value={userType}>
          <View style={styles.radioItem}>
            <RadioButton value="patient" />
            <Text>Paciente</Text>
          </View>
          <View style={styles.radioItem}>
            <RadioButton value="psychologist" />
            <Text>Psicólogo</Text>
          </View>
        </RadioButton.Group>
      </View>

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={loading}
        disabled={loading}
        style={styles.button}
      >
        Registrar
      </Button>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={styles.button}
      >
        Já tem uma conta? Faça login
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    marginBottom: 15,
  },
  radioGroup: {
    flexDirection: 'column',
    marginBottom: 15,
  },
  radioLabel: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  radioItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  button: {
    marginTop: 10,
  },
});
