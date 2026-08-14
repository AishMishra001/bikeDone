import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, Modal, Dimensions, ScrollView, TextInput, Image, Linking } from "react-native";
import { Feather, FontAwesome } from "@expo/vector-icons";
import MapView, { Marker, PROVIDER_GOOGLE } from '../ui/MapView';
import { vehicleService, MyServiceRequest, PublicMechanicProfileResponse } from "../../services/vehicleService";
import { socketService } from "../../services/socketService";

interface FindingMechanicScreenProps {
  onNavigate: (screen: string, params?: any) => void;
  requestId: string;
  requestNumber: string;
}

const { width } = Dimensions.get("window");

const CANCEL_REASONS = [
  "Mechanic is taking too long",
  "Changed my mind",
  "Booked another service",
  "Incorrect location provided",
  "Other"
];

const TIP_OPTIONS = [10, 20, 30, 50];

const getSafeAvatarUri = (uri?: string | null, name: string = 'Mechanic') => {
  if (!uri || uri.startsWith('blob:') || uri.startsWith('file:') || uri.trim() === '') {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'Mechanic')}&background=f97316&color=fff`;
  }
  return uri;
};

export default function FindingMechanicScreen({ onNavigate, requestId, requestNumber }: FindingMechanicScreenProps) {
  const [status, setStatus] = useState<"searching" | "accepted" | "not_found" | "error" | "cancelled">("searching");
  const [reqDetails, setReqDetails] = useState<MyServiceRequest | null>(null);
  
  const [mechanicProfile, setMechanicProfile] = useState<PublicMechanicProfileResponse | null>(null);

  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");

  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  
  const [selectedTip, setSelectedTip] = useState<number>(0);
  const [customTip, setCustomTip] = useState<string>("");

  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [liveMechanicLat, setLiveMechanicLat] = useState<number | null>(null);
  const [liveMechanicLng, setLiveMechanicLng] = useState<number | null>(null);

  useEffect(() => {
    let active = true;

    const checkStatus = async () => {
      if (!active) return;
      try {
        const req = await vehicleService.getServiceRequestById(requestId);
        setReqDetails(req);
        
        if (["MECHANIC_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED"].includes(req.status)) {
          setStatus("accepted");
          if (req.assignedMechanicId && !mechanicProfile) {
            try {
              const profile = await vehicleService.getMechanicProfile(req.assignedMechanicId);
              if (active) setMechanicProfile(profile);
            } catch (err) {
              console.error("Failed to fetch mechanic profile:", err);
            }
          }
        } else if (req.status === "INSPECTION_STARTED" || req.status === "WORK_STARTED") {
           setStatus("accepted");
        } else if (req.status === "NO_MECHANIC_AVAILABLE" || req.status === "EXPIRED") {
          active = false;
          setStatus("not_found");
        } else if (req.status === "CANCELLED") {
          active = false;
          setStatus("cancelled");
        }
      } catch (err) {
        console.error("Error fetching request status:", err);
      }
    };

    const interval = setInterval(checkStatus, 4000);
    const timeout = setTimeout(checkStatus, 1000);

    let unsubscribeMessage: any = null;
    let unsubscribeLocation: any = null;

    if (status === "accepted") {
      unsubscribeMessage = socketService.listenForMessages(requestId, (msg) => {
        if (msg.senderId !== "customer") { // simple check, normally use real customer ID
          setUnreadCount(prev => prev + 1);
        }
      });

      unsubscribeLocation = socketService.listenForLocation(requestId, (loc) => {
        if (loc.latitude && loc.longitude) {
          setLiveMechanicLat(loc.latitude);
          setLiveMechanicLng(loc.longitude);
        }
      });
    }

    return () => {
      active = false;
      clearInterval(interval);
      clearTimeout(timeout);
      if (unsubscribeMessage) unsubscribeMessage();
      if (unsubscribeLocation) unsubscribeLocation();
    };
  }, [requestId, onNavigate, mechanicProfile, status]);

  const handleCancel = async () => {
    if (!selectedReason) return;
    setCancelling(true);
    try {
      await vehicleService.cancelServiceRequest(requestId, selectedReason);
      setCancelModalVisible(false);
      onNavigate("Home");
    } catch (err) {
      console.error("Failed to cancel:", err);
    } finally {
      setCancelling(false);
    }
  };

  const handleTipSelect = (amount: number) => {
    setSelectedTip(amount);
    setCustomTip("");
  };

  if (status === "not_found" || status === "cancelled") {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <Feather name="x-circle" size={60} color="#ef4444" />
        </View>
        <Text style={styles.title}>{status === "cancelled" ? "Request Cancelled" : "No Mechanic Found"}</Text>
        <Text style={styles.subtitle}>
          {status === "cancelled" ? "You have successfully cancelled this request." : "We couldn't find a mechanic nearby at the moment. Please try again after some time."}
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

  const lat = reqDetails?.latitude || 28.5813412;
  const lng = reqDetails?.longitude || 77.3399905;
  const basePrice = reqDetails?.totalPayableAmount;
  const activeTip = customTip ? parseInt(customTip) || 0 : selectedTip;
  
  let displayPriceText = "";
  if (basePrice != null && basePrice > 0) {
    displayPriceText = `₹${basePrice + activeTip}`;
  } else {
    displayPriceText = activeTip > 0 ? `+₹${activeTip} Tip` : "To be decided";
  }

  // Placeholder Mechanic live location - this would normally be streamed from WebSocket
  const mechanicLat = liveMechanicLat || lat + 0.002;
  const mechanicLng = liveMechanicLng || lng + 0.002;

  return (
    <View style={styles.mapContainer}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        region={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        <Marker 
          coordinate={{ latitude: lat, longitude: lng }}
          title="You are here"
        >
          <View style={styles.markerContainer}>
            <Feather name="user" size={16} color="#ffffff" />
          </View>
        </Marker>
        
        {status === "accepted" && (
          <Marker 
            coordinate={{ latitude: mechanicLat, longitude: mechanicLng }}
            title="Mechanic"
          >
            <View style={styles.mechanicMarkerContainer}>
               <FontAwesome name="wrench" size={16} color="#ffffff" />
            </View>
          </Marker>
        )}
      </MapView>

      <TouchableOpacity onPress={() => onNavigate("Home")} style={styles.backBtnFloat}>
        <Feather name="arrow-left" size={24} color="#111827" />
      </TouchableOpacity>

      {/* Main Bottom Sheet */}
      <View style={styles.bottomSheet}>
        <View style={styles.dragHandle} />

        {status === "searching" ? (
          <>
            <View style={styles.topHeader}>
              <View style={styles.findingRow}>
                <ActivityIndicator size="small" color="#f97316" />
                <Text style={styles.findingText}>Connecting your mechanic...</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailsModalVisible(true)} style={styles.detailsBtn}>
                <Feather name="more-vertical" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            <Text style={[styles.priceHighlight, basePrice == null && !activeTip ? { fontSize: 22, color: "#6b7280" } : null]}>
              {displayPriceText}
            </Text>

            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>Add extra to get mechanic accept faster</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tipScroll}>
                {TIP_OPTIONS.map((tip) => (
                  <TouchableOpacity
                    key={tip}
                    style={[styles.tipBadge, selectedTip === tip && !customTip ? styles.tipBadgeActive : null]}
                    onPress={() => handleTipSelect(tip)}
                  >
                    <Text style={[styles.tipText, selectedTip === tip && !customTip ? styles.tipTextActive : null]}>+₹{tip}</Text>
                  </TouchableOpacity>
                ))}
                <TextInput
                  style={styles.customTipInput}
                  placeholder="Custom"
                  keyboardType="number-pad"
                  value={customTip}
                  onChangeText={(val) => {
                    setCustomTip(val);
                    setSelectedTip(0);
                  }}
                />
              </ScrollView>
              <Text style={styles.tipDisclaimer}>100% of the extra amount goes to your mechanic.</Text>
            </View>

            <View style={styles.addressBox}>
              <View style={styles.addressIcon}>
                <Feather name="map-pin" size={16} color="#2563eb" />
              </View>
              <View style={styles.addressTexts}>
                <Text style={styles.addressTitle}>Find your mechanic at</Text>
                <Text style={styles.addressValue} numberOfLines={2}>
                  {reqDetails?.serviceAddress || "Loading your location..."}
                </Text>
              </View>
            </View>

            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => setCancelModalVisible(true)}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelBtnText}>Cancel Request</Text>
            </TouchableOpacity>
          </>
        ) : (
          // MECHANIC ASSIGNED VIEW (Like Uber)
          <View style={styles.acceptedView}>
            
            <View style={styles.topHeader}>
              <View style={styles.findingRow}>
                <Text style={styles.findingText}>Mechanic Assigned</Text>
              </View>
              <TouchableOpacity onPress={() => setDetailsModalVisible(true)} style={styles.detailsBtn}>
                <Feather name="more-vertical" size={24} color="#4b5563" />
              </TouchableOpacity>
            </View>

            {/* PIN Row */}
            {reqDetails?.servicePin && (
              <View style={styles.pinRow}>
                <Text style={styles.pinLabel}>Share this PIN with your mechanic to start</Text>
                <View style={styles.pinBox}>
                  <Text style={styles.pinText}>{reqDetails.servicePin}</Text>
                </View>
              </View>
            )}

            {/* Mechanic Profile Info */}
            <View style={styles.mechanicProfileRow}>
              <Image 
                source={{ uri: getSafeAvatarUri(mechanicProfile?.profilePhotoUrl, mechanicProfile?.fullName || 'Mechanic') }} 
                style={styles.mechanicAvatar} 
              />
              <View style={styles.mechanicInfo}>
                <Text style={styles.mechanicName}>{mechanicProfile?.fullName || 'Assigning Mechanic...'}</Text>
                <View style={styles.ratingRow}>
                  <FontAwesome name="star" size={14} color="#eab308" />
                  <Text style={styles.ratingText}>{mechanicProfile?.rating || '4.8'} (120+ trips)</Text>
                </View>
              </View>
              
              <View style={styles.priceContainerSmall}>
                <Text style={styles.priceTextSmall}>{displayPriceText}</Text>
                <Text style={styles.priceLabelSmall}>Estimated</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.actionButtonsRow}>
              <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.7} onPress={() => {
                  setUnreadCount(0);
                  onNavigate("CustomerChat", { requestId });
              }}>
                <View>
                  <Feather name="message-square" size={20} color="#111827" />
                  {unreadCount > 0 && (
                    <View style={styles.badgeContainer}>
                      <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionBtnText}>Message</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionIconBtn} activeOpacity={0.7} onPress={() => mechanicProfile?.mobileNumber && Linking.openURL(`tel:${mechanicProfile.mobileNumber}`)}>
                <Feather name="phone-call" size={20} color="#111827" />
                <Text style={styles.actionBtnText}>Call</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.actionIconBtnDanger} 
                onPress={() => setCancelModalVisible(true)}
                activeOpacity={0.7}
              >
                <Feather name="x" size={20} color="#ef4444" />
                <Text style={styles.actionBtnTextDanger}>Cancel</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}
      </View>

      {/* Details Modal */}
      <Modal
        visible={detailsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setDetailsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Request Details</Text>
              <TouchableOpacity onPress={() => setDetailsModalVisible(false)}>
                <Feather name="x" size={24} color="#111827" />
              </TouchableOpacity>
            </View>

            <View style={styles.detailsContainer}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Vehicle</Text>
                <Text style={styles.detailValue}>{reqDetails?.vehicleName || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Registration</Text>
                <Text style={styles.detailValue}>{reqDetails?.vehicleRegistrationNumber || "N/A"}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Request Type</Text>
                <Text style={styles.detailValue}>{reqDetails?.requestType || "N/A"}</Text>
              </View>
              {reqDetails?.description && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Description</Text>
                  <Text style={styles.detailValue}>{reqDetails.description}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Mode</Text>
                <Text style={styles.detailValue}>Pay Online / Cash</Text>
              </View>
              <View style={styles.divider} />
              
              {basePrice != null && basePrice > 0 ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Base Fare</Text>
                    <Text style={styles.detailValue}>₹{basePrice}</Text>
                  </View>
                  {activeTip > 0 && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Extra Tip</Text>
                      <Text style={styles.detailValue}>+₹{activeTip}</Text>
                    </View>
                  )}
                  <View style={styles.detailRowTotal}>
                    <Text style={styles.detailLabelTotal}>Current Total</Text>
                    <Text style={styles.detailValueTotal}>₹{basePrice + activeTip}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Base Fare</Text>
                    <Text style={styles.detailValue}>To be decided</Text>
                  </View>
                  {activeTip > 0 && (
                    <View style={styles.detailRowTotal}>
                      <Text style={styles.detailLabelTotal}>Extra Tip</Text>
                      <Text style={styles.detailValueTotal}>+₹{activeTip}</Text>
                    </View>
                  )}
                </>
              )}
            </View>

          </View>
        </View>
      </Modal>

      {/* Cancel Modal */}
      <Modal
        visible={cancelModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Cancel Request?</Text>
            <Text style={styles.modalSubtitle}>Please let us know why you are cancelling.</Text>
            
            {CANCEL_REASONS.map((reason) => (
              <TouchableOpacity 
                key={reason} 
                style={[styles.reasonRow, selectedReason === reason && styles.reasonRowSelected]}
                onPress={() => setSelectedReason(reason)}
              >
                <Text style={[styles.reasonText, selectedReason === reason && styles.reasonTextSelected]}>
                  {reason}
                </Text>
                {selectedReason === reason && (
                  <Feather name="check-circle" size={18} color="#f97316" />
                )}
              </TouchableOpacity>
            ))}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalActionBtn}
                onPress={() => setCancelModalVisible(false)}
              >
                <Text style={styles.modalActionText}>Keep Request</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalActionBtn, styles.modalActionBtnDanger, !selectedReason && { opacity: 0.5 }]}
                onPress={handleCancel}
                disabled={!selectedReason || cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalActionTextDanger}>Confirm Cancel</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: "#e5e5e5",
  },
  map: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  backBtnFloat: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: '#ffffff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  markerContainer: {
    backgroundColor: "#111827",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  mechanicMarkerContainer: {
    backgroundColor: "#2563eb",
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  bottomSheet: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#e5e7eb",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  findingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  findingText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  detailsBtn: {
    padding: 4,
  },
  priceHighlight: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
  },
  tipSection: {
    marginBottom: 20,
  },
  tipTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 10,
  },
  tipScroll: {
    gap: 10,
    paddingRight: 20,
  },
  tipBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  tipBadgeActive: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  tipText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
  },
  tipTextActive: {
    color: "#f97316",
  },
  customTipInput: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    minWidth: 80,
    textAlign: "center",
  },
  tipDisclaimer: {
    fontSize: 12,
    color: "#059669",
    marginTop: 8,
    fontWeight: "500",
  },
  addressBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  addressIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#dbeafe",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  addressTexts: {
    flex: 1,
  },
  addressTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  addressValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    lineHeight: 20,
  },
  cancelBtn: {
    backgroundColor: "#fee2e2",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  cancelBtnText: {
    color: "#ef4444",
    fontSize: 15,
    fontWeight: "bold",
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
  
  // Uber like Accepted View
  acceptedView: {
    width: '100%',
  },
  pinRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f3f4f6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pinLabel: {
    flex: 1,
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '600',
    marginRight: 10,
  },
  pinBox: {
    backgroundColor: '#111827',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  pinText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  mechanicProfileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  mechanicAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    marginRight: 16,
    backgroundColor: '#e5e7eb',
  },
  mechanicInfo: {
    flex: 1,
  },
  mechanicName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 13,
    color: '#4b5563',
    fontWeight: '500',
  },
  priceContainerSmall: {
    alignItems: 'flex-end',
  },
  priceTextSmall: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  priceLabelSmall: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  actionIconBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 48) / 3.2,
    paddingVertical: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    gap: 8,
  },
  actionIconBtnDanger: {
    alignItems: 'center',
    justifyContent: 'center',
    width: (width - 48) / 3.2,
    paddingVertical: 12,
    backgroundColor: '#fee2e2',
    borderRadius: 12,
    gap: 8,
  },
  actionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
  },
  actionBtnTextDanger: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
  },
  badgeContainer: {
    position: 'absolute',
    top: -8,
    right: -10,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  
  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 24,
  },
  detailsContainer: {
    gap: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
    maxWidth: "60%",
    textAlign: "right",
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 4,
  },
  detailRowTotal: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  detailLabelTotal: {
    fontSize: 16,
    color: "#111827",
    fontWeight: "bold",
  },
  detailValueTotal: {
    fontSize: 18,
    color: "#f97316",
    fontWeight: "900",
  },
  reasonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 12,
  },
  reasonRowSelected: {
    borderColor: "#f97316",
    backgroundColor: "#fff7ed",
  },
  reasonText: {
    fontSize: 15,
    color: "#4b5563",
    fontWeight: "500",
  },
  reasonTextSelected: {
    color: "#f97316",
    fontWeight: "700",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  modalActionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
  },
  modalActionBtnDanger: {
    backgroundColor: "#ef4444",
  },
  modalActionText: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#4b5563",
  },
  modalActionTextDanger: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#ffffff",
  },
});
