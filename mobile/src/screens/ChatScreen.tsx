import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import { Appbar } from "react-native-paper";
import ChatItem from "../components/chatItem";

const chats = [
  {
    id: "1",
    name: "David Wayne",
    message: "Thanks a bunch! Have a great day! 😊",
    time: "10:25",
    unread: 5,
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  },
  {
    id: "2",
    name: "Edward Davidson",
    message: "Great, thanks so much! 👋",
    time: "22:20",
    date: "09/05",
    unread: 12,
    avatar: "https://randomuser.me/api/portraits/men/42.jpg",
  },
  {
    id: "3",
    name: "Angela Kelly",
    message: "Appreciate it! See you soon! 🚀",
    time: "10:45",
    date: "08/05",
    unread: 1,
    avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  },
];

export default function ChatListScreen() {
  return (
    <View style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.Content title="Chat" titleStyle={{ fontWeight: "bold" }} />
        <Appbar.Action icon="magnify" onPress={() => {}} />
        <Appbar.Action icon="plus" onPress={() => {}} />
      </Appbar.Header>

      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatItem {...item} />}
        contentContainerStyle={{ paddingHorizontal: 10 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { backgroundColor: "#785fb9ff" },
});
