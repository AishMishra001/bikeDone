import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, ActivityIndicator, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
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
        <Ionicons name="wallet-outline" size={64} color="#FF6D00" />
        <Text style={styles.inactiveTitle}>Wallet Not Activated</Text>
        <Text style={styles.inactiveSub}>Please activate your wallet from the Home screen to view balance and add money.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.headerTitle}>Partner Wallet</Text>
      
      <View style={styles.leatherWalletCard}>
        <View style={styles.walletCutoutNotch} />
        <View style={styles.walletContentInner}>
          <Text style={styles.leatherBalanceValue}>₹ {currentBalance.toFixed(2)}</Text>
          <Text style={styles.leatherBalanceLabel}>WALLET BALANCE</Text>
          <View style={styles.activePaaSBadge}>
            <Ionicons name="checkmark-circle" size={14} color="#00E676" />
            <Text style={styles.activePaaSBadgeText}>Active PaaS Account</Text>
          </View>
        </View>
      </View>

      {topupSuccessMsg && (
        <View style={styles.topupSuccessBanner}>
          <Ionicons name="checkmark-done-circle" size={24} color="#00E676" />
          <Text style={styles.topupSuccessText}>{topupSuccessMsg}</Text>
        </View>
      )}

      <Text style={styles.addMoneyMethodHeading}>ADD MONEY TO YOUR WALLET USING</Text>
      <View style={styles.paymentLogosRow}>
        <View style={styles.logoBadge}><Text style={styles.logoTextUPI}>UPI</Text></View>
        <View style={styles.logoBadge}><Text style={styles.logoTextRuPay}>RuPay</Text></View>
        <View style={styles.logoBadge}><Text style={styles.logoTextVisa}>VISA</Text></View>
        <View style={styles.logoBadge}><Text style={styles.logoTextMaster}>MasterCard</Text></View>
      </View>

      {showAddMoney ? (
        <View style={styles.addMoneySection}>
          <Text style={styles.inputLabelText}>Select or Enter Top-Up Amount (₹)</Text>
          
          <View style={styles.presetPillsRow}>
            {["100", "200", "500", "1000"].map((preset) => (
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
                  + ₹{preset}
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
              placeholder="Enter Amount"
              placeholderTextColor="#757575"
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
                <Text style={styles.razorpayPayBtnText}>Opening Razorpay Gateway...</Text>
              </View>
            ) : (
              <View style={styles.loadingRow}>
                <Ionicons name="card" size={20} color="#FFFFFF" />
                <Text style={styles.razorpayPayBtnText}>Pay ₹{topupAmount || "0"} via Razorpay</Text>
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
            style={styles.addMoneyPrimaryBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setShowAddMoney(true);
            }}
          >
            <Ionicons name="add-circle" size={22} color="#FFFFFF" />
            <Text style={styles.addMoneyPrimaryText}>Add money</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sendMoneyOutlineBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push("/history");
            }}
          >
            <Ionicons name="time-outline" size={20} color="#FFFFFF" />
            <Text style={styles.sendMoneyOutlineText}>History</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.effortlessFooterText}>🔒 100% Safe & Instant Wallet Topup powered by BikeDone PaaS</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1319" },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40, alignItems: "center" },
  centerContainer: { flex: 1, backgroundColor: "#0B1319", justifyContent: "center", alignItems: "center", padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: "bold", color: "#FFFFFF", marginBottom: 30, alignSelf: "flex-start" },
  inactiveTitle: { fontSize: 20, fontWeight: "bold", color: "#FFFFFF", marginTop: 16, marginBottom: 8 },
  inactiveSub: { fontSize: 14, color: "#90A4AE", textAlign: "center" },
  
  leatherWalletCard: {
    width: "100%", backgroundColor: "#1A2530", borderRadius: 20, padding: 24, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#2C3E50", shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8, marginBottom: 30, position: "relative", overflow: "hidden"
  },
  walletCutoutNotch: { position: "absolute", top: 0, width: 120, height: 18, backgroundColor: "#0B1319", borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  walletContentInner: { alignItems: "center", marginTop: 10 },
  leatherBalanceValue: { fontSize: 38, fontWeight: "900", color: "#FFFFFF", letterSpacing: 0.5, marginBottom: 4 },
  leatherBalanceLabel: { fontSize: 12, fontWeight: "800", color: "#78909C", letterSpacing: 2, marginBottom: 10 },
  activePaaSBadge: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.12)", paddingVertical: 4, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: "rgba(0, 230, 118, 0.3)" },
  activePaaSBadgeText: { fontSize: 11, fontWeight: "700", color: "#00E676", marginLeft: 6 },

  topupSuccessBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0, 230, 118, 0.15)", padding: 12, borderRadius: 14, width: "100%", marginBottom: 16, borderWidth: 1, borderColor: "#00E676" },
  topupSuccessText: { color: "#00E676", fontWeight: "700", fontSize: 13, marginLeft: 10 },

  addMoneyMethodHeading: { fontSize: 11, fontWeight: "800", color: "#90A4AE", letterSpacing: 1, marginBottom: 12, alignSelf: "flex-start" },
  paymentLogosRow: { flexDirection: "row", justifyContent: "flex-start", width: "100%", alignItems: "center", gap: 8, marginBottom: 30 },
  logoBadge: { backgroundColor: "#1E2C38", paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, borderWidth: 1, borderColor: "#2A3B4D" },
  logoTextUPI: { color: "#FF9100", fontWeight: "800", fontSize: 11 },
  logoTextRuPay: { color: "#00E676", fontWeight: "800", fontSize: 11 },
  logoTextVisa: { color: "#29B6F6", fontWeight: "800", fontSize: 11 },
  logoTextMaster: { color: "#FF5252", fontWeight: "800", fontSize: 11 },

  walletActionsRow: { flexDirection: "row", width: "100%", gap: 12, marginBottom: 16 },
  addMoneyPrimaryBtn: { flex: 1, height: 52, backgroundColor: "#FF6D00", borderRadius: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, elevation: 3 },
  addMoneyPrimaryText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  sendMoneyOutlineBtn: { flex: 1, height: 52, backgroundColor: "#1E2C38", borderRadius: 14, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#37474F" },
  sendMoneyOutlineText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  addMoneySection: { width: "100%", backgroundColor: "#1E2C38", borderRadius: 18, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "rgba(255, 109, 0, 0.4)" },
  inputLabelText: { fontSize: 12, fontWeight: "700", color: "#B0BEC5", marginBottom: 12 },
  presetPillsRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 14 },
  presetPill: { paddingVertical: 8, paddingHorizontal: 12, backgroundColor: "#121C24", borderRadius: 10, borderWidth: 1, borderColor: "#37474F" },
  presetPillActive: { backgroundColor: "rgba(255, 109, 0, 0.2)", borderColor: "#FF6D00" },
  presetPillText: { color: "#B0BEC5", fontWeight: "700", fontSize: 12 },
  presetPillTextActive: { color: "#FF6D00" },
  amountInputRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#121C24", borderRadius: 12, paddingHorizontal: 14, borderWidth: 1, borderColor: "#37474F", marginBottom: 16 },
  currencyPrefix: { fontSize: 22, fontWeight: "800", color: "#FF6D00", marginRight: 8 },
  amountInput: { flex: 1, height: 48, color: "#FFFFFF", fontSize: 20, fontWeight: "800" },
  razorpayPayBtn: { width: "100%", height: 50, backgroundColor: "#FF6D00", borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 8 },
  loadingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  razorpayPayBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  cancelTopupBtn: { alignItems: "center", paddingVertical: 8 },
  cancelTopupText: { color: "#90A4AE", fontSize: 13, fontWeight: "600" },
  effortlessFooterText: { fontSize: 11, color: "#78909C", textAlign: "center", marginTop: 16 },
});
