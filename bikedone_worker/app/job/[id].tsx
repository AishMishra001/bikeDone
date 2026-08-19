import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Linking, TextInput } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { tokenStorage, LoggedInMechanic, api } from "../../services/api";
import { socketService } from "../../services/socketService";
import { dispatchService } from "../../services/dispatchService";
import { locationService } from "../../services/locationService";
import { useBadge } from "../../context/BadgeContext";
import { Colors, Shadows } from "@/constants/theme";

const updateJobStatus = async (jobId: string, status: string) => {
  try {
    return await api.patch(
      `/service-requests/${jobId}/status?status=${status}`,
      undefined,
      { targetService: 'OMS' }
    );
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
    let isMounted = true;

    const fetchJobDetails = async () => {
      try {
        const res = await api.get<any>(`/service-requests/${id}`, { targetService: 'OMS' });
        if (isMounted && res) {
          setJob({
            id: res.id || id,
            customerName: res.customerName || "Customer",
            customerPhone: res.customerMobile || res.customerPhone || "9999999999",
            vehicleMake: res.vehicleMake || res.vehicleBrand || "Royal Enfield",
            vehicleModel: res.vehicleModel || "Classic 350",
            issue: res.issueDescription || "Bike Breakdown Service",
            location: {
              lat: Number(res.latitude) || 28.6200,
              lng: Number(res.longitude) || 77.2100,
              address: res.addressNote || res.locationAddress || "Customer Location"
            }
          });
          if (res.status) {
            setStatus(res.status);
          }
        }
      } catch (e) {
        // Fallback default
        if (isMounted) {
          setJob({
            id,
            customerName: "Rahul Sharma",
            customerPhone: "9999999999",
            vehicleMake: "Royal Enfield",
            vehicleModel: "Classic 350",
            issue: "Engine Start Issue & Chain Lube",
            location: { lat: 28.6200, lng: 77.2100, address: "Sector 62, Near Metro Station, Noida" }
          });
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchJobDetails();

    return () => {
      isMounted = false;
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    };
  }, [id]);

  // Start pushing location when job is active
  useEffect(() => {
    if (["MECHANIC_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(status)) {
      startLiveTracking();
    } else {
      if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    }
  }, [status]);

  const startLiveTracking = async () => {
    const hasPerm = await locationService.requestLocationPermission();
    if (!hasPerm) return;
    
    const pushLiveLocation = async () => {
      try {
        const loc = await locationService.getCurrentLocation();
        if (loc && loc.latitude && loc.longitude) {
          // 1. Push to active job socket channel for instant customer tracking
          await socketService.updateLocation(id, loc.latitude, loc.longitude);

          // 2. Also keep UMS DB updated in real-time
          const stored = await tokenStorage.getMechanic();
          const mechId = stored?.id || (stored as any)?.mechanicId;
          if (mechId) {
            dispatchService.updateLocation(mechId, loc.latitude, loc.longitude, true).catch(() => {});
          }
        }
      } catch (e) {
        console.warn("Location tracking error", e);
      }
    };

    // Push immediately then every 3 seconds for smooth real-time tracking
    pushLiveLocation();
    if (locationIntervalRef.current) clearInterval(locationIntervalRef.current);
    locationIntervalRef.current = setInterval(pushLiveLocation, 3000);
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
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.textDark} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Active Job #{id.substring(0, 8).toUpperCase()}</Text>
          <Text style={styles.headerSubtitle}>Live Breakdown Service Console</Text>
        </View>
        <TouchableOpacity style={styles.callHeaderBtn} onPress={handleCall}>
          <Ionicons name="call" size={18} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Badge */}
        <View style={styles.statusBadge}>
          <View style={[styles.statusDot, { backgroundColor: status === "WORK_COMPLETED" ? "#10B981" : Colors.primary }]} />
          <Text style={styles.statusText}>{status.replace(/_/g, ' ')}</Text>
        </View>

        {/* Customer & Location Details Card */}
        <View style={[styles.card, Shadows.small]}>
          <Text style={styles.cardTitle}>Customer & Destination</Text>
          
          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="person" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Customer Name</Text>
              <Text style={styles.detailText}>{job?.customerName || 'Rahul Sharma'}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={styles.detailIconBox}>
              <Ionicons name="location" size={18} color={Colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Service Location</Text>
              <Text style={styles.detailText}>{job?.location.address || 'Sector 62, Noida'}</Text>
            </View>
          </View>
          
          <View style={styles.communicationRow}>
             <TouchableOpacity style={styles.commBtnCall} onPress={handleCall}>
                <Ionicons name="call" size={18} color="#FFFFFF" />
                <Text style={styles.commBtnCallText}>Call Customer</Text>
             </TouchableOpacity>

             <TouchableOpacity style={styles.commBtnChat} onPress={() => router.push(`/job/chat/${id}`)}>
                <View style={{ position: 'relative' }}>
                  <Ionicons name="chatbubbles" size={18} color={Colors.primary} />
                  {unreadCount > 0 && (
                    <View style={styles.chatBadge}>
                      <Text style={styles.chatBadgeText}>{unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.commBtnChatText}>Chat</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Vehicle & Reported Issue Card */}
        <View style={[styles.card, Shadows.small]}>
          <Text style={styles.cardTitle}>Vehicle & Breakdown Diagnosis</Text>
          
          <View style={styles.detailRow}>
            <View style={[styles.detailIconBox, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="bicycle" size={18} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Vehicle Brand / Model</Text>
              <Text style={styles.detailText}>{job?.vehicleMake} {job?.vehicleModel}</Text>
            </View>
          </View>

          <View style={styles.detailRow}>
            <View style={[styles.detailIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="warning-outline" size={18} color="#B45309" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.detailLabel}>Reported Problem</Text>
              <Text style={styles.detailText}>{job?.issue}</Text>
            </View>
          </View>
        </View>

        {/* Action Panel Inside Card */}
        <View style={[styles.actionPanelCard, Shadows.small]}>
          {renderActionArea()}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.lightBackground },
  centerContainer: { flex: 1, backgroundColor: Colors.lightBackground, justifyContent: "center", alignItems: "center" },
  loadingText: { color: Colors.gray600, marginTop: 12, fontWeight: "600" },
  
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 54,
    paddingBottom: 16,
    paddingHorizontal: 20,
    backgroundColor: Colors.cardBackground,
    borderBottomWidth: 1,
    borderBottomColor: Colors.gray200,
  },
  backBtn: {
    marginRight: 14,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.gray100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: { fontSize: 17, fontWeight: "900", color: Colors.textDark },
  headerSubtitle: { fontSize: 12, color: Colors.gray500, marginTop: 1 },
  callHeaderBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  content: { padding: 20, paddingBottom: 40 },
  
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
  },
  statusDot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  statusText: { color: Colors.primaryDark, fontWeight: "800", fontSize: 12 },
  
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  cardTitle: { fontSize: 11, fontWeight: "800", color: Colors.gray500, marginBottom: 14, letterSpacing: 0.8 },
  detailRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  detailIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: { fontSize: 11, color: Colors.gray500, fontWeight: '600', marginBottom: 2 },
  detailText: { color: Colors.textDark, fontSize: 15, fontWeight: "700" },
  
  communicationRow: { flexDirection: "row", marginTop: 6, borderTopWidth: 1, borderTopColor: Colors.gray100, paddingTop: 14, gap: 10 },
  commBtnCall: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    gap: 6,
  },
  commBtnCallText: { color: "#FFFFFF", fontWeight: "800", fontSize: 14 },
  commBtnChat: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    backgroundColor: Colors.primaryLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    gap: 6,
  },
  commBtnChatText: { color: Colors.primaryDark, fontWeight: "800", fontSize: 14 },

  actionPanelCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    marginTop: 4,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 14,
    gap: 8,
  },
  primaryBtnText: { color: "#FFF", fontSize: 15, fontWeight: "800" },
  
  secondaryBtn: {
    backgroundColor: Colors.lightBackground,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: Colors.gray300,
  },
  secondaryBtnText: { color: Colors.textDark, fontSize: 15, fontWeight: "700" },
  
  estimateBox: {
    padding: 4,
  },
  estimateTitle: { color: Colors.textDark, fontSize: 16, fontWeight: "800", marginBottom: 6 },
  estimateSub: { color: Colors.gray600, fontSize: 13, marginBottom: 14 },
  estimateInput: {
    backgroundColor: Colors.lightBackground,
    color: Colors.textDark,
    fontSize: 18,
    fontWeight: "800",
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.gray200,
    marginBottom: 8,
  },
  chatBadge: {
    position: 'absolute',
    top: -5,
    right: -10,
    backgroundColor: '#EF4444',
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
