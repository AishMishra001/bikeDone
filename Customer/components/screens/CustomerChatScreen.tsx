import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { socketService } from "../../services/socketService";

const CUSTOMER_ID = "CUSTOMER_123";

interface Props {
  requestId: string;
  mechanicName?: string;
  onBack: () => void;
}

export default function CustomerChatScreen({ requestId, mechanicName = "Mechanic", onBack }: Props) {
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false); // Pusher doesn't fetch history easily, so no loading state needed
  
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (!requestId) return;
    
    const { storage } = require('../../services/tokenStorage');
    storage.set('ACTIVE_CHAT', requestId);

    setLoading(true);
    socketService.fetchChatHistory(requestId).then((history) => {
      setMessages(history);
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    });

    // Listen for real-time messages
    const unsubscribe = socketService.listenForMessages(requestId, (msg: any) => {
      setMessages(prev => {
        // Prevent duplicates if we already have it
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => {
      unsubscribe();
      storage.remove('ACTIVE_CHAT');
    };
  }, [requestId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !requestId) return;
    
    const textToSend = inputText.trim();
    setInputText("");
    
    try {
      await socketService.sendMessage(requestId, CUSTOMER_ID, textToSend);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === CUSTOMER_ID;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.text}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat with {mechanicName}</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
           <ActivityIndicator size="small" color="#f97316" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item, index) => item.id || index.toString()}
          renderItem={renderMessage}
          contentContainerStyle={styles.chatContainer}
        />
      )}

      <View style={styles.inputArea}>
        <TextInput
          style={styles.textInput}
          placeholder="Type a message..."
          placeholderTextColor="#94a3b8"
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1, borderBottomColor: "#e2e8f0"
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "700", color: "#0f172a" },
  
  chatContainer: { padding: 16, paddingBottom: 24 },
  
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#f97316",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#e2e8f0",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: "#FFF" },
  theirMessageText: { color: "#334155" },
  
  inputArea: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    alignItems: "flex-end"
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f1f5f9",
    color: "#0f172a",
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
  },
  sendBtn: {
    width: 48, height: 48,
    backgroundColor: "#f97316",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
  }
});
