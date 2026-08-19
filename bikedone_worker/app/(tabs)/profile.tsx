import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Colors, Shadows } from "@/constants/theme";
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
    Alert.alert("Logout", "Are you sure you want to log out of your MyKaarigar Partner account?", [
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

  const name = mechanic?.firstName ? `${mechanic.firstName} ${mechanic.lastName || ""}` : "Rahul Kumar";
  const phone = mechanic?.mobileNumber || "+91 98765 43210";

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Profile Hero Card */}
        <View style={[styles.heroProfileCard, Shadows.medium]}>
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={44} color={Colors.primary} />
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.phone}>{phone}</Text>
          
          <View style={styles.badgeRow}>
            <View style={styles.ratingBadge}>
              <Ionicons name="star" size={14} color="#F59E0B" />
              <Text style={styles.ratingText}>4.9</Text>
              <Text style={styles.ratingCount}>• 124 Orders</Text>
            </View>
            <View style={styles.expBadge}>
              <Ionicons name="ribbon-outline" size={14} color={Colors.primary} />
              <Text style={styles.expText}>5+ Yrs Exp</Text>
            </View>
          </View>
        </View>

        {/* Section 1: Profile & Workshop */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>WORKSHOP & PARTNER DETAILS</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, Shadows.small]}
            onPress={() => { Haptics.selectionAsync(); setActiveModal("personal"); }}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="person-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Personal Profile</Text>
              <Text style={styles.menuSubtext}>Name, Phone, KYC Documents</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, Shadows.small]}
            onPress={() => { Haptics.selectionAsync(); setActiveModal("shop"); }}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="business-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Workshop & Garage Info</Text>
              <Text style={styles.menuSubtext}>Shop Name, Address, Working Hours</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Section 2: Payouts & Quality */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>PAYMENTS & REPUTATION</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, Shadows.small]}
            onPress={() => { Haptics.selectionAsync(); setActiveModal("bank"); }}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="card-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Bank Account & Payouts</Text>
              <Text style={styles.menuSubtext}>Direct weekly bank settlement details</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.menuItem, Shadows.small]}
            onPress={() => { Haptics.selectionAsync(); setActiveModal("ratings"); }}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="star-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Customer Reviews & Ratings</Text>
              <Text style={styles.menuSubtext}>4.9 ★ Partner Score</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        {/* Section 3: Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>HELP & LEGAL</Text>
          
          <TouchableOpacity
            style={[styles.menuItem, Shadows.small]}
            onPress={() => Alert.alert('MyKaarigar Partner Support', 'Call helpline: 1800-123-KAARIGAR\nEmail: partners@mykaarigar.com')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="headset-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>Partner Helpline (24/7)</Text>
              <Text style={styles.menuSubtext}>Immediate breakdown dispatch support</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.menuItem, Shadows.small]}
            onPress={() => Alert.alert('Quality SOP Guidelines', '• Keep uniform and tools clean.\n• Take pre/post service photos.\n• Use zero-stain floor mats.')}
          >
            <View style={styles.menuIconBox}>
              <Ionicons name="shield-checkmark-outline" size={22} color={Colors.primary} />
            </View>
            <View style={styles.menuTextContainer}>
              <Text style={styles.menuText}>MyKaarigar Quality SOPs</Text>
              <Text style={styles.menuSubtext}>Service standards & safety rules</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.gray400} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color="#EF4444" />
          <Text style={styles.logoutText}>Log Out Account</Text>
        </TouchableOpacity>
        
        <Text style={styles.versionText}>MyKaarigar Partner Application • Version 2.4.0</Text>
      </ScrollView>

      {/* MODALS */}
      <Modal visible={activeModal === "personal"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Personal Information</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color={Colors.textDark} /></TouchableOpacity>
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
              <Text style={styles.modalTitle}>Shop / Garage Details</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color={Colors.textDark} /></TouchableOpacity>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shop / Garage Name</Text>
              <TextInput style={styles.input} value="Rahul Auto Care & Garage" editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Shop Address</Text>
              <TextInput style={styles.input} value="123, Main Market, Laxmi Nagar, Delhi - 110092" editable={false} multiline />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Service Radius</Text>
              <TextInput style={styles.input} value="10 KM" editable={false} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}><Text style={styles.saveBtnText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "bank"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Bank Payout Details</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color={Colors.textDark} /></TouchableOpacity>
            </View>
            <View style={styles.infoBanner}>
              <Ionicons name="information-circle" size={20} color={Colors.primary} />
              <Text style={styles.infoText}>Payouts are automatically settled weekly into this verified account.</Text>
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput style={styles.input} value="Punjab National Bank" editable={false} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput style={styles.input} value="XXXX-XXXX-9012" editable={false} />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setActiveModal(null)}><Text style={styles.saveBtnText}>Done</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={activeModal === "ratings"} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Customer Ratings</Text>
              <TouchableOpacity onPress={() => setActiveModal(null)}><Ionicons name="close" size={24} color={Colors.textDark} /></TouchableOpacity>
            </View>
            
            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>Vikram S. • Royal Enfield 350</Text>
                <View style={{flexDirection: "row"}}><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /></View>
              </View>
              <Text style={styles.reviewText}>"Punctual arrival! Handled bike breakdown very cleanly with floor mat protection."</Text>
            </View>

            <View style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewName}>Ankit K. • Honda Activa 6G</Text>
                <View style={{flexDirection: "row"}}><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /><Ionicons name="star" color="#F59E0B" size={14} /></View>
              </View>
              <Text style={styles.reviewText}>"Fast battery jumpstart and genuine engine oil replacement."</Text>
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
    backgroundColor: Colors.lightBackground,
  },
  content: {
    padding: 20,
    paddingTop: 54,
    paddingBottom: 40,
  },
  heroProfileCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  avatarPlaceholder: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    position: "relative",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: Colors.primary,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: Colors.cardBackground,
  },
  name: {
    fontSize: 20,
    fontWeight: "900",
    color: Colors.textDark,
    marginBottom: 3,
    letterSpacing: -0.3,
  },
  phone: {
    fontSize: 13,
    color: Colors.gray500,
    fontWeight: "500",
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    gap: 4,
  },
  ratingText: {
    color: "#B45309",
    fontWeight: "800",
    fontSize: 13,
  },
  ratingCount: {
    color: "#92400E",
    fontSize: 12,
    fontWeight: '600',
  },
  expBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.2)',
    gap: 4,
  },
  expText: {
    color: Colors.primaryDark,
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    color: Colors.gray500,
    marginBottom: 10,
    letterSpacing: 1,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    padding: 16,
    borderRadius: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  menuIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: Colors.primaryLight,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.textDark,
    marginBottom: 2,
  },
  menuSubtext: {
    fontSize: 12,
    color: Colors.gray500,
  },
  logoutBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 16,
    gap: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "800",
  },
  versionText: {
    textAlign: "center",
    color: Colors.gray400,
    fontSize: 11,
    marginBottom: 20,
    fontWeight: '500',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: Colors.cardBackground,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: Colors.gray200,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.textDark,
  },
  infoBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.primaryLight,
    padding: 12,
    borderRadius: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(249, 115, 22, 0.25)',
    gap: 8,
  },
  infoText: {
    color: Colors.textDark,
    fontSize: 12,
    flex: 1,
    fontWeight: '500',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    color: Colors.gray600,
    marginBottom: 6,
    fontWeight: "700",
  },
  input: {
    backgroundColor: Colors.lightBackground,
    borderWidth: 1,
    borderColor: Colors.gray200,
    borderRadius: 12,
    padding: 12,
    color: Colors.textDark,
    fontSize: 15,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 10,
  },
  saveBtnText: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "800",
  },
  reviewCard: {
    backgroundColor: Colors.lightBackground,
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.gray200,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: 'center',
    marginBottom: 6,
  },
  reviewName: {
    color: Colors.textDark,
    fontWeight: "700",
    fontSize: 13,
  },
  reviewText: {
    color: Colors.gray600,
    fontSize: 13,
    lineHeight: 18,
  },
});
