import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { walletService, WalletData } from "../services/walletService";
import { Colors } from "../constants/theme";

interface WalletActivationModalProps {
  visible: boolean;
  mechanicId: string;
  wallet: WalletData | null;
  onSuccess: (wallet: WalletData) => void;
  onDismiss: () => void;
}

export const WalletActivationModal: React.FC<WalletActivationModalProps> = ({
  visible,
  mechanicId,
  wallet,
  onSuccess,
  onDismiss,
}) => {
  const router = useRouter();
  const isWalletActive = Boolean(wallet?.isActive || (wallet as any)?.active);

  // Activation state
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("123456");
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState<WalletData | null>(null);

  // Top-up state
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [topupAmount, setTopupAmount] = useState<string>("500");
  const [selectedMethod, setSelectedMethod] = useState<string>("RAZORPAY_UPI");
  const [isProcessingRazorpay, setIsProcessingRazorpay] = useState(false);
  const [topupSuccessMsg, setTopupSuccessMsg] = useState<string | null>(null);

  if (!visible) return null;

  // Handler for OTP sending
  const handleSendOtp = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await walletService.sendActivationOtp(mechanicId);
    setLoading(false);
    setOtpSent(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  // Handler for OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      Alert.alert("Invalid OTP", "Please enter valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    const updatedWallet = await walletService.activateWallet(mechanicId, otp);
    setLoading(false);

    if (updatedWallet && (updatedWallet.isActive || (updatedWallet as any).active)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSuccessData(updatedWallet);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("Activation Failed", "Invalid OTP or network error. Please try again.");
    }
  };

  // Handler for Razorpay Topup Simulation
  const handleRazorpayTopup = async () => {
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
        onSuccess(updated);
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

  // --- RENDER 1: ACTIVATED WALLET SCREEN (Inspired by user image /tmp/pasted-image-441.png) ---
  if (isWalletActive && !successData) {
    const currentBalance = wallet?.balance ?? 200;

    return (
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
        <View style={styles.overlay}>
          <View style={styles.activatedCardContainer}>
            {/* Header Close */}
            <View style={styles.activeHeaderRow}>
              <Text style={styles.activeHeaderTagline}>BIKEDONE PARTNER WALLET</Text>
              <TouchableOpacity style={styles.closeCircleBtn} onPress={onDismiss}>
                <Ionicons name="close" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollBody}>
              {/* Wallet Skin Leather Card (Matching /tmp/pasted-image-441.png) */}
              <View style={styles.leatherWalletCard}>
                <View style={styles.walletCutoutNotch} />
                <View style={styles.walletContentInner}>
                  <Text style={styles.leatherBalanceValue}>₹ {currentBalance}</Text>
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

              {/* Payment Method Badges (UPI, RuPay, VISA, MasterCard) */}
              <Text style={styles.addMoneyMethodHeading}>ADD MONEY TO YOUR WALLET USING</Text>
              <View style={styles.paymentLogosRow}>
                <View style={styles.logoBadge}><Text style={styles.logoTextUPI}>UPI</Text></View>
                <View style={styles.logoBadge}><Text style={styles.logoTextRuPay}>RuPay</Text></View>
                <View style={styles.logoBadge}><Text style={styles.logoTextVisa}>VISA</Text></View>
                <View style={styles.logoBadge}><Text style={styles.logoTextMaster}>MasterCard</Text></View>
              </View>

              {/* Toggle Add Money View */}
              {showAddMoney ? (
                <View style={styles.addMoneySection}>
                  <Text style={styles.inputLabelText}>Select or Enter Top-Up Amount (₹)</Text>

                  {/* Preset Pills */}
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

                  {/* Custom Amount Input */}
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

                  {/* Payment Gateway Action Button */}
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
                /* Primary Action Row: Add Money & Send Money / History */
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
                      onDismiss(); // close the modal first
                      setTimeout(() => router.push("/history"), 100);
                    }}
                  >
                    <Ionicons name="time-outline" size={20} color="#FFFFFF" />
                    <Text style={styles.sendMoneyOutlineText}>History</Text>
                  </TouchableOpacity>
                </View>
              )}

              <Text style={styles.effortlessFooterText}>🔒 100% Safe & Instant Wallet Topup powered by BikeDone PaaS</Text>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  }

  // --- RENDER 2: HURRAY ACTIVATED SUCCESS CELEBRATION ---
  if (successData) {
    const finalBalance = successData.balance ?? 200;
    return (
      <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
        <View style={styles.overlay}>
          <View style={styles.celebrationCard}>
            <View style={styles.confettiIconBox}>
              <Ionicons name="gift-sharp" size={48} color="#FF6D00" />
            </View>

            <Text style={styles.hurrayTitle}>Hurray! Wallet Activated! 🎉</Text>
            <Text style={styles.hurraySubtitle}>
              Your BikeDone PaaS Wallet is now active & ready for receiving live bike repair requests!
            </Text>

            <View style={styles.bonusBox}>
              <Text style={styles.bonusBadgeLabel}>WELCOME BONUS CREDITED</Text>
              <Text style={styles.bonusAmountText}>+ ₹ 200.00</Text>
              <Text style={styles.bonusSubtext}>Credited to your balance instantly</Text>
            </View>

            <View style={styles.totalBalanceRow}>
              <Text style={styles.totalBalanceLabel}>TOTAL WALLET BALANCE</Text>
              <Text style={styles.totalBalanceValue}>₹ {finalBalance}</Text>
            </View>

            <TouchableOpacity
              style={styles.goOnDutyBtn}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onSuccess(successData);
                onDismiss();
              }}
            >
              <Text style={styles.goOnDutyBtnText}>GREAT! GO ON DUTY 🚀</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  }

  // --- RENDER 3: INITIAL ACTIVATION OTP FLOW ---
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <TouchableOpacity style={styles.closeBtn} onPress={onDismiss}>
            <Ionicons name="close" size={22} color="#9E9E9E" />
          </TouchableOpacity>

          <View style={styles.iconCircle}>
            <Ionicons name="wallet" size={40} color="#FF6D00" />
          </View>

          <Text style={styles.title}>Activate BikeDone Wallet</Text>
          <Text style={styles.subtitle}>
            You must activate your wallet before going <Text style={styles.highlightText}>ON DUTY</Text> to receive live bike repair requests.
          </Text>

          <View style={styles.joiningBonusCard}>
            <View style={styles.bonusIconRow}>
              <Ionicons name="gift" size={24} color="#FF6D00" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.joiningBonusTitle}>🎁 Free ₹200 Joining Bonus</Text>
                <Text style={styles.joiningBonusSub}>
                  Activate now & get instant ₹200 welcome cash bonus credited to your wallet balance!
                </Text>
              </View>
            </View>
          </View>

          {!otpSent ? (
            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.btnDisabled]}
              onPress={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <View style={styles.btnContent}>
                  <Ionicons name="send" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                  <Text style={styles.primaryBtnText}>Send Activation OTP</Text>
                </View>
              )}
            </TouchableOpacity>
          ) : (
            <View style={styles.otpSection}>
              <Text style={styles.otpLabel}>Enter 6-Digit OTP sent to your phone</Text>
              <TextInput
                style={styles.otpInput}
                keyboardType="number-pad"
                maxLength={6}
                value={otp}
                onChangeText={setOtp}
                placeholder="123456"
                placeholderTextColor="#757575"
              />

              <TouchableOpacity
                style={[styles.primaryBtn, loading && styles.btnDisabled]}
                onPress={handleVerifyOtp}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryBtnText}>Verify OTP & Activate Wallet</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

          <Text style={styles.footerNote}>
            🔒 BikeDone Platform Fee model applies per service request.
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#121C24",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 109, 0, 0.3)",
  },
  closeBtn: {
    position: "absolute",
    right: 20,
    top: 20,
    padding: 4,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "rgba(255, 109, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 109, 0, 0.4)",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#B0BEC5",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  highlightText: {
    color: "#FF6D00",
    fontWeight: "700",
  },
  joiningBonusCard: {
    width: "100%",
    backgroundColor: "rgba(255, 109, 0, 0.08)",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 109, 0, 0.4)",
    marginBottom: 24,
  },
  bonusIconRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  joiningBonusTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF6D00",
    marginBottom: 2,
  },
  joiningBonusSub: {
    fontSize: 12,
    color: "#CFD8DC",
    lineHeight: 16,
  },
  primaryBtn: {
    width: "100%",
    height: 52,
    backgroundColor: "#FF6D00",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
  otpSection: {
    width: "100%",
    alignItems: "center",
  },
  otpLabel: {
    fontSize: 13,
    color: "#B0BEC5",
    marginBottom: 10,
  },
  otpInput: {
    width: "100%",
    height: 50,
    backgroundColor: "#1E2C38",
    borderRadius: 12,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 109, 0, 0.5)",
    marginBottom: 16,
  },
  footerNote: {
    fontSize: 11,
    color: "#78909C",
    marginTop: 16,
    textAlign: "center",
  },

  // --- CELEBRATION STYLES ---
  celebrationCard: {
    backgroundColor: "#121C24",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#FF6D00",
  },
  confettiIconBox: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "rgba(255, 109, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: "#FF6D00",
  },
  hurrayTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 8,
    textAlign: "center",
  },
  hurraySubtitle: {
    fontSize: 13,
    color: "#B0BEC5",
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 20,
    paddingHorizontal: 8,
  },
  bonusBox: {
    width: "100%",
    backgroundColor: "rgba(0, 230, 118, 0.1)",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.4)",
    marginBottom: 16,
  },
  bonusBadgeLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: "#00E676",
    letterSpacing: 1,
    marginBottom: 4,
  },
  bonusAmountText: {
    fontSize: 28,
    fontWeight: "900",
    color: "#00E676",
    marginBottom: 2,
  },
  bonusSubtext: {
    fontSize: 12,
    color: "#B0BEC5",
  },
  totalBalanceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#1E2C38",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  totalBalanceLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#90A4AE",
    letterSpacing: 0.5,
  },
  totalBalanceValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  goOnDutyBtn: {
    width: "100%",
    height: 54,
    backgroundColor: "#FF6D00",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },
  goOnDutyBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0.5,
  },

  // --- ACTIVATED WALLET SCREEN STYLES (Matching /tmp/pasted-image-441.png) ---
  activatedCardContainer: {
    backgroundColor: "#121C24",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    maxHeight: "85%",
    borderWidth: 1,
    borderColor: "rgba(255, 109, 0, 0.3)",
  },
  activeHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  activeHeaderTagline: {
    fontSize: 11,
    fontWeight: "800",
    color: "#90A4AE",
    letterSpacing: 1.5,
  },
  closeCircleBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#1E2C38",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollBody: {
    alignItems: "center",
    paddingBottom: 20,
  },

  // Leather Wallet Card (Matching Image /tmp/pasted-image-441.png)
  leatherWalletCard: {
    width: "100%",
    backgroundColor: "#1A2530",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1.5,
    borderColor: "#2C3E50",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
    marginBottom: 20,
    position: "relative",
    overflow: "hidden",
  },
  walletCutoutNotch: {
    position: "absolute",
    top: 0,
    width: 120,
    height: 18,
    backgroundColor: "#121C24",
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  walletContentInner: {
    alignItems: "center",
    marginTop: 10,
  },
  leatherBalanceValue: {
    fontSize: 38,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  leatherBalanceLabel: {
    fontSize: 12,
    fontWeight: "800",
    color: "#78909C",
    letterSpacing: 2,
    marginBottom: 10,
  },
  activePaaSBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 230, 118, 0.12)",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0, 230, 118, 0.3)",
  },
  activePaaSBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#00E676",
    marginLeft: 6,
  },

  topupSuccessBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0, 230, 118, 0.15)",
    padding: 12,
    borderRadius: 14,
    width: "100%",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#00E676",
  },
  topupSuccessText: {
    color: "#00E676",
    fontWeight: "700",
    fontSize: 13,
    marginLeft: 10,
  },

  addMoneyMethodHeading: {
    fontSize: 11,
    fontWeight: "800",
    color: "#90A4AE",
    letterSpacing: 1,
    marginBottom: 12,
  },
  paymentLogosRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginBottom: 24,
  },
  logoBadge: {
    backgroundColor: "#1E2C38",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2A3B4D",
  },
  logoTextUPI: { color: "#FF9100", fontWeight: "800", fontSize: 11 },
  logoTextRuPay: { color: "#00E676", fontWeight: "800", fontSize: 11 },
  logoTextVisa: { color: "#29B6F6", fontWeight: "800", fontSize: 11 },
  logoTextMaster: { color: "#FF5252", fontWeight: "800", fontSize: 11 },

  walletActionsRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
    marginBottom: 16,
  },
  addMoneyPrimaryBtn: {
    flex: 1,
    height: 52,
    backgroundColor: "#FF6D00",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    elevation: 3,
  },
  addMoneyPrimaryText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  sendMoneyOutlineBtn: {
    flex: 1,
    height: 52,
    backgroundColor: "#1E2C38",
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#37474F",
  },
  sendMoneyOutlineText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },

  // Add Money Form Section
  addMoneySection: {
    width: "100%",
    backgroundColor: "#1E2C38",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 109, 0, 0.4)",
  },
  inputLabelText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#B0BEC5",
    marginBottom: 12,
  },
  presetPillsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  presetPill: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "#121C24",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#37474F",
  },
  presetPillActive: {
    backgroundColor: "rgba(255, 109, 0, 0.2)",
    borderColor: "#FF6D00",
  },
  presetPillText: {
    color: "#B0BEC5",
    fontWeight: "700",
    fontSize: 12,
  },
  presetPillTextActive: {
    color: "#FF6D00",
  },
  amountInputRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121C24",
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#37474F",
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FF6D00",
    marginRight: 8,
  },
  amountInput: {
    flex: 1,
    height: 48,
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },
  razorpayPayBtn: {
    width: "100%",
    height: 50,
    backgroundColor: "#FF6D00",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  loadingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  razorpayPayBtnText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  cancelTopupBtn: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelTopupText: {
    color: "#90A4AE",
    fontSize: 13,
    fontWeight: "600",
  },
  effortlessFooterText: {
    fontSize: 11,
    color: "#78909C",
    textAlign: "center",
    marginTop: 8,
  },
});
