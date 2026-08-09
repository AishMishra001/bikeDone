import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Location from "expo-location";
import { tokenStorage, LoggedInMechanic, api } from "../../services/api";
import { socketService } from "../../services/socketService";
import { useBadge } from "../../context/BadgeContext";

const updateJobStatus = async (jobId: string, status: string) => {
  try {
    const response = await fetch(`http://192.168.1.100:8080/api/v1/service-requests/${jobId}/status?status=${status}`, {
      method: 'PATCH',
    });
    if (!response.ok) throw new Error('Failed to update status');
    return await response.json();
  } catch (error) {
    console.error("Error updating status:", error);
    throw error;
  }
};

export default function JobScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const { unreadCount } = useBadge();
  
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [job, setJob] = useState<any>(null);
  
  const [status, setStatus] = useState("MECHANIC_ASSIGNED");
  const [estimate, setEstimate] = useState("");
  
  const locationIntervalRef = useRef<any>(null);

  useEffect(() => {
    setTimeout(() => {
      setJob({
        id,
        customerName: "Rahul Sharma",
        customerPhone: "9999999999",
        vehicleMake: "Royal Enfield",
        vehicleModel: "Classic 350",
        issue: "Engine Start Issue & Chain Lube",
        location: { lat: 28.6200, lng: 77.2100, address: "Sector 62, Near Metro Station, Noida" }
      });
      setLoading(false);
    }, 1000);

    return () => {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [id]);

  // Start pushing location to Firebase when ON_THE_WAY
  useEffect(() => {
    if (status === "ON_THE_WAY") {
      startLiveTracking();
    } else {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    }
  }, [status]);

  const startLiveTracking = async () => {
    const { status: perm } = await Location.requestForegroundPermissionsAsync();
    if (perm !== "granted") return;
    
    // Push every 5 seconds to Pusher via OMS API
    locationIntervalRef.current = setInterval(async () => {
      try {
        const loc = await Location.getCurrentPositionAsync({});
        await socketService.updateLocation(id, loc.coords.latitude, loc.coords.longitude);
      } catch (e) {
        console.warn("Location tracking error", e);
      }
    }, 5000);
  };

  const handleUpdateStatus = async (nextStatus: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setUpdating(true);
    try {
      await updateJobStatus(id, nextStatus);
      setStatus(nextStatus);
    } catch (err) {
      Alert.alert("Error", "Could not update job status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const openMaps = () => {
    if (!job) return;
    const { lat, lng } = job.location;
    const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
    Linking.openURL(url);
    if (status === "MECHANIC_ASSIGNED") {
      handleUpdateStatus("ON_THE_WAY");
    }
  };
  
  const handleCall = () => {
    if (job?.customerPhone) Linking.openURL(`tel:${job.customerPhone}`);
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FF6D00" />
        <Text style={styles.loadingText}>Loading Job Details...</Text>
      </View>
    );
  }

  const renderActionArea = () => {
    switch (status) {
      case "MECHANIC_ASSIGNED":
      case "ON_THE_WAY":
        return (
          <>
            <TouchableOpacity style={styles.primaryBtn} onPress={openMaps}>
              <Ionicons name="navigate" size={20} color="#FFF" />
              <Text style={styles.primaryBtnText}>
                {status === "MECHANIC_ASSIGNED" ? "Start Trip & Navigate" : "Continue Navigation"}
              </Text>
            </TouchableOpacity>
            {status === "ON_THE_WAY" && (
              <TouchableOpacity 
                style={[styles.secondaryBtn, { marginTop: 12 }]} 
                onPress={() => handleUpdateStatus("ARRIVED")}
                disabled={updating}
              >
                <Text style={styles.secondaryBtnText}>{updating ? "Updating..." : "I Have Arrived"}</Text>
              </TouchableOpacity>
            )}
          </>
        );
      case "ARRIVED":
        return (
          <TouchableOpacity 
            style={styles.primaryBtn} 
            onPress={() => handleUpdateStatus("INSPECTION_STARTED")}
            disabled={updating}
          >
            <Ionicons name="search" size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>{updating ? "Updating..." : "Start Diagnosis"}</Text>
          </TouchableOpacity>
        );
      case "INSPECTION_STARTED":
        return (
          <View style={styles.estimateBox}>
            <Text style={styles.estimateTitle}>Create Estimate</Text>
            <TextInput
              style={styles.estimateInput}
              placeholder="Enter Estimated Cost (₹)"
              placeholderTextColor="#78909C"
              keyboardType="numeric"
              value={estimate}
              onChangeText={setEstimate}
            />
            <TouchableOpacity 
              style={[styles.primaryBtn, { marginTop: 12 }]} 
              onPress={() => handleUpdateStatus("ESTIMATE_PREPARED")}
              disabled={updating || !estimate}
            >
              <Text style={styles.primaryBtnText}>{updating ? "Updating..." : "Send Estimate to Customer"}</Text>
            </TouchableOpacity>
          </View>
        );
      case "ESTIMATE_PREPARED":
        return (
          <View style={styles.estimateBox}>
             <Text style={styles.estimateTitle}>Awaiting Customer Approval</Text>
             <Text style={styles.estimateSub}>Waiting for customer to accept the ₹{estimate} estimate.</Text>
             <TouchableOpacity 
              style={[styles.secondaryBtn, { marginTop: 12 }]} 
              onPress={() => handleUpdateStatus("WORK_STARTED")}
              disabled={updating}
            >
              <Text style={styles.secondaryBtnText}>Mock: Customer Approved -{'>'} Start Work</Text>
            </TouchableOpacity>
          </View>
        );
      case "WORK_STARTED":
        return (
          <TouchableOpacity 
            style={[styles.primaryBtn, { backgroundColor: "#00E676" }]} 
            onPress={() => handleUpdateStatus("WORK_COMPLETED")}
            disabled={updating}
          >
            <Ionicons name="checkmark-done-circle" size={20} color="#FFF" />
            <Text style={styles.primaryBtnText}>{updating ? "Updating..." : "Mark Job as Complete"}</Text>
          </TouchableOpacity>
        );
      case "WORK_COMPLETED":
        return (
          <View style={styles.estimateBox}>
             <Text style={styles.estimateTitle}>Job Successfully Completed!</Text>
             <Text style={styles.estimateSub}>Please collect ₹{estimate} from the customer.</Text>
             <TouchableOpacity 
              style={[styles.primaryBtn, { marginTop: 16 }]} 
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                router.replace("/(tabs)");
              }}
            >
              <Text style={styles.primaryBtnText}>Collect Payment & End Job</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Job #{id.substring(0, 8).toUpperCase()}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: status === "WORK_COMPLETED" ? "#00E676" : "#FF6D00" }]} />
          <Text style={styles.statusText}>{status.replace(/_/g, ' ')}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Customer Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="person" size={20} color="#78909C" />
            <Text style={styles.detailText}>{job?.customerName}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={20} color="#78909C" />
            <Text style={styles.detailText}>{job?.location.address}</Text>
          </View>
          
          <View style={styles.communicationRow}>
             <TouchableOpacity style={styles.commBtn} onPress={handleCall}>
                <Ionicons name="call" size={20} color="#00E676" />
                <Text style={[styles.commBtnText, { color: "#00E676" }]}>Call</Text>
             </TouchableOpacity>
             <TouchableOpacity style={styles.commBtn} onPress={() => router.push(`/job/chat/${id}`)}>
                <View style={{ position: 'relative' }}>
                  <Ionicons name="chatbubbles" size={20} color="#29B6F6" />
                  {unreadCount > 0 && (
                    <View style={styles.chatBadge}>
                      <Text style={styles.chatBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.commBtnText, { color: "#29B6F6" }]}>Chat</Text>
             </TouchableOpacity>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Vehicle Details</Text>
          <View style={styles.detailRow}>
            <Ionicons name="bicycle" size={20} color="#78909C" />
            <Text style={styles.detailText}>{job?.vehicleMake} {job?.vehicleModel}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="build" size={20} color="#78909C" />
            <Text style={styles.detailText}>{job?.issue}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        {renderActionArea()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B1319" },
  centerContainer: { flex: 1, backgroundColor: "#0B1319", justifyContent: "center", alignItems: "center" },
  loadingText: { color: "#78909C", marginTop: 12, fontWeight: "600" },
  
  header: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 60, paddingBottom: 20, paddingHorizontal: 20,
    backgroundColor: "#121C24",
    borderBottomWidth: 1, borderBottomColor: "#1E2C38"
  },
  backBtn: { marginRight: 16 },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#FFF" },
  
  content: { padding: 20 },
  
  statusBadge: {
    flexDirection: "row", alignItems: "center", alignSelf: "flex-start",
    backgroundColor: "rgba(255, 109, 0, 0.15)",
    paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, marginBottom: 24,
    borderWidth: 1, borderColor: "rgba(255, 109, 0, 0.3)"
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: "#FF6D00", fontWeight: "800", fontSize: 12 },
  
  card: {
    backgroundColor: "#121C24",
    borderRadius: 16, padding: 16, marginBottom: 16,
    borderWidth: 1, borderColor: "#1E2C38"
  },
  cardTitle: { fontSize: 14, fontWeight: "700", color: "#78909C", marginBottom: 16, textTransform: "uppercase" },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  detailText: { color: "#FFF", fontSize: 16, fontWeight: "600", marginLeft: 12, flex: 1 },
  
  communicationRow: { flexDirection: "row", marginTop: 16, borderTopWidth: 1, borderTopColor: "#1E2C38", paddingTop: 16, gap: 12 },
  commBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, backgroundColor: "#1A2530", borderRadius: 12, borderWidth: 1, borderColor: "#2C3E50" },
  commBtnText: { fontWeight: "700", fontSize: 15, marginLeft: 8 },

  footer: {
    padding: 20, paddingBottom: 40,
    backgroundColor: "#121C24",
    borderTopWidth: 1, borderTopColor: "#1E2C38"
  },
  primaryBtn: {
    backgroundColor: "#FF6D00",
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    paddingVertical: 16, borderRadius: 14,
  },
  primaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "800", marginLeft: 8 },
  
  secondaryBtn: {
    backgroundColor: "#1A2530",
    flexDirection: "row", justifyContent: "center", alignItems: "center",
    paddingVertical: 16, borderRadius: 14,
    borderWidth: 1, borderColor: "#2C3E50"
  },
  secondaryBtnText: { color: "#FFF", fontSize: 16, fontWeight: "700" },
  
  estimateBox: {
    backgroundColor: "#1A2530", padding: 16, borderRadius: 14,
    borderWidth: 1, borderColor: "#2C3E50"
  },
  estimateTitle: { color: "#FFF", fontSize: 16, fontWeight: "700", marginBottom: 12 },
  estimateSub: { color: "#90A4AE", fontSize: 13, marginBottom: 12 },
  estimateInput: {
    backgroundColor: "#0B1319", color: "#FFF", fontSize: 18, fontWeight: "700",
    padding: 14, borderRadius: 10, borderWidth: 1, borderColor: "#37474F",
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  chatBadgeText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
