import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { socketService } from "../../../services/socketService";
import { tokenStorage, LoggedInMechanic } from "../../../services/api";
import { useBadge } from "../../../context/BadgeContext";
import { Colors } from "@/constants/theme";

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
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Customer Direct Chat</Text>
          <Text style={styles.headerSubtitle}>Order #{id.substring(0, 8).toUpperCase()}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
           <ActivityIndicator size="small" color={Colors.primary} />
           <Text style={styles.warningText}>Connecting to Real-time Chat...</Text>
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
          placeholder="Type a message to customer..."
          placeholderTextColor={Colors.gray400}
          value={inputText}
          onChangeText={setInputText}
          multiline
        />
        <TouchableOpacity 
          style={[styles.sendBtn, !inputText.trim() && { opacity: 0.5 }]} 
          onPress={sendMessage}
          disabled={!inputText.trim()}
        >
          <Ionicons name="send" size={18} color="#FFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBackground },
  centerContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backBtn: {
    marginRight: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: "900", color: Colors.textDark },
  headerSubtitle: { fontSize: 12, color: Colors.gray500, marginTop: 1 },
  
  chatContainer: { padding: 16, paddingBottom: 24 },
  
  messageBubble: {
    maxWidth: "80%",
    padding: 14,
    borderRadius: 18,
    marginBottom: 12,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: Colors.primary,
    borderBottomRightRadius: 4,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  theirBubble: {
    alignSelf: "flex-start",
    backgroundColor: Colors.cardBackground,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  messageText: { fontSize: 15, lineHeight: 20 },
  myMessageText: { color: "#FFF", fontWeight: '600' },
  theirMessageText: { color: Colors.textDark, fontWeight: '500' },
  
  inputArea: {
    flexDirection: "row",
    padding: 14,
    paddingBottom: Platform.OS === "ios" ? 32 : 14,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.gray200,
    alignItems: "flex-end",
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
    color: Colors.textDark,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  sendBtn: {
    width: 46,
    height: 46,
    backgroundColor: Colors.primary,
    borderRadius: 23,
    justifyContent: "center",
    alignItems: "center",
  },
  warningText: { color: Colors.gray600, marginTop: 12, fontWeight: "600" },
});
