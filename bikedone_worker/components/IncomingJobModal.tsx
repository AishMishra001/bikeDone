import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { Colors } from "@/constants/theme";
import { dispatchService, IncomingJobRequest } from "../services/dispatchService";

interface IncomingJobModalProps {
  visible: boolean;
  job: IncomingJobRequest | null;
  mechanicId: string;
  onAcceptSuccess: (job: IncomingJobRequest) => void;
  onDismiss: () => void;
}

const { width } = Dimensions.get("window");

export const IncomingJobModal: React.FC<IncomingJobModalProps> = ({
  visible,
  job,
  mechanicId,
  onAcceptSuccess,
  onDismiss,
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(30);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible && job) {
      setTimeLeft(job.timeoutSeconds || 30);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);

      const timer = setInterval(() => {
        setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, job]);

  useEffect(() => {
    if (visible && timeLeft === 0) {
      onDismiss();
    }
  }, [timeLeft, visible]);

  if (!visible || !job) return null;

  const handleAccept = async () => {
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const success = await dispatchService.acceptRequest(job.requestId, mechanicId);
    setLoading(false);

    if (success) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onAcceptSuccess(job);
    } else {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert(
        "Request Unavailable",
        "Sorry, this service request was already accepted by another mechanic or has expired.",
        [{ text: "OK", onPress: onDismiss }]
      );
    }
  };

  const handleReject = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDismiss();
  };

  const progressPercent = (timeLeft / (job.timeoutSeconds || 30)) * 100;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top Countdown Progress */}
          <View style={styles.progressBackground}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.header}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>DISPATCH ROUND #{job.dispatchRound || 1}</Text>
            </View>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={16} color="#EF4444" />
              <Text style={styles.timerText}>{timeLeft}s remaining</Text>
            </View>
          </View>

          {/* Icon & Title */}
          <View style={styles.iconRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="flash" size={28} color={Colors.primary} />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>New Breakdown Dispatch!</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {job.issueDescription || "Urgent Two-Wheeler Breakdown / Service"}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsBox}>
            {job.extraAmount && Number(job.extraAmount) > 0 ? (
              <View style={styles.tipBonusBanner}>
                <Ionicons name="sparkles" size={16} color="#D97706" />
                <Text style={styles.tipBonusText}>
                  +₹{job.extraAmount} Surge / Tip Bonus Added!
                </Text>
              </View>
            ) : null}

            <View style={styles.detailRow}>
              <View style={styles.detailIconCircle}>
                <Ionicons name="person" size={15} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Customer</Text>
                <Text style={styles.detailText}>{job.customerName || "Verified Customer"}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailIconCircle}>
                <Ionicons name="location" size={15} color={Colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Breakdown Location</Text>
                <Text style={styles.detailText} numberOfLines={2}>
                  {job.addressNote || (job.latitude !== undefined && job.longitude !== undefined && job.latitude !== null && job.longitude !== null ? `Coordinates: ${job.latitude.toFixed(4)}, ${job.longitude.toFixed(4)}` : "Live Customer GPS Location")}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.rejectButton}
              onPress={handleReject}
              disabled={loading}
            >
              <Text style={styles.rejectText}>Decline</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.acceptButton}
              onPress={handleAccept}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
                  <Text style={styles.acceptText}>ACCEPT DISPATCH</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.65)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 24,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  progressBackground: {
    height: 5,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: Colors.primary,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  badgeText: {
    color: Colors.primaryDark,
    fontWeight: "800",
    fontSize: 11,
    letterSpacing: 0.5,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  timerText: {
    color: "#EF4444",
    fontWeight: "800",
    fontSize: 12,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
    borderWidth: 1.5,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textDark,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.gray600,
    marginTop: 2,
    fontWeight: '500',
    lineHeight: 18,
  },
  detailsBox: {
    backgroundColor: Colors.lightBackground,
    borderRadius: 16,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  tipBonusBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF3C7",
    borderWidth: 1,
    borderColor: "#FDE68A",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  tipBonusText: {
    color: "#B45309",
    fontWeight: "800",
    fontSize: 13,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  detailIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: Colors.gray500,
    fontWeight: '600',
    marginBottom: 1,
  },
  detailText: {
    color: Colors.textDark,
    fontSize: 14,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.gray100,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  rejectText: {
    color: Colors.gray700,
    fontWeight: "700",
    fontSize: 15,
  },
  acceptButton: {
    flex: 2,
    height: 50,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  acceptText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 0.5,
  },
});
