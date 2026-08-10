import React, { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { Feather } from "@expo/vector-icons";
import { vehicleService } from "../../services/vehicleService";

interface FindingMechanicScreenProps {
  onNavigate: (screen: string) => void;
  requestId: string;
  requestNumber: string;
}

export default function FindingMechanicScreen({ onNavigate, requestId, requestNumber }: FindingMechanicScreenProps) {
  const [status, setStatus] = useState<"searching" | "not_found" | "error">("searching");
  
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    let active = true;
    
    // Pulsing animation for the searching state
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    const checkStatus = async () => {
      if (!active) return;
      try {
        const req = await vehicleService.getServiceRequestById(requestId);
        
        if (req.status === "MECHANIC_ASSIGNED" || req.status === "ACCEPTED" || req.status === "ON_THE_WAY" || req.status === "ARRIVED") {
          active = false;
          onNavigate("RequestSuccess");
        } else if (req.status === "NO_MECHANIC_AVAILABLE" || req.status === "EXPIRED" || req.status === "CANCELLED") {
          active = false;
          setStatus("not_found");
        }
      } catch (err) {
        console.error("Error fetching request status:", err);
      }
    };

    // Poll every 4 seconds
    const interval = setInterval(checkStatus, 4000);
    // Initial check after 2 seconds
    const timeout = setTimeout(checkStatus, 2000);

    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [requestId, onNavigate]);

  if (status === "not_found") {
    return (
      <View style={styles.container}>
        <View style={styles.errorIconContainer}>
          <Feather name="x-circle" size={60} color="#ef4444" />
        </View>
        <Text style={styles.title}>No Mechanic Found</Text>
        <Text style={styles.subtitle}>
          We couldn't find a mechanic nearby at the moment. Please try again after some time.
        </Text>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => onNavigate("Home")}
          activeOpacity={0.8}
        >
          <Feather name="home" size={18} color="#ffffff" />
          <Text style={styles.primaryBtnText}>Back to Home</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.radarContainer, { transform: [{ scale: pulseAnim }] }]}>
        <View style={styles.radarCircle1}>
          <View style={styles.radarCircle2}>
            <View style={styles.radarCenter}>
              <Feather name="search" size={32} color="#ffffff" />
            </View>
          </View>
        </View>
      </Animated.View>

      <Text style={styles.title}>Finding a Mechanic...</Text>
      <Text style={styles.subtitle}>
        Please wait while we connect you with the nearest available mechanic for request #{requestNumber}.
      </Text>
      
      <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  radarContainer: {
    marginBottom: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  radarCircle1: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#ffedd5",
    justifyContent: "center",
    alignItems: "center",
  },
  radarCircle2: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#fed7aa",
    justifyContent: "center",
    alignItems: "center",
  },
  radarCenter: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 30,
  },
  primaryBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f97316",
    height: 54,
    borderRadius: 14,
    width: "100%",
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
});
