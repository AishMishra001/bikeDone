import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Colors, Shadows } from '@/constants/theme';
import { walletService, WalletData } from "../../services/walletService";
import { tokenStorage } from "../../services/api";

export default function WalletScreen() {
  const router = useRouter();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);

  // Top-up state
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>("500");
  const [selectedMethod, setSelectedMethod] = useState<string>("RAZORPAY_UPI");
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [topupSuccessMsg, setTopupSuccessMsg] = useState<string | null>(null);
  const [mechanicId, setMechanicId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const mechanic = await tokenStorage.getMechanic();
        const id = mechanic?.id ?? null;
        setMechanicId(id);
        if (id) {
          const data = await walletService.getMyWallet(id);
          setWallet(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, []);

  const handleRazorpayTopup = async () => {
    if (!mechanicId) return;

    const amt = parseFloat(topupAmount);
    if (isNaN(amt) || amt < 1) {
      Alert.alert("Invalid Amount", "Please enter an amount of at least ₹1.00");
      return;
    }

    setIsProcessingRazorpay(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Simulate Razorpay Gateway delay
    setTimeout(async () => {
      const updated = await walletService.topupWallet(mechanicId, amt, selectedMethod);
      setIsProcessingRazorpay(false);

      if (updated) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setTopupSuccessMsg(`₹${amt.toFixed(2)} added via Razorpay successfully!`);
        setWallet(updated);
        setTimeout(() => {
          setTopupSuccessMsg(null);
          setShowAddMoney(false);
        }, 2000);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert("Payment Failed", "Could not complete wallet top-up. Please try again.");
      }
    }, 1500);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6D00" />
      </View>
    );
  }

  const currentBalance = wallet?.balance ?? 0;
  const isWalletActive = Boolean(wallet?.isActive || (wallet as any)?.active);

  if (!isWalletActive) {
    return (
      <View style={styles.centerContainer}>
        <View style={styles.inactiveIconCircle}>
          <Ionicons name="wallet-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.inactiveTitle}>Wallet Not Activated</Text>
        <Text style={styles.inactiveSub}>
          Activate your BikeDone Partner Wallet to receive real-time customer repair requests and instant payouts.
        </Text>
        <TouchableOpacity
          style={styles.activateBtn}
          onPress={() => router.push('/(tabs)')}
        >
          <Text style={styles.activateBtnText}>Go to Dashboard to Activate</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.headerTitle}>Partner Wallet</Text>
          <Text style={styles.headerSubtitle}>Manage earnings, dispatches & instant top-ups</Text>
        </View>
        <TouchableOpacity
          style={styles.historyIconBtn}
          onPress={() => router.push("/(tabs)/history")}
        >
          <Ionicons name="time-outline" size={20} color={Colors.textDark} />
        </TouchableOpacity>
      </View>
      
      {/* Modern Partner Wallet Card */}
      <View style={[styles.modernWalletCard, Shadows.medium]}>
        <View style={styles.walletCardHeader}>
          <View style={styles.brandRow}>
            <View style={styles.brandCircle}>
              <Ionicons name="bicycle" size={16} color="#FFFFFF" />
            </View>
            <Text style={styles.walletBrandText}>BIKEDONE PARTNER</Text>
          </View>
          <View style={styles.activePaaSBadge}>
            <Ionicons name="checkmark-circle" size={12} color="#10B981" />
            <Text style={styles.activePaaSBadgeText}>Active PaaS Account</Text>
          </View>
        </View>

        <View style={styles.walletContentInner}>
          <Text style={styles.leatherBalanceLabel}>AVAILABLE WALLET BALANCE</Text>
          <Text style={styles.leatherBalanceValue}>₹ {currentBalance.toFixed(2)}</Text>
          <Text style={styles.balanceSubtext}>Auto-deducted per dispatch completion • No hidden fee</Text>
        </View>
      </View>

      {topupSuccessMsg && (
        <View style={styles.topupSuccessBanner}>
          <Ionicons name="checkmark-circle" size={22} color="#10B981" />
          <Text style={styles.topupSuccessText}>{topupSuccessMsg}</Text>
        </View>
      )}

      {/* Accepted Payment Modes */}
      <Text style={styles.addMoneyMethodHeading}>SUPPORTED PAYMENT METHODS</Text>
      <View style={styles.paymentLogosRow}>
        <View style={styles.logoBadge}><Text style={styles.logoTextUPI}>UPI / GPay</Text></View>
        <View style={styles.logoBadge}><Text style={styles.logoTextRuPay}>Paytm</Text></View>
        <View style={styles.logoBadge}><Text style={styles.logoTextVisa}>Debit / Cards</Text></View>
        <View style={styles.logoBadge}><Text style={styles.logoTextMaster}>NetBanking</Text></View>
      </View>

      {showAddMoney ? (
        <View style={[styles.addMoneySection, Shadows.small]}>
          <Text style={styles.inputLabelText}>Select Top-Up Amount</Text>
          
          <View style={styles.presetPillsRow}>
            {["200", "500", "1000", "2000"].map((preset) => (
              <TouchableOpacity
                key={preset}
                style={[
                  styles.presetPill,
                  topupAmount === preset && styles.presetPillActive,
                ]}
                onPress={() => setTopupAmount(preset)}
              >
                <Text
                  style={[
                    styles.presetPillText,
                    topupAmount === preset && styles.presetPillTextActive,
                  ]}
                >
                  ₹{preset}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.amountInputRow}>
            <Text style={styles.currencyPrefix}>₹</Text>
            <TextInput
              style={styles.amountInput}
              keyboardType="numeric"
              value={topupAmount}
              onChangeText={setTopupAmount}
              placeholder="Enter Custom Amount"
              placeholderTextColor={Colors.gray400}
            />
          </View>

          <TouchableOpacity
            style={[styles.razorpayPayBtn, isProcessingRazorpay && { opacity: 0.7 }]}
            onPress={handleRazorpayTopup}
            disabled={isProcessingRazorpay}
          >
            {isProcessingRazorpay ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.razorpayPayBtnText}>Opening Secure Gateway...</Text>
              </View>
            ) : (
              <View style={styles.loadingRow}>
                <Ionicons name="lock-closed" size={16} color="#FFFFFF" />
                <Text style={styles.razorpayPayBtnText}>Pay ₹{topupAmount || "0"} Securely</Text>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelTopupBtn} onPress={() => setShowAddMoney(false)}>
            <Text style={styles.cancelTopupText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.walletActionsRow}>
          <TouchableOpacity
            style={[styles.addMoneyPrimaryBtn, Shadows.small]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAddMoney(true);
            }}
          >
            <Ionicons name="add-circle" size={20} color="#FFFFFF" />
            <Text style={styles.addMoneyPrimaryText}>Add Money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendMoneyOutlineBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/(tabs)/history");
            }}
          >
            <Ionicons name="receipt-outline" size={18} color={Colors.textDark} />
            <Text style={styles.sendMoneyOutlineText}>Passbook</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.effortlessFooterText}>🔒 100% Safe & Instant Wallet Top-up powered by BikeDone</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBackground },
  content: { padding: 20, paddingTop: 54, paddingBottom: 40 },
  centerContainer: { flex: 1, backgroundColor: Colors.lightBackground, justifyContent: "center", alignItems: "center", padding: 24 },
  inactiveIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  inactiveTitle: { fontSize: 20, fontWeight: "800", color: Colors.textDark, marginBottom: 8 },
  inactiveSub: { fontSize: 13, color: Colors.gray600, textAlign: "center", lineHeight: 20, marginBottom: 24 },
  activateBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
  },
  activateBtnText: { color: '#FFF', fontWeight: '800', fontSize: 14 },
  
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: "900", color: Colors.textDark, letterSpacing: -0.3 },
  headerSubtitle: { fontSize: 12, color: Colors.gray500, marginTop: 2 },
  historyIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.gray200,
  },

  modernWalletCard: {
    width: "100%",
    backgroundColor: '#111827',
    borderRadius: 20,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  walletCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  walletBrandText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  activePaaSBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
    gap: 4,
  },
  activePaaSBadgeText: { fontSize: 11, fontWeight: "700", color: "#34D399" },
  walletContentInner: {
    marginTop: 4,
  },
  leatherBalanceLabel: { fontSize: 11, fontWeight: "800", color: '#FDBA74', letterSpacing: 1, marginBottom: 4 },
  leatherBalanceValue: { fontSize: 34, fontWeight: "900", color: "#FFFFFF", letterSpacing: -0.5, marginBottom: 6 },
  balanceSubtext: { fontSize: 11, color: '#9CA3AF' },

  topupSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 14,
    width: "100%",
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#A7F3D0",
    gap: 10,
  },
  topupSuccessText: { color: "#065F46", fontWeight: "700", fontSize: 13, flex: 1 },

  addMoneyMethodHeading: { fontSize: 11, fontWeight: "800", color: Colors.gray500, letterSpacing: 0.8, marginBottom: 10 },
  paymentLogosRow: { flexDirection: "row", width: "100%", alignItems: "center", gap: 8, marginBottom: 24 },
  logoBadge: { backgroundColor: Colors.cardBackground, paddingVertical: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: Colors.gray200 },
  logoTextUPI: { color: Colors.primary, fontWeight: "800", fontSize: 11 },
  logoTextRuPay: { color: "#2563EB", fontWeight: "800", fontSize: 11 },
  logoTextVisa: { color: "#059669", fontWeight: "800", fontSize: 11 },
  logoTextMaster: { color: "#DC2626", fontWeight: "800", fontSize: 11 },

  walletActionsRow: { flexDirection: "row", width: "100%", gap: 12, marginBottom: 16 },
  addMoneyPrimaryBtn: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  addMoneyPrimaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  sendMoneyOutlineBtn: {
    flex: 1,
    height: 50,
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1.5,
    borderColor: Colors.gray200,
  },
  sendMoneyOutlineText: { color: Colors.textDark, fontSize: 15, fontWeight: "700" },

  addMoneySection: {
    width: "100%",
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.3)',
  },
  inputLabelText: { fontSize: 13, fontWeight: "700", color: Colors.textDark, marginBottom: 12 },
  presetPillsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  presetPill: { paddingVertical: 10, paddingHorizontal: 14, backgroundColor: Colors.lightBackground, borderRadius: 12, borderWidth: 1, borderColor: Colors.gray200 },
  presetPillActive: { backgroundColor: Colors.primaryLight, borderColor: Colors.primary },
  presetPillText: { color: Colors.textDark, fontWeight: "700", fontSize: 13 },
  presetPillTextActive: { color: Colors.primaryDark, fontWeight: '800' },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.lightBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 16,
  },
  currencyPrefix: { fontSize: 22, fontWeight: "800", color: Colors.primary, marginRight: 8 },
  amountInput: { flex: 1, height: 48, color: Colors.textDark, fontSize: 20, fontWeight: "800" },
  razorpayPayBtn: { width: "100%", height: 50, backgroundColor: Colors.primary, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  razorpayPayBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cancelTopupBtn: { alignItems: "center", paddingVertical: 8 },
  cancelTopupText: { color: Colors.gray500, fontSize: 13, fontWeight: "600" },
  effortlessFooterText: { fontSize: 11, color: Colors.gray500, textAlign: "center", marginTop: 20 },
});
