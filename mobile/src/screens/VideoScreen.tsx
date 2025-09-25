import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from "react-native";

export default function VideoCallScreen() {
  const [message, setMessage] = useState("");

  return (
    <View style={styles.container}>
      {/* Área de vídeo */}
      <View style={styles.videoArea}>
        {/* Participante principal */}
        <View style={styles.mainVideo}>
          <Text style={styles.videoText}>👤 Participante 1</Text>
        </View>

        {/* Miniatura do segundo participante */}
        <View style={styles.smallVideo}>
          <Text style={styles.videoText}>👤 Participante 2</Text>
        </View>
      </View>

      {/* Área de chat lateral */}
      <View style={styles.chatArea}>
        <Text style={styles.chatTitle}>Chat</Text>
        <ScrollView style={styles.chatMessages}>
          <View style={styles.messageBubbleLeft}>
            <Text style={styles.messageText}>Oi, tudo bem?</Text>
          </View>
          <View style={styles.messageBubbleRight}>
            <Text style={styles.messageText}>Tudo sim, e você?</Text>
          </View>
          <View style={styles.messageBubbleLeft}>
            <Text style={styles.messageText}>Pronto para começar a sessão!</Text>
          </View>
        </ScrollView>

        {/* Caixa de texto */}
        <View style={styles.inputArea}>
          <TextInput
            style={styles.input}
            placeholder="Digite uma mensagem..."
            value={message}
            onChangeText={setMessage}
          />
          <TouchableOpacity style={styles.sendButton}>
            <Text style={styles.sendText}>Enviar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row", // vídeo à esquerda, chat à direita
    backgroundColor: "#121212",
  },
  videoArea: {
    flex: 3,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    backgroundColor: "#000",
  },
  mainVideo: {
    width: "95%",
    height: "90%",
    backgroundColor: "#333",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
  },
  smallVideo: {
    width: 120,
    height: 160,
    backgroundColor: "#555",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  videoText: {
    color: "#fff",
  },
  chatArea: {
    flex: 1,
    backgroundColor: "#1e1e1e",
    padding: 10,
    borderLeftWidth: 1,
    borderLeftColor: "#333",
  },
  chatTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  chatMessages: {
    flex: 1,
  },
  messageBubbleLeft: {
    alignSelf: "flex-start",
    backgroundColor: "#2a2a2a",
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  messageBubbleRight: {
    alignSelf: "flex-end",
    backgroundColor: "#1976d2",
    padding: 8,
    marginVertical: 4,
    borderRadius: 8,
  },
  messageText: {
    color: "#fff",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },
  input: {
    flex: 1,
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  sendButton: {
    backgroundColor: "#1976d2",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 6,
    marginLeft: 6,
  },
  sendText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
