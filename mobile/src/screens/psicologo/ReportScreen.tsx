import { View, Text, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";

export default function ReportScreen({navigation}: any) {

    return (
        <View style={styles.container}>
            <Appbar.Header style={styles.header}>
                <Appbar.BackAction onPress={() => navigation.goBack()} />
                <Appbar.Content title="Relatórios" titleStyle={styles.headerTitle}/>
            </Appbar.Header>
            
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
    },
    headerTitle: {
        fontWeight: "bold",
        fontSize: 20,
    },
    header: {
        backgroundColor: "#f5f5f5",
        elevation: 0,
    },
})