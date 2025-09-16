import React from "react";
import { View, StyleSheet } from "react-native";
import { Avatar, Text, Badge } from "react-native-paper";

interface ChatItemProps {
  name: string;
  message: string;
  time: string;
  date?: string;
  unread?: number;
  avatar: string;
}

export default function ChatItem({ name, message, time, date, unread, avatar }: ChatItemProps) {
  return (
    <View style={styles.container}>
      <Avatar.Image size={50} source={{ uri: avatar }} />
      <View style={styles.textContainer}>
        <Text style={styles.name}>{name}</Text>
        <Text numberOfLines={1} style={styles.message}>{message}</Text>
      </View>
      <View style={styles.rightContainer}>
        <Text style={styles.time}>{date ? `${time} ${date}` : time}</Text>
        {unread ? (
          <Badge style={styles.badge}>{unread}</Badge>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
  textContainer: {
    flex: 1,
    marginLeft: 10,
  },
  name: {
    fontWeight: "bold",
    fontSize: 16,
  },
  message: {
    color: "#666",
    fontSize: 14,
  },
  rightContainer: {
    alignItems: "flex-end",
  },
  time: {
    fontSize: 12,
    color: "#999",
  },
  badge: {
    marginTop: 5,
    backgroundColor: "#2196F3",
  },
});
