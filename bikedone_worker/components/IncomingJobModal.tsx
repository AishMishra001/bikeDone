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
              <Text style={styles.badgeText}>ROUND #{job.dispatchRound || 1}</Text>
            </View>
            <View style={styles.timerBadge}>
              <Ionicons name="time-outline" size={16} color="#FF5252" />
              <Text style={styles.timerText}>{timeLeft}s</Text>
            </View>
          </View>

          {/* Icon & Title */}
          <View style={styles.iconRow}>
            <View style={styles.iconContainer}>
              <Ionicons name="construct-outline" size={32} color="#00C853" />
            </View>
            <View style={styles.titleContainer}>
              <Text style={styles.title}>New Service Request!</Text>
              <Text style={styles.subtitle}>
                {job.issueDescription || "General Bike Service / Breakdown"}
              </Text>
            </View>
          </View>

          {/* Details Section */}
          <View style={styles.detailsBox}>
            <View style={styles.detailRow}>
              <Ionicons name="person-outline" size={18} color="#757575" />
              <Text style={styles.detailText}>
                {job.customerName || "Bike Customer"}
              </Text>
            </View>

            <View style={styles.detailRow}>
              <Ionicons name="location-outline" size={18} color="#757575" />
              <Text style={styles.detailText} numberOfLines={2}>
                {job.addressNote || (job.latitude !== undefined && job.longitude !== undefined && job.latitude !== null && job.longitude !== null ? `Lat: ${job.latitude}, Lng: ${job.longitude}` : "📍 Customer Live Location Shared")}
              </Text>
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
                  <Ionicons name="checkmark-circle" size={22} color="#FFFFFF" />
                  <Text style={styles.acceptText}>ACCEPT JOB</Text>
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
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "flex-end",
  },
  card: {
    backgroundColor: "#121C24",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  progressBackground: {
    height: 4,
    backgroundColor: "#263238",
    borderRadius: 2,
    marginBottom: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00C853",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  badge: {
    backgroundColor: "#1E2C38",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#00E676",
    fontWeight: "700",
    fontSize: 12,
  },
  timerBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  timerText: {
    color: "#FF5252",
    fontWeight: "700",
    fontSize: 14,
  },
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(0, 200, 83, 0.12)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  subtitle: {
    fontSize: 14,
    color: "#B0BEC5",
    marginTop: 2,
  },
  detailsBox: {
    backgroundColor: "#1E2C38",
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailText: {
    color: "#ECEFF1",
    fontSize: 14,
    flex: 1,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  rejectButton: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#263238",
    justifyContent: "center",
    alignItems: "center",
  },
  rejectText: {
    color: "#CFD8DC",
    fontWeight: "600",
    fontSize: 16,
  },
  acceptButton: {
    flex: 2,
    height: 52,
    borderRadius: 14,
    backgroundColor: "#00C853",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  acceptText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
});
