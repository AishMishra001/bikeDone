import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { tokenStorage, LoggedInMechanic } from "../../services/api";

export default function ProfileScreen() {
  const router = useRouter();
  const [mechanic, setMechanic] = useState<LoggedInMechanic | null>(null);

  // Modal States
  const [activeModal, setActiveModal] = useState<"personal" | "shop" | "bank" | "ratings" | null>(null);

  useEffect(() => {
    tokenStorage.getMechanic().then(setMechanic);
  }, []);

  const handleLogout = async () => {
    Alert.alert("Logout", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await tokenStorage.clear();
          router.replace("/onboarding/splash" as any);
        },
      },
    ]);
  };

  const name = mechanic?.firstName ? `${mechanic.firstName} ${mechanic.lastName || ""}` : "Mechanic Partner";
  const phone = mechanic?.mobileNumber || "+91 99999 99999";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={44} color="#FF6D00" />
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color="#fff" />
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#FFD54F" />
            <Text style={styles.ratingText}>4.8</Text>
            <Text style={styles.ratingCount}>(124 Jobs)</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile & Details</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => { Haptics.selectionAsync(); setActiveModal("personal"); }}>
            <View style={styles.menuIconBox}>
              <Ionicons name="person-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Personal Information</Text>
              <Text style={styles.menuSubtext}>Name, Phone, Experience</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#78909C" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem} onPress={() => { Haptics.selectionAsync(); setActiveModal("shop"); }}>
            <View style={styles.menuIconBox}>
              <Ionicons name="storefront-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Shop Details</Text>
              <Text style={styles.menuSubtext}>Shop Name, Address, Service Radius</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#78909C" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments & Performance</Text>
          <TouchableOpacity style={styles.menuItem} onPress={() => { Haptics.selectionAsync(); setActiveModal("bank"); }}>
            <View style={styles.menuIconBox}>
              <Ionicons name="business-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Bank Account Details</Text>
              <Text style={styles.menuSubtext}>Account for weekly payouts</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#78909C" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => { Haptics.selectionAsync(); setActiveModal("ratings"); }}>
            <View style={styles.menuIconBox}>
              <Ionicons name="star-outline" size={22} color="#FFFFFF" />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Ratings & Feedback</Text>
              <Text style={styles.menuSubtext}>View customer reviews</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#78909C" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support & Legal</Text>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons name="headset-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Help Center</Text>
            <Ionicons name="chevron-forward" size={20} color="#78909C" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#FFFFFF" />
            </View>
            <Text style={styles.menuText}>Terms & Privacy</Text>
            <Ionicons name="chevron-forward" size={20} color="#78909C" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color="#FF5252" />
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>MyKaarigar Partner App • Version 1.0.0</Text>
      </ScrollView>

      {/* MODALS */}
      <Modal visible={activeModal === "personal"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput style={styles.input} value={name} editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Mobile Number</Text>
              <TextInput style={styles.input} value={phone} editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Experience</Text>
              <TextInput style={styles.input} value="5 Years" editable={false} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}><Text style={styles.saveBtnText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "shop"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Shop Details</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shop Name</Text>
              <TextInput style={styles.input} value="Bike Masters Garage" editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shop Address</Text>
              <TextInput style={styles.input} value="Sector 62, Noida" editable={false} multiline />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Radius (km)</Text>
              <TextInput style={styles.input} value="10 km" editable={false} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}><Text style={styles.saveBtnText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "bank"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Account Details</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color="#29B6F6" />
              <Text style={styles.infoText}>This account is used for your weekly PaaS payouts.</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput style={styles.input} value="HDFC Bank" editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput style={styles.input} value="XXXX-XXXX-1234" editable={false} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}><Text style={styles.saveBtnText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "ratings"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Ratings & Feedback</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color="#FFF" /></TouchableOpacity>
            </View>
            
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>Rahul S.</Text>
                <View style={{flexDirection: "row"}}><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /></View>
              </View>
              <Text style={styles.reviewText}>"Great service! Fixed my bike's chain issue in 10 minutes."</Text>
            </View>

            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>Amit K.</Text>
                <View style={{flexDirection: "row"}}><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star" color="#FFD54F" size={14} /><Ionicons name="star-half" color="#FFD54F" size={14} /></View>
              </View>
              <Text style={styles.reviewText}>"Very professional mechanic. Punctual."</Text>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}><Text style={styles.saveBtnText}>Close</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0B1319",
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 35,
  },
  avatarPlaceholder: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "rgba(255, 109, 0, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#FF6D00",
    position: "relative",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#00E676",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#0B1319",
  },
  name: {
    fontSize: 22,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: "#B0BEC5",
    marginBottom: 12,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E2C38",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#37474F",
  },
  ratingText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginLeft: 6,
    fontSize: 15,
  },
  ratingCount: {
    color: "#90A4AE",
    marginLeft: 6,
    fontSize: 12,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#78909C",
    marginBottom: 14,
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#121C24",
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1E2C38",
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#1A2530",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: "#90A4AE",
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 82, 82, 0.1)",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 82, 82, 0.3)",
    marginBottom: 24,
  },
  logoutText: {
    color: "#FF5252",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  versionText: {
    textAlign: "center",
    color: "#546E7A",
    fontSize: 12,
    marginBottom: 20,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#121C24",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#2C3E50",
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(41, 182, 246, 0.1)",
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "rgba(41, 182, 246, 0.3)",
  },
  infoText: {
    color: "#29B6F6",
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 12,
    color: "#90A4AE",
    marginBottom: 8,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1A2530",
    borderWidth: 1,
    borderColor: "#2C3E50",
    borderRadius: 12,
    padding: 14,
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  saveBtn: {
    backgroundColor: "#FF6D00",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "800",
  },
  reviewCard: {
    backgroundColor: "#1A2530",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#2C3E50",
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  reviewName: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  reviewText: {
    color: "#B0BEC5",
    fontSize: 14,
    fontStyle: "italic",
    lineHeight: 20,
  },
});
