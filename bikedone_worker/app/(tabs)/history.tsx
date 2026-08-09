import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { walletService, WalletTransactionData } from "../../services/walletService";
import { tokenStorage } from "../../services/api";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<WalletTransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTransactions = async () => {
    try {
      const mechanic = await tokenStorage.getMechanic();
      const mechanicId = mechanic?.id;
      if (mechanicId) {
        const data = await walletService.getTransactions(mechanicId);
        setTransactions(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTransactions();
  };

  const renderTransaction = ({ item }: { item: WalletTransactionData }) => {
    const isCredit = item.transactionType === "CREDIT";
    const date = new Date(item.createdAt).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={styles.transactionCard}>
        <View style={styles.transactionIconBox}>
          <Ionicons
            name={isCredit ? "arrow-down-circle" : "arrow-up-circle"}
            size={28}
            color={isCredit ? "#00E676" : "#FF5252"}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionPurpose}>{item.purpose}</Text>
          <Text style={styles.transactionDate}>{date}</Text>
          {item.description ? <Text style={styles.transactionDescription}>{item.description}</Text> : null}
        </View>
        <View style={styles.transactionAmountBox}>
          <Text style={[styles.transactionAmount, { color: isCredit ? "#00E676" : "#FF5252" }]}>
            {isCredit ? "+" : "-"} ₹{item.amount.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Wallet History</Text>
      
      {transactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="receipt-outline" size={64} color="#37474F" />
          <Text style={styles.emptyText}>No transactions yet</Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FF6D00" />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1319",
    paddingTop: 60,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0B1319",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: "#121C24",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1E2C38",
  },
  transactionIconBox: {
    marginRight: 16,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionPurpose: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: "#78909C",
  },
  transactionDescription: {
    fontSize: 12,
    color: "#B0BEC5",
    marginTop: 4,
  },
  transactionAmountBox: {
    alignItems: "flex-end",
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#78909C",
    marginTop: 16,
  },
});
