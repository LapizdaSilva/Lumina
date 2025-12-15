import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function WelcomeScreen( { navigation}: any ) {
  return (
    <View style={styles.container}>
        <MaterialCommunityIcons name="alert-circle" size={70 } color="#0f6258ff" style={styles.iconcircle} />
        <MaterialCommunityIcons name="lightbulb" size={50} color="#6200ee" style={styles.iconbulb} />
        <Text style={styles.title}> Bem vindo ao Lumina! </Text>
        <Text style={styles.subtitle}> Seu app confiável de conexão entre psicólogos e pessoas surdas.</Text>
        <MaterialCommunityIcons name="weather-sunset" size={200} color="#6200ee" style={{ alignSelf: 'center', marginBottom: 20 }} />
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.text}>Go to Login</Text>
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
    title: {
        fontSize: 32,
        color: '#6200ee',
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    subtitle: {
        fontSize: 18,
        color: '#9b7fc3ff',
        textAlign: 'center',
        marginBottom: 50,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    text: {
        fontSize: 24,
        textAlign: 'center',
        marginBottom: 50,
    },
    iconbulb: {
        position: 'absolute',
        top: 169,
        alignSelf: 'center',
        marginBottom: 20 
    },
    iconcircle: {
        position: 'relative',
        alignSelf: 'center',
        marginBottom: 20 
    },
})