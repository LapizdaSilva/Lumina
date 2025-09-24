import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Appbar } from "react-native-paper";

export default function QueriesScreen({ }): any {
    return (
    <View style={styles.container}>
        <Appbar.Header style={styles.header}>
            <Appbar.Action icon="arrow-left" color="black" onPress={() => {} } />
            <Appbar.Content title="Queries" titleStyle={{ fontWeight: 'bold'}}/>
        </Appbar.Header>
    </View>
    );
};

const styles = StyleSheet.create ({
    container: {
    flex: 1,
    backgroundColor: '#fff',
    },
    header: {
        backgroundColor: '#f5f5f5',
    },
    title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#5d1061ff',
    justifyContent: 'center'
    },

});