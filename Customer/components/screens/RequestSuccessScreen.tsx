import { Feather } from "@expo/vector-icons";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

// ─── Props ────────────────────────────────────────────────────────────────────

interface RequestSuccessScreenProps {
  onNavigate: (screen: string) => void;
  requestNumber: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RequestSuccessScreen({ onNavigate, requestNumber }: RequestSuccessScreenProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    // Animate the checkmark icon
    Animated.sequence([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 60,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* Decorative circles */}
      <View style={styles.decorCircle1} />
      <View style={styles.decorCircle2} />

      <View style={styles.content}>
        {/* Animated Checkmark */}
        <Animated.View style={[styles.checkmarkContainer, { transform: [{ scale: scaleAnim }] }]}>
          <View style={styles.checkmarkOuter}>
            <View style={styles.checkmarkInner}>
              <Feather name="check" size={44} color="#ffffff" />
            </View>
          </View>
        </Animated.View>

        {/* Text Content */}
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          <Text style={styles.title}>Service Request Created!</Text>
          <Text style={styles.subtitle}>
            Your request has been successfully submitted. Our team will review and assign a mechanic soon.
          </Text>

          {/* Request Number Card */}
          <View style={styles.requestCard}>
            <View style={styles.requestCardHeader}>
              <Feather name="file-text" size={16} color="#f97316" />
              <Text style={styles.requestCardLabel}>Request Number</Text>
            </View>
            <Text style={styles.requestNumber}>{requestNumber || "N/A"}</Text>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Request Created</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Feather name="info" size={16} color="#2563eb" />
            <Text style={styles.infoText}>
              You&apos;ll receive a notification once a mechanic is assigned to your request.
            </Text>
          </View>
        </Animated.View>

        {/* Buttons */}
        <Animated.View style={[styles.buttonGroup, { opacity: fadeAnim }]}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => onNavigate("MyRequests")}
            activeOpacity={0.8}
          >
            <Feather name="list" size={18} color="#ffffff" />
            <Text style={styles.primaryBtnText}>View My Bookings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => onNavigate("Home")}
            activeOpacity={0.8}
          >
            <Feather name="home" size={18} color="#f97316" />
            <Text style={styles.secondaryBtnText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  decorCircle1: {
    position: "absolute",
    top: -60,
    right: -60,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#fff7ed",
    opacity: 0.6,
  },
  decorCircle2: {
    position: "absolute",
    bottom: -80,
    left: -80,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#fef3c7",
    opacity: 0.4,
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 28,
    width: "100%",
  },

  // ── Checkmark ───────────────────────────────────────────────────────────
  checkmarkContainer: {
    marginBottom: 32,
  },
  checkmarkOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fdedd3",
    justifyContent: "center",
    alignItems: "center",
  },
  checkmarkInner: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  // ── Text ────────────────────────────────────────────────────────────────
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 28,
  },

  // ── Request Card ────────────────────────────────────────────────────────
  requestCard: {
    width: "100%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#fed7aa",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  requestCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  requestCardLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f97316",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  requestNumber: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: 1,
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22c55e",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#16a34a",
  },

  // ── Info Card ───────────────────────────────────────────────────────────
  infoCard: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 12,
    padding: 14,
    gap: 10,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: "#1e40af",
    lineHeight: 19,
  },

  // ── Buttons ─────────────────────────────────────────────────────────────
  buttonGroup: {
    width: "100%",
    gap: 12,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    height: 54,
    borderRadius: 14,
    gap: 10,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    height: 54,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#f97316",
    gap: 10,
  },
  secondaryBtnText: {
    color: "#f97316",
    fontSize: 16,
    fontWeight: "bold",
  },
});
