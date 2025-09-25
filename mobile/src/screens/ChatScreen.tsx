import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  StyleSheet, 
  FlatList, 
  KeyboardAvoidingView, 
  Platform, 
  Alert,
  TouchableOpacity 
} from "react-native";
import { 
  Appbar, 
  Text, 
  TextInput, 
  IconButton, 
  Avatar, 
  ActivityIndicator,
  Button 
} from "react-native-paper";
import { MaterialIcons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { supabase } from "../supaconfig";
import { LuminaAPI, Message } from "../services/api";

interface ChatScreenParams {
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const flatListRef = useRef<FlatList>(null);
  
  const navigation = useNavigation();
  const route = useRoute();
  const { otherUserId, otherUserName, otherUserAvatar } = route.params as ChatScreenParams;

  useEffect(() => {
    const initializeChat = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          await loadMessages(user.id);
          await LuminaAPI.markMessagesAsRead(user.id, otherUserId);
        }
      } catch (error) {
        console.error("Erro ao inicializar chat:", error);
      }
    };
    initializeChat();
  }, []);

  const loadMessages = async (currentUserId: string) => {
    try {
      setLoading(true);
      const chatMessages = await LuminaAPI.getConversationMessages(currentUserId, otherUserId);
      setMessages(chatMessages.reverse());
    } catch (error) {
      console.error("Erro ao carregar mensagens:", error);
      Alert.alert("Erro", "Não foi possível carregar as mensagens.");
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;

    try {
      setSending(true);
      await LuminaAPI.sendMessage(userId, otherUserId, newMessage.trim());
      
      const tempMessage: Message = {
        id: Date.now().toString(),
        sender_id: userId,
        content: newMessage.trim(),
        created_at: new Date().toISOString(),
        is_read: false,
      };
      
      setMessages(prev => [...prev, tempMessage]);
      setNewMessage("");
      
      // Scroll para o final
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
      
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      Alert.alert("Erro", "Não foi possível enviar a mensagem.");
    } finally {
      setSending(false);
    }
  };

  const handleVideoCall = () => {
    Alert.alert(
      "Chamada de Vídeo",
      `Iniciando chamada de vídeo com ${otherUserName}...`,
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Conectar", 
          onPress: () => {
            Alert.alert("Conectando...", "Funcionalidade de vídeo chamada será implementada em breve!");
          }
        }
      ]
    );
  };

  const formatMessageTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.sender_id === userId;
    
    return (
      <View style={[
        styles.messageContainer,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isMyMessage ? styles.myMessageBubble : styles.otherMessageBubble
        ]}>
          <Text style={[
            styles.messageText,
            isMyMessage ? styles.myMessageText : styles.otherMessageText
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.messageTime,
            isMyMessage ? styles.myMessageTime : styles.otherMessageTime
          ]}>
            {formatMessageTime(item.created_at)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Avatar.Image 
          size={40} 
          source={{ uri: otherUserAvatar || "https://randomuser.me/api/portraits/men/1.jpg" }} 
          style={styles.headerAvatar}
        />
        <Appbar.Content 
          title={otherUserName} 
          titleStyle={styles.headerTitle}
          subtitle="Online"
          subtitleStyle={styles.headerSubtitle}
        />
        <TouchableOpacity style={styles.videoCallButton} onPress={handleVideoCall}>
          <MaterialIcons name="videocam" size={24} color="#1976d2" />
        </TouchableOpacity>
        <Appbar.Action icon="phone" onPress={() => Alert.alert("Chamada", "Funcionalidade de chamada de voz a ser implementada.")} />
      </Appbar.Header>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#1976d2" />
          <Text style={styles.loadingText}>Carregando mensagens...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderMessage}
          contentContainerStyle={styles.messagesContainer}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Digite sua mensagem..."
          multiline
          mode="outlined"
          dense
          right={
            <TextInput.Icon 
              icon="send" 
              onPress={sendMessage}
              disabled={!newMessage.trim() || sending}
              color={newMessage.trim() && !sending ? "#1976d2" : "#ccc"}
            />
          }
        />
      </View>

      {/* Botão de Chamada de Vídeo Flutuante */}
      <TouchableOpacity style={styles.floatingVideoButton} onPress={handleVideoCall}>
        <MaterialIcons name="videocam" size={28} color="white" />
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerAvatar: {
    marginLeft: 8,
  },
  headerTitle: {
    fontWeight: "bold",
    fontSize: 18,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#4CAF50",
  },
  videoCallButton: {
    padding: 8,
    marginRight: 8,
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
  messagesContainer: {
    padding: 16,
    paddingBottom: 100, // Espaço para o botão flutuante
  },
  messageContainer: {
    marginVertical: 4,
  },
  myMessageContainer: {
    alignItems: "flex-end",
  },
  otherMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
  },
  myMessageBubble: {
    backgroundColor: "#1976d2",
    borderBottomRightRadius: 4,
  },
  otherMessageBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    elevation: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  myMessageText: {
    color: "white",
  },
  otherMessageText: {
    color: "#333",
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
  },
  myMessageTime: {
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "right",
  },
  otherMessageTime: {
    color: "#666",
  },
  inputContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  textInput: {
    backgroundColor: "#f9f9f9",
  },
  floatingVideoButton: {
    position: "absolute",
    bottom: 100,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#1976d2",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
});

