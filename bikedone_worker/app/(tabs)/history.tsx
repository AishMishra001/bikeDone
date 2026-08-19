import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Shadows } from "@/constants/theme";
import { walletService, WalletTransactionData } from "../../services/walletService";
import { tokenStorage } from "../../services/api";

type FilterType = "ALL" | "CREDIT" | "DEBIT";

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState<WalletTransactionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("ALL");

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

  const filteredTransactions = transactions.filter((t) => {
    if (filter === "ALL") return true;
    return t.transactionType === filter;
  });

  const totalCredits = transactions
    .filter((t) => t.transactionType === "CREDIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalDebits = transactions
    .filter((t) => t.transactionType === "DEBIT")
    .reduce((sum, t) => sum + t.amount, 0);

  const renderTransaction = ({ item }: { item: WalletTransactionData }) => {
    const isCredit = item.transactionType === "CREDIT";
    const date = new Date(item.createdAt).toLocaleString("en-IN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    return (
      <View style={[styles.transactionCard, Shadows.small]}>
        <View style={[styles.transactionIconBox, { backgroundColor: isCredit ? '#ECFDF5' : '#FEF2F2' }]}>
          <Ionicons
            name={isCredit ? "arrow-down" : "arrow-up"}
            size={20}
            color={isCredit ? "#10B981" : "#EF4444"}
          />
        </View>
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionPurpose}>{item.purpose || (isCredit ? 'Wallet Top-Up' : 'Platform Fee')}</Text>
          <Text style={styles.transactionDate}>{date}</Text>
          {item.description ? <Text style={styles.transactionDescription}>{item.description}</Text> : null}
        </View>
        <View style={styles.transactionAmountBox}>
          <Text style={[styles.transactionAmount, { color: isCredit ? "#059669" : "#DC2626" }]}>
            {isCredit ? "+" : "-"} ₹{item.amount.toFixed(2)}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: isCredit ? '#ECFDF5' : '#F3F4F6' }]}>
            <Text style={[styles.statusBadgeText, { color: isCredit ? '#065F46' : '#4B5563' }]}>
              {isCredit ? 'Credit' : 'Debit'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings & Passbook</Text>
        <Text style={styles.headerSubtitle}>Real-time logs of payouts & platform dispatches</Text>
      </View>

      {/* Summary Banner */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, Shadows.small]}>
          <Text style={styles.summaryLabel}>TOTAL CREDITS</Text>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>+ ₹{totalCredits.toFixed(2)}</Text>
        </View>
        <View style={[styles.summaryCard, Shadows.small]}>
          <Text style={styles.summaryLabel}>TOTAL DEBITS</Text>
          <Text style={[styles.summaryValue, { color: '#DC2626' }]}>- ₹{totalDebits.toFixed(2)}</Text>
        </View>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterRow}>
        {(["ALL", "CREDIT", "DEBIT"] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterChip, filter === f && styles.filterChipActive]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
              {f === "ALL" ? "All Logs" : f === "CREDIT" ? "Credits (+)" : "Debits (-)"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      {filteredTransactions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconBox}>
            <Ionicons name="receipt-outline" size={48} color={Colors.gray400} />
          </View>
          <Text style={styles.emptyTitle}>No Transactions Recorded</Text>
          <Text style={styles.emptyText}>Completed job earnings and top-up receipts will appear here.</Text>
        </View>
      ) : (
        <FlatList
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          renderItem={renderTransaction}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
    paddingTop: 54,
  },
  centerContainer: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.gray500,
    marginTop: 2,
  },
  summaryRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  summaryLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: Colors.gray500,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 16,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  filterChipActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.gray600,
  },
  filterChipTextActive: {
    color: Colors.primaryDark,
    fontWeight: '800',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  transactionCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  transactionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionPurpose: {
    fontSize: 15,
    fontWeight: "800",
    color: Colors.textDark,
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '500',
  },
  transactionDescription: {
    fontSize: 12,
    color: Colors.gray600,
    marginTop: 4,
  },
  transactionAmountBox: {
    alignItems: "flex-end",
    gap: 4,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "900",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.textDark,
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: Colors.gray500,
    textAlign: "center",
    lineHeight: 18,
  },
});
