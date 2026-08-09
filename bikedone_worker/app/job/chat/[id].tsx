import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { socketService } from "../../../services/socketService";
import { tokenStorage, LoggedInMechanic } from "../../../services/api";
import { useBadge } from "../../../context/BadgeContext";

export default function ChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState("");
  const [mechanicId, setMechanicId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  const { clearUnread, setActiveChat } = useBadge();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    tokenStorage.getMechanic().then((m: any) => {
      const targetId = m?.id || m?.mechanicId || '4043b9cd-bb8d-495d-af42-6305d72133c6';
      setMechanicId(targetId);
    });
    
    if (id) {
      setActiveChat(id as string);
    }

    return () => {
      setActiveChat(null);
    };
  }, [id]);

  useEffect(() => {
    if (!id || !mechanicId) return;

    setLoading(true);
    socketService.fetchChatHistory(id as string).then((history) => {
      setMessages(history);
      setLoading(false);
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: false }), 100);
    });

    // Listen for real-time messages
    const unsubscribe = socketService.listenForMessages(id as string, (msg: any) => {
      setMessages(prev => {
        // Prevent duplicates
        if (prev.find(m => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    });

    return () => unsubscribe();
  }, [id, mechanicId]);

  const sendMessage = async () => {
    if (!inputText.trim() || !id || !mechanicId) return;
    
    const textToSend = inputText.trim();
    setInputText("");
    
    try {
      await socketService.sendMessage(id, mechanicId, textToSend);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMe = item.senderId === mechanicId;
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
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat with Customer</Text>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
           <ActivityIndicator size="small" color="#FF6D00" />
           <Text style={styles.warningText}>Connecting to Chat...</Text>
           <Text style={styles.smallNote}>(Requires valid Firebase Config)</Text>
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
          placeholderTextColor="#78909C"
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
  container: { flex: 1, backgroundColor: "#0B1319" },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: "#121C24",
    borderBottomWidth: 1, borderBottomColor: "#1E2C38"
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  
  chatContainer: { padding: 16, paddingBottom: 24 },
  
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#FF6D00",
    borderBottomRightRadius: 4,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#1E2C38",
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: "#2C3E50"
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: "#FFF" },
  theirMessageText: { color: "#FFF" },
  
  inputArea: {
    flexDirection: "row",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 32 : 16,
    backgroundColor: "#121C24",
    borderTopWidth: 1,
    borderTopColor: "#1E2C38",
    alignItems: "flex-end"
  },
  textInput: {
    flex: 1,
    backgroundColor: "#1A2530",
    color: "#FFF",
    minHeight: 48,
    maxHeight: 120,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#2C3E50"
  },
  sendBtn: {
    width: 48, height: 48,
    backgroundColor: "#FF6D00",
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 12,
    marginBottom: 0
  },
  warningText: { color: "#FF5252", marginTop: 12, fontWeight: "600" },
  smallNote: { color: "#78909C", fontSize: 12, marginTop: 4 }
});
