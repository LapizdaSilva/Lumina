import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, RadioButton } from 'react-native-paper';
import { supabase } from '../services/supaconfig';
import { KeyboardAvoidingView } from 'react-native';

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [cpf, setCpf] = useState('');
  const [dob, setDob] = useState(''); 
  const [userType, setUserType] = useState('patient'); 
  const [loading, setLoading] = useState(false);


    const toISODate = (dateString: string): string | null => {
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateString.match(regex);
      if (!match) return null;

      const day = match[1];
      const month = match[2];
      const year = match[3];

      return `${year}-${month}-${day}`; 
    };


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

    const isValidDate = (dateString: string): boolean => {
      const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
      const match = dateString.match(regex);
      if (!match) return false;

      const day = parseInt(match[1], 10);
      const month = parseInt(match[2], 10) - 1;
      const year = parseInt(match[3], 10);

      const date = new Date(Date.UTC(year, month, day));

      const isRealDate =
        date.getUTCFullYear() === year &&
        date.getUTCMonth() === month &&
        date.getUTCDate() === day;
      if (!isRealDate) return false;

      const today = new Date();
      const age = today.getUTCFullYear() - year;

      if (date > today) return false;

      if (year < 1900) return false;

      let actualAge = age;
      const hasHadBirthdayThisYear =
        today.getUTCMonth() > month ||
        (today.getUTCMonth() === month && today.getUTCDate() >= day);
      if (!hasHadBirthdayThisYear) actualAge--;

      if (actualAge < 14 ) return false;

      return true;
    };

    const handleRegister = async () => {
      setLoading(true);

      if (password.length < 6) {
        Alert.alert("Erro de Registro", "A senha deve ter no mínimo 6 caracteres.");
        setLoading(false);
        return;
      }

      if (!isValidCPF(cpf)) {
        Alert.alert("Erro de Registro", "CPF inválido.");
        setLoading(false);
        return;
      }

      if (!isValidDate(dob)) {
        Alert.alert("Erro de Registro", "Data de nascimento inválida.");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
          Alert.alert("Erro de Registro", error.message);
          setLoading(false);
          return;
        }

        const user = data.user;
        if (user) {
          const { error: profileError } = await supabase.from("profiles").insert([
            {
              id: user.id,
              full_name: name,
              cpf,
              dob: toISODate(dob),
              role: userType, 
            },
          ]);

          if (profileError) {
            Alert.alert("Erro ao criar perfil", profileError.message);
            setLoading(false);
            return;
          }
        }

        Alert.alert("Sucesso", "Verifique seu e-mail para confirmar o registro!");
        navigation.navigate("Login");
      } catch (err) {
        console.error(err);
        Alert.alert("Erro inesperado", "Tente novamente mais tarde.");
      } finally {
        setLoading(false);
      }
  };


  return (
    <View style={styles.container}>
      <KeyboardAvoidingView behavior="padding" style={styles.inputContainer}>
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
          secureTextEntry={true }
          style={styles.input}
          autoCapitalize='none'
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
      </KeyboardAvoidingView>
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
  inputContainer: {
    width: '100%',
    marginBottom: 20,
    justifyContent: 'center',
  },
});
