import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export default function QueriesScreen({ }): any {
    const [loading, setLoading] = useState('');


    return (
        <View style={styles.container}>
            <Text style={styles.title}> Tela de Consultas </Text>
        </View>
    );
};

const styles = StyleSheet.create ({
    container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
    },
    title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5d1061ff',
    justifyContent: 'center'
    },

});