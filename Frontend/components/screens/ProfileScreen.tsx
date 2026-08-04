import { Feather } from "@expo/vector-icons";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import React, { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { auth } from "../../config/firebase";
import {
    AddressPayload,
    addressService,
    emptyAddressPayload,
    UserAddress,
} from "../../services/addressService";
import { api } from "../../services/api";
import { authService } from "../../services/authService";
import { CustomerVehicle, vehicleService } from "../../services/vehicleService";
import BackButton from "../ui/BackButton";
import BikeDetailSheet from "../ui/BikeDetailSheet";
import ConfirmModal from "../ui/ConfirmModal";
import InputField from "../ui/InputField";
import PrimaryButton from "../ui/PrimaryButton";

interface ProfileScreenProps {
  onNavigate: (screen: string) => void;
}

interface UserProfile {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  mobileNumber?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  mobileVerified: boolean;
}

export default function ProfileScreen({ onNavigate }: ProfileScreenProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Edit mobile / profile
  const [mobileNumber, setMobileNumber] = useState("");
  const [isEditingMobile, setIsEditingMobile] = useState(false);
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updatingPassword, setUpdatingPassword] = useState(false);

  // My Bikes
  const [myBikes, setMyBikes] = useState<CustomerVehicle[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [selectedBike, setSelectedBike] = useState<CustomerVehicle | null>(
    null,
  );
  const [sheetVisible, setSheetVisible] = useState(false);

  // Saved addresses
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addressModalVisible, setAddressModalVisible] = useState(false);
  const [editAddressId, setEditAddressId] = useState<string | null>(null);
  const [addressForm, setAddressForm] = useState<AddressPayload>({
    ...emptyAddressPayload,
    country: "India",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [addressDeleteTarget, setAddressDeleteTarget] = useState<string | null>(
    null,
  );
  const [deleteAddressConfirmVisible, setDeleteAddressConfirmVisible] =
    useState(false);

  // OTP Verification states
  const [showOtpSection, setShowOtpSection] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verificationProvider, setVerificationProvider] = useState<
    "FIREBASE" | "AWS_SNS"
  >("FIREBASE");
  const timerRef = useRef<any>(null);
  const confirmationResultRef = useRef<any>(null);

  useEffect(() => {
    fetchProfile();
    fetchBikes();
    fetchAddresses();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const fetchBikes = async () => {
    setLoadingBikes(true);
    try {
      const data = await vehicleService.getMyVehicles();
      setMyBikes(data);
    } catch {
      // silent fail — bikes section shows empty state
    } finally {
      setLoadingBikes(false);
    }
  };

  const fetchProfile = async () => {
    setLoadingProfile(true);
    try {
      const data = await api.get<UserProfile>("/users/me");
      setProfile(data);
      if (data.mobileNumber) {
        setMobileNumber(data.mobileNumber);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load profile details.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const data = await addressService.getMyAddresses();
      const sorted = [...data].sort(
        (a, b) => Number(b.defaultAddress) - Number(a.defaultAddress),
      );
      setAddresses(sorted);
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to load saved addresses.");
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleOpenAddAddress = () => {
    setEditAddressId(null);
    setAddressError("");
    setAddressForm({ ...emptyAddressPayload, country: "India" });
    setAddressModalVisible(true);
  };

  const handleOpenEditAddress = (address: UserAddress) => {
    setEditAddressId(address.id);
    setAddressError("");
    setAddressForm({
      label: address.label,
      houseNumber: address.houseNumber,
      buildingName: address.buildingName || "",
      street: address.street,
      landmark: address.landmark || "",
      city: address.city,
      state: address.state,
      country: address.country,
      pincode: address.pincode,
      latitude: address.latitude,
      longitude: address.longitude,
    });
    setAddressModalVisible(true);
  };

  const handleAddressFieldChange = (
    field: keyof AddressPayload,
    value: string,
  ) => {
    setAddressForm((prev) => ({ ...prev, [field]: value }));
  };

  const validateAddressForm = () => {
    if (!addressForm.label.trim()) return "Please enter an address label.";
    if (!addressForm.houseNumber.trim())
      return "Please enter the house or flat number.";
    if (!addressForm.street.trim()) return "Please enter the street or area.";
    if (!addressForm.city.trim()) return "Please enter the city.";
    if (!addressForm.state.trim()) return "Please enter the state.";
    if (!addressForm.pincode.trim()) return "Please enter the pincode.";
    return "";
  };

  const handleSaveAddress = async () => {
    const validationError = validateAddressForm();
    if (validationError) {
      setAddressError(validationError);
      return;
    }

    setSavingAddress(true);
    try {
      const payload: AddressPayload = {
        ...addressForm,
        label: addressForm.label.trim(),
        houseNumber: addressForm.houseNumber.trim(),
        buildingName: addressForm.buildingName.trim(),
        street: addressForm.street.trim(),
        landmark: addressForm.landmark.trim(),
        city: addressForm.city.trim(),
        state: addressForm.state.trim(),
        country: addressForm.country.trim() || "India",
        pincode: addressForm.pincode.trim(),
        latitude: addressForm.latitude,
        longitude: addressForm.longitude,
      };

      if (editAddressId) {
        await addressService.updateAddress(editAddressId, payload);
      } else {
        const created = await addressService.createAddress(payload);
        if (addresses.length === 0) {
          await addressService.setDefaultAddress(created.id);
        }
      }

      setAddressModalVisible(false);
      setEditAddressId(null);
      setAddressForm({ ...emptyAddressPayload, country: "India" });
      await fetchAddresses();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to save address.");
    } finally {
      setSavingAddress(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      await addressService.setDefaultAddress(addressId);
      await fetchAddresses();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update default address.");
    }
  };

  const handleDeleteAddressPress = (addressId: string) => {
    setAddressDeleteTarget(addressId);
    setDeleteAddressConfirmVisible(true);
  };

  const confirmDeleteAddress = async () => {
    if (!addressDeleteTarget) return;

    try {
      await addressService.deleteAddress(addressDeleteTarget);
      setDeleteAddressConfirmVisible(false);
      setAddressDeleteTarget(null);
      await fetchAddresses();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to delete address.");
    }
  };

  const startCooldownTimer = (seconds: number = 60) => {
    setCooldown(seconds);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const calculateCompletion = (): number => {
    if (!profile) return 50;
    let score = 0;
    if (profile.firstName) score += 25;
    if (profile.emailVerified) score += 25;
    if (profile.mobileNumber && profile.mobileNumber.trim().length >= 10)
      score += 25;
    if (profile.mobileVerified) score += 25;
    return score;
  };

  const completionPercentage = calculateCompletion();

  const handleSaveMobileNumber = async () => {
    const cleanMobile = mobileNumber.trim();
    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(cleanMobile)) {
      alert(
        "Please enter a valid 10-digit Indian mobile number starting with 6-9.",
      );
      return;
    }

    if (!profile) return;

    setUpdatingProfile(true);
    try {
      const updated = await api.put<UserProfile>("/users/me", {
        firstName: profile.firstName,
        lastName: profile.lastName || "",
        mobileNumber: cleanMobile,
      });
      setProfile(updated);
      setIsEditingMobile(false);
      alert("Mobile number updated successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to update mobile number.");
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleSendOtp = async () => {
    if (!profile?.mobileNumber || profile.mobileNumber.trim().length < 10) {
      alert("Please save a valid mobile number first before requesting OTP.");
      setIsEditingMobile(true);
      return;
    }

    setSendingOtp(true);
    try {
      const response: any = await api.post("/mobile-verification/send-otp", {});
      setShowOtpSection(true);
      startCooldownTimer(60);

      const isFirebase =
        response?.clientShouldInitiateFirebase ||
        response?.provider === "FIREBASE";
      if (isFirebase) {
        setVerificationProvider("FIREBASE");
        let formattedPhone = profile.mobileNumber.trim();
        if (!formattedPhone.startsWith("+")) {
          formattedPhone = `+91${formattedPhone}`;
        }

        try {
          const isLocalWeb =
            Platform.OS === "web" &&
            typeof window !== "undefined" &&
            (window.location.hostname === "localhost" ||
              window.location.hostname === "127.0.0.1");
          const shouldUseRecaptcha = !isLocalWeb;

          let recaptchaVerifier: any = (window as any).recaptchaVerifier;
          if (
            shouldUseRecaptcha &&
            typeof document !== "undefined" &&
            document.body
          ) {
            try {
              let container = document.getElementById("recaptcha-container");
              if (!container) {
                container = document.createElement("div");
                container.id = "recaptcha-container";
                container.style.margin = "10px 0";
                document.body.appendChild(container);
              }
              if (!recaptchaVerifier) {
                recaptchaVerifier = new RecaptchaVerifier(
                  auth,
                  "recaptcha-container",
                  {
                    size: "normal",
                    callback: (response: any) => {
                      console.log("reCAPTCHA solved successfully:", response);
                    },
                    "expired-callback": () => {
                      console.warn("reCAPTCHA expired.");
                    },
                  },
                );
                (window as any).recaptchaVerifier = recaptchaVerifier;
              }
            } catch (err) {
              console.warn("Web RecaptchaVerifier init failed:", err);
            }
          }

          if (!recaptchaVerifier) {
            console.log(
              isLocalWeb
                ? "Using test-mode verifier for local web OTP flow."
                : "Falling back to a mock verifier for OTP testing.",
            );
            recaptchaVerifier = {
              type: "recaptcha",
              verify: async () => "fake-recaptcha-token",
              _reset: () => {},
              _resetRecaptchaToken: () => {},
              clear: () => {},
            };
          }

          console.log("Initiating signInWithPhoneNumber for:", formattedPhone);
          const confirmation = await signInWithPhoneNumber(
            auth,
            formattedPhone,
            recaptchaVerifier,
          );
          confirmationResultRef.current = confirmation;
          alert(
            `📩 Firebase OTP sent to ${formattedPhone}.\nPlease enter the 6-digit OTP code received on your phone.`,
          );
        } catch (firebaseErr: any) {
          console.error("Firebase signInWithPhoneNumber error:", firebaseErr);
          alert(
            `⚠️ Firebase SMS Error: ${firebaseErr.message || firebaseErr.code || "Failed to send SMS OTP via Firebase."}`,
          );
        }
      } else {
        setVerificationProvider("AWS_SNS");
        alert(`📩 OTP sent to +91 ${profile.mobileNumber}.`);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (cooldown > 0) return;

    setSendingOtp(true);
    try {
      if (verificationProvider === "FIREBASE") {
        alert("Resend OTP initiated via Firebase.");
      } else {
        await api.post("/mobile-verification/resend-otp", {});
      }
      startCooldownTimer(60);
      alert("📩 Resent OTP to your mobile number.");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to resend OTP.");
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const cleanOtp = otpCode.trim();
    if (!cleanOtp) {
      alert("Please enter the OTP code or Firebase ID Token.");
      return;
    }

    setVerifyingOtp(true);
    try {
      if (verificationProvider === "FIREBASE") {
        let tokenToSubmit = "";

        if (
          confirmationResultRef.current &&
          typeof confirmationResultRef.current.confirm === "function"
        ) {
          try {
            const userCredential =
              await confirmationResultRef.current.confirm(cleanOtp);
            tokenToSubmit = await userCredential.user.getIdToken();
          } catch (confirmErr: any) {
            console.error("Firebase OTP confirm error:", confirmErr);
            alert(
              `⚠️ Firebase Verification Failed: ${confirmErr.message || "Invalid 6-digit OTP code."}`,
            );
            return;
          }
        } else {
          // If no Firebase confirmation object exists (e.g. testing in dev mode or direct token input)
          tokenToSubmit = cleanOtp;
        }

        // Submit JWT token to Backend /mobile-verification/verify-firebase-token
        await api.post("/mobile-verification/verify-firebase-token", {
          firebaseIdToken: tokenToSubmit,
        });
      } else {
        await api.post("/mobile-verification/verify-otp", { otp: cleanOtp });
      }

      alert(
        "🎉 Mobile number verified successfully! Profile is now 100% complete.",
      );
      setShowOtpSection(false);
      setOtpCode("");
      // Refresh profile to reflect mobileVerified: true
      await fetchProfile();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Invalid or expired OTP / Token. Please try again.");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword) {
      alert("Current Password is required");
      return;
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      alert(
        "New password must be at least 8 characters, and contain at least one uppercase letter, one lowercase letter, one number, and one special character.",
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match");
      return;
    }

    setUpdatingPassword(true);
    try {
      await api.put("/users/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });
      alert("🎉 Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Failed to change password. Please try again.");
    } finally {
      setUpdatingPassword(false);
    }
  };

  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);

  const performLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
    } finally {
      setLoggingOut(false);
      onNavigate("Login");
    }
  };

  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };

  const handleConfirmLogout = () => {
    setLogoutConfirmVisible(false);
    performLogout();
  };

  return (
    <View style={styles.screenContainer}>
      <View style={styles.profileHeader}>
        <BackButton
          style={styles.backButtonOverride}
          onPress={() => onNavigate("Home")}
        />
        <Text style={styles.profileTitle}>My Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingProfile ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#f97316" size="large" />
            <Text style={styles.loadingText}>Fetching profile details...</Text>
          </View>
        ) : (
          profile && (
            <>
              {/* Profile Completion Progress Header */}
              <View style={styles.completionHeaderCard}>
                <View style={styles.completionRow}>
                  <View style={styles.completionTextContainer}>
                    <Text style={styles.completionCardTitle}>
                      Profile Completion
                    </Text>
                    <Text style={styles.completionCardSub}>
                      {completionPercentage === 100
                        ? "Your profile is 100% verified and complete!"
                        : "Verify mobile number to get 100% profile score."}
                    </Text>
                  </View>
                  <View style={styles.percentageCircle}>
                    <Text style={styles.percentageCircleText}>
                      {completionPercentage}%
                    </Text>
                  </View>
                </View>

                {/* Progress bar track */}
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${completionPercentage}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Profile details card */}
              <View style={styles.detailsCard}>
                <View style={styles.avatarRow}>
                  <View style={styles.avatarBox}>
                    <Text style={styles.avatarText}>
                      {profile.firstName.charAt(0).toUpperCase()}
                      {profile.lastName
                        ? profile.lastName.charAt(0).toUpperCase()
                        : ""}
                    </Text>
                  </View>
                  <View style={styles.avatarDetails}>
                    <Text style={styles.userName}>
                      {profile.firstName} {profile.lastName || ""}
                    </Text>
                    <Text style={styles.userRole}>{profile.role}</Text>
                  </View>
                </View>

                <View style={styles.divider} />

                {/* Email info */}
                <View style={styles.infoRow}>
                  <Feather
                    name="mail"
                    size={18}
                    color="#6b7280"
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>EMAIL ADDRESS</Text>
                    <Text style={styles.infoValue}>{profile.email}</Text>
                  </View>
                  <View
                    style={[
                      styles.badge,
                      profile.emailVerified
                        ? styles.verifiedBadge
                        : styles.unverifiedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        profile.emailVerified
                          ? styles.verifiedText
                          : styles.unverifiedText,
                      ]}
                    >
                      {profile.emailVerified ? "Verified ✓" : "Unverified"}
                    </Text>
                  </View>
                </View>

                {/* Mobile info & edit */}
                <View style={styles.infoRow}>
                  <Feather
                    name="phone"
                    size={18}
                    color="#6b7280"
                    style={styles.infoIcon}
                  />
                  <View style={styles.infoTextContainer}>
                    <Text style={styles.infoLabel}>MOBILE NUMBER</Text>
                    {isEditingMobile ? (
                      <TextInput
                        style={styles.mobileInput}
                        value={mobileNumber}
                        onChangeText={setMobileNumber}
                        keyboardType="phone-pad"
                        placeholder="Enter 10-digit mobile"
                        maxLength={10}
                      />
                    ) : (
                      <Text style={styles.infoValue}>
                        {profile.mobileNumber || "Not provided"}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.badge,
                      profile.mobileVerified
                        ? styles.verifiedBadge
                        : styles.unverifiedBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.badgeText,
                        profile.mobileVerified
                          ? styles.verifiedText
                          : styles.unverifiedText,
                      ]}
                    >
                      {profile.mobileVerified ? "Verified ✓" : "Unverified"}
                    </Text>
                  </View>
                </View>

                {/* Edit Mobile / Save Mobile Actions */}
                {!profile.mobileVerified && (
                  <View style={styles.mobileActionsContainer}>
                    {isEditingMobile ? (
                      <TouchableOpacity
                        style={styles.saveMobileButton}
                        onPress={handleSaveMobileNumber}
                        disabled={updatingProfile}
                      >
                        {updatingProfile ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Text style={styles.saveMobileButtonText}>
                            Save Mobile Number
                          </Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.actionButtonsRow}>
                        <TouchableOpacity
                          style={styles.editMobileButton}
                          onPress={() => setIsEditingMobile(true)}
                        >
                          <Feather
                            name="edit-2"
                            size={14}
                            color="#374151"
                            style={{ marginRight: 4 }}
                          />
                          <Text style={styles.editMobileButtonText}>
                            {profile.mobileNumber
                              ? "Change Number"
                              : "Add Number"}
                          </Text>
                        </TouchableOpacity>

                        {!showOtpSection && (
                          <TouchableOpacity
                            style={styles.sendOtpButton}
                            onPress={handleSendOtp}
                            disabled={sendingOtp}
                          >
                            {sendingOtp ? (
                              <ActivityIndicator color="#ffffff" size="small" />
                            ) : (
                              <>
                                <Feather
                                  name="send"
                                  size={14}
                                  color="#ffffff"
                                  style={{ marginRight: 6 }}
                                />
                                <Text style={styles.sendOtpButtonText}>
                                  Send OTP
                                </Text>
                              </>
                            )}
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                )}
              </View>

              {/* OTP Verification Section / Card */}
              {showOtpSection && !profile.mobileVerified && (
                <View style={styles.otpCard}>
                  <View style={styles.otpCardHeader}>
                    <View style={styles.otpIconBox}>
                      <Feather name="shield" size={20} color="#f97316" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.otpTitle}>
                        Mobile OTP Verification
                      </Text>
                      <Text style={styles.otpSubtitle}>
                        Enter 6-digit code sent to +91 {profile.mobileNumber}
                      </Text>
                    </View>
                    <TouchableOpacity onPress={() => setShowOtpSection(false)}>
                      <Feather name="x" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                  </View>

                  {/* Local Testing / Firebase Banner */}
                  <View style={styles.localTestingBanner}>
                    <Feather
                      name="info"
                      size={14}
                      color="#2563eb"
                      style={{ marginRight: 6 }}
                    />
                    <Text style={styles.localTestingText}>
                      {verificationProvider === "FIREBASE"
                        ? "Firebase Authentication: Enter the OTP received on your mobile or test ID token."
                        : "Expo Local Testing: Check backend terminal logs for the 6-digit OTP code."}
                    </Text>
                  </View>

                  {/* OTP Code Input */}
                  <View style={styles.otpInputRow}>
                    <TextInput
                      style={styles.otpCodeInput}
                      value={otpCode}
                      onChangeText={setOtpCode}
                      placeholder="Enter 6-digit OTP"
                      placeholderTextColor="#9ca3af"
                      keyboardType="number-pad"
                      maxLength={6}
                    />
                  </View>

                  {/* Actions */}
                  <PrimaryButton
                    title="Verify OTP Code"
                    loading={verifyingOtp}
                    onPress={handleVerifyOtp}
                    style={{ marginTop: 12 }}
                  />

                  <View style={styles.resendRow}>
                    <Text style={styles.resendLabel}>
                      {"Didn't receive code? "}
                    </Text>
                    <TouchableOpacity
                      onPress={handleResendOtp}
                      disabled={cooldown > 0 || sendingOtp}
                    >
                      <Text
                        style={[
                          styles.resendLink,
                          (cooldown > 0 || sendingOtp) && { color: "#9ca3af" },
                        ]}
                      >
                        {cooldown > 0
                          ? `Resend OTP in ${cooldown}s`
                          : "Resend OTP"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Saved Addresses */}
              <View style={styles.addressCard}>
                <View style={styles.sectionHeaderRow}>
                  <View style={styles.sectionTitleGroup}>
                    <View style={styles.sectionIconBox}>
                      <Feather name="map-pin" size={16} color="#f97316" />
                    </View>
                    <Text style={styles.sectionTitle}>Saved Addresses</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addAddressButton}
                    onPress={handleOpenAddAddress}
                  >
                    <Feather name="plus" size={14} color="#ffffff" />
                    <Text style={styles.addAddressButtonText}>Add</Text>
                  </TouchableOpacity>
                </View>

                {loadingAddresses ? (
                  <View style={styles.addressLoader}>
                    <ActivityIndicator size="small" color="#f97316" />
                    <Text style={styles.addressLoaderText}>
                      Loading your addresses...
                    </Text>
                  </View>
                ) : addresses.length === 0 ? (
                  <View style={styles.addressEmptyState}>
                    <View style={styles.addressEmptyIconCircle}>
                      <Feather name="map-pin" size={24} color="#d1d5db" />
                    </View>
                    <Text style={styles.addressEmptyTitle}>
                      No saved addresses yet
                    </Text>
                    <Text style={styles.addressEmptySubtitle}>
                      Add your home, work or favorite spot for faster bookings.
                    </Text>
                    <TouchableOpacity
                      style={styles.addressEmptyCta}
                      onPress={handleOpenAddAddress}
                    >
                      <Feather name="plus-circle" size={14} color="#f97316" />
                      <Text style={styles.addressEmptyCtaText}>
                        Add Your First Address
                      </Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.addressList}>
                    {addresses.map((address) => (
                      <View key={address.id} style={styles.addressItem}>
                        <View style={styles.addressItemContent}>
                          <View style={styles.addressTopRow}>
                            <View style={styles.addressLabelRow}>
                              <Text style={styles.addressLabel}>
                                {address.label}
                              </Text>
                              {address.defaultAddress ? (
                                <View style={styles.defaultBadgeSmall}>
                                  <Text style={styles.defaultBadgeSmallText}>
                                    Default
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                            <TouchableOpacity
                              onPress={() => handleOpenEditAddress(address)}
                            >
                              <Feather
                                name="edit-3"
                                size={15}
                                color="#f97316"
                              />
                            </TouchableOpacity>
                          </View>

                          <Text style={styles.addressDetails}>
                            {[
                              address.houseNumber,
                              address.buildingName,
                              address.street,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </Text>
                          <Text style={styles.addressMeta}>
                            {[
                              address.landmark,
                              address.city,
                              address.state,
                              address.pincode,
                              address.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </Text>
                        </View>

                        <View style={styles.addressActionsRow}>
                          {!address.defaultAddress && (
                            <TouchableOpacity
                              style={styles.secondaryActionButton}
                              onPress={() =>
                                handleSetDefaultAddress(address.id)
                              }
                            >
                              <Feather name="star" size={13} color="#f97316" />
                              <Text style={styles.secondaryActionText}>
                                Set default
                              </Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity
                            style={styles.dangerActionButton}
                            onPress={() => handleDeleteAddressPress(address.id)}
                          >
                            <Feather name="trash-2" size={13} color="#ef4444" />
                            <Text style={styles.dangerActionText}>Delete</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </View>

              {/* Password change card */}
              <View style={styles.passwordCard}>
                <Text style={styles.sectionTitle}>Change Password</Text>

                <InputField
                  iconName="lock"
                  placeholder="Current Password"
                  isPassword
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  autoCapitalize="none"
                />

                <InputField
                  iconName="lock"
                  placeholder="New Password"
                  isPassword
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />

                <InputField
                  iconName="lock"
                  placeholder="Confirm New Password"
                  isPassword
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />

                <PrimaryButton
                  title="Update Password"
                  loading={updatingPassword}
                  style={{ marginTop: 8 }}
                  onPress={handleChangePassword}
                />
              </View>

              {/* ── My Bikes Section ─────────────────────────────────────── */}
              <View style={styles.bikesCard}>
                {/* Header row */}
                <View style={styles.bikesSectionHeader}>
                  <View style={styles.bikesSectionTitleGroup}>
                    <View style={styles.bikesIconBox}>
                      <Feather name="zap" size={16} color="#f97316" />
                    </View>
                    <Text style={styles.sectionTitle}>My Bikes</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.addBikeButton}
                    onPress={() => onNavigate("AddBike")}
                    activeOpacity={0.8}
                  >
                    <Feather name="plus" size={14} color="#ffffff" />
                    <Text style={styles.addBikeButtonText}>Add Bike</Text>
                  </TouchableOpacity>
                </View>

                {/* Content */}
                {loadingBikes ? (
                  <View style={styles.bikesLoader}>
                    <ActivityIndicator size="small" color="#f97316" />
                    <Text style={styles.bikesLoaderText}>
                      Loading your bikes...
                    </Text>
                  </View>
                ) : myBikes.length === 0 ? (
                  /* Empty state */
                  <TouchableOpacity
                    style={styles.bikesEmptyState}
                    onPress={() => onNavigate("AddBike")}
                    activeOpacity={0.8}
                  >
                    <View style={styles.bikesEmptyIconCircle}>
                      <Feather name="zap-off" size={28} color="#d1d5db" />
                    </View>
                    <Text style={styles.bikesEmptyTitle}>
                      No bikes added yet
                    </Text>
                    <Text style={styles.bikesEmptySubtitle}>
                      Add your bike to get faster service bookings
                    </Text>
                    <View style={styles.bikesEmptyCta}>
                      <Feather name="plus-circle" size={14} color="#f97316" />
                      <Text style={styles.bikesEmptyCtaText}>
                        Add Your First Bike
                      </Text>
                    </View>
                  </TouchableOpacity>
                ) : (
                  /* Bike list */
                  <View style={styles.bikesList}>
                    {myBikes.map((bike, index) => (
                      <TouchableOpacity
                        key={bike.id}
                        style={[
                          styles.bikeItem,
                          index < myBikes.length - 1 && styles.bikeItemBorder,
                        ]}
                        onPress={() => {
                          setSelectedBike(bike);
                          setSheetVisible(true);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.bikeItemLeft}>
                          <View style={styles.bikeItemIconCircle}>
                            <Feather name="zap" size={16} color="#f97316" />
                          </View>
                          <View style={styles.bikeItemInfo}>
                            <View style={styles.bikeNameRow}>
                              <Text style={styles.bikeItemName}>
                                {bike.brandName} {bike.modelName}
                              </Text>
                              {bike.isDefault && (
                                <View style={styles.defaultBadge}>
                                  <Text style={styles.defaultBadgeText}>
                                    Default
                                  </Text>
                                </View>
                              )}
                            </View>
                            <Text style={styles.bikeItemReg}>
                              {bike.registrationNumber}
                            </Text>
                            <Text style={styles.bikeItemOdometer}>
                              {bike.odometerKm.toLocaleString()} km
                              {bike.color ? `  •  ${bike.color}` : ""}
                              {bike.manufacturingYear
                                ? `  •  ${bike.manufacturingYear}`
                                : ""}
                            </Text>
                          </View>
                        </View>
                        <Feather
                          name="chevron-right"
                          size={16}
                          color="#f97316"
                        />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              {/* Logout button */}
              <TouchableOpacity
                style={[
                  styles.logoutButton,
                  loggingOut && styles.logoutButtonDisabled,
                ]}
                onPress={handleLogout}
                disabled={loggingOut}
              >
                {loggingOut ? (
                  <ActivityIndicator
                    size="small"
                    color="#ef4444"
                    style={{ marginRight: 8 }}
                  />
                ) : (
                  <Feather
                    name="log-out"
                    size={18}
                    color="#ef4444"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={styles.logoutText}>
                  {loggingOut ? "Logging out..." : "Log Out"}
                </Text>
              </TouchableOpacity>

              <ConfirmModal
                visible={logoutConfirmVisible}
                title="Log out?"
                message="You will be signed out of BikeDone on this device. You can log back in anytime."
                confirmText="Yes, Log Out"
                cancelText="Stay Logged In"
                confirmDestructive
                icon="log-out"
                onConfirm={handleConfirmLogout}
                onCancel={() => setLogoutConfirmVisible(false)}
              />

              <ConfirmModal
                visible={deleteAddressConfirmVisible}
                title="Delete address?"
                message="This address will be removed from your saved list."
                confirmText="Delete"
                cancelText="Keep"
                confirmDestructive
                icon="trash-2"
                onConfirm={confirmDeleteAddress}
                onCancel={() => {
                  setDeleteAddressConfirmVisible(false);
                  setAddressDeleteTarget(null);
                }}
              />

              <Modal
                visible={addressModalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setAddressModalVisible(false)}
              >
                <View style={styles.modalBackdrop}>
                  <KeyboardAvoidingView
                    style={styles.modalContainer}
                    behavior={Platform.OS === "ios" ? "padding" : undefined}
                  >
                    <View style={styles.modalCard}>
                      <View style={styles.modalHeader}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.modalTitle}>
                            {editAddressId ? "Edit address" : "Add new address"}
                          </Text>
                          <Text style={styles.modalSubtitle}>
                            Save where you want service to be delivered.
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => setAddressModalVisible(false)}
                        >
                          <Feather name="x" size={18} color="#6b7280" />
                        </TouchableOpacity>
                      </View>

                      {addressError ? (
                        <View style={styles.errorBanner}>
                          <Feather
                            name="alert-circle"
                            size={14}
                            color="#dc2626"
                          />
                          <Text style={styles.errorText}>{addressError}</Text>
                        </View>
                      ) : null}

                      <ScrollView
                        style={styles.formScroll}
                        keyboardShouldPersistTaps="handled"
                      >
                        <Text style={styles.inputLabel}>Address label</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.label}
                          onChangeText={(value) =>
                            handleAddressFieldChange("label", value)
                          }
                          placeholder="Home / Office / Other"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>
                          House / Flat number
                        </Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.houseNumber}
                          onChangeText={(value) =>
                            handleAddressFieldChange("houseNumber", value)
                          }
                          placeholder="A-101"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>
                          Building / Apartment
                        </Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.buildingName}
                          onChangeText={(value) =>
                            handleAddressFieldChange("buildingName", value)
                          }
                          placeholder="Rosewood Apartments"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>Street / Area</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.street}
                          onChangeText={(value) =>
                            handleAddressFieldChange("street", value)
                          }
                          placeholder="Main Street"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>Landmark</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.landmark}
                          onChangeText={(value) =>
                            handleAddressFieldChange("landmark", value)
                          }
                          placeholder="Near Metro Station"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>City</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.city}
                          onChangeText={(value) =>
                            handleAddressFieldChange("city", value)
                          }
                          placeholder="Mumbai"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>State</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.state}
                          onChangeText={(value) =>
                            handleAddressFieldChange("state", value)
                          }
                          placeholder="Maharashtra"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>Pincode</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.pincode}
                          onChangeText={(value) =>
                            handleAddressFieldChange("pincode", value)
                          }
                          placeholder="400001"
                          keyboardType="number-pad"
                          placeholderTextColor="#9ca3af"
                        />

                        <Text style={styles.inputLabel}>Country</Text>
                        <TextInput
                          style={styles.inputField}
                          value={addressForm.country}
                          onChangeText={(value) =>
                            handleAddressFieldChange("country", value)
                          }
                          placeholder="India"
                          placeholderTextColor="#9ca3af"
                        />
                      </ScrollView>

                      <View style={styles.modalActions}>
                        <TouchableOpacity
                          style={styles.cancelAddressButton}
                          onPress={() => setAddressModalVisible(false)}
                        >
                          <Text style={styles.cancelAddressButtonText}>
                            Cancel
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.saveAddressButton}
                          onPress={handleSaveAddress}
                          disabled={savingAddress}
                        >
                          {savingAddress ? (
                            <ActivityIndicator size="small" color="#ffffff" />
                          ) : (
                            <Text style={styles.saveAddressButtonText}>
                              {editAddressId ? "Save changes" : "Save address"}
                            </Text>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </KeyboardAvoidingView>
                </View>
              </Modal>

              {/* Bike Detail Sheet */}
              <BikeDetailSheet
                bike={selectedBike}
                visible={sheetVisible}
                onClose={() => setSheetVisible(false)}
                onUpdated={(updated) => {
                  setMyBikes((prev) =>
                    prev.map((b) =>
                      b.id === updated.id
                        ? updated
                        : updated.isDefault
                          ? { ...b, isDefault: false }
                          : b,
                    ),
                  );
                  setSelectedBike(updated);
                }}
                onDeleted={(vehicleId) => {
                  setMyBikes((prev) => prev.filter((b) => b.id !== vehicleId));
                  setSheetVisible(false);
                }}
              />
            </>
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 24,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  profileTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    marginLeft: 16,
  },
  backButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 24,
    paddingBottom: 40,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#6b7280",
    fontSize: 14,
  },
  completionHeaderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#ffedd5",
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  completionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  completionTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  completionCardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
  },
  completionCardSub: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  percentageCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff3eb",
    borderWidth: 2,
    borderColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
  },
  percentageCircleText: {
    color: "#f97316",
    fontWeight: "bold",
    fontSize: 13,
  },
  progressTrack: {
    height: 8,
    backgroundColor: "#f3f4f6",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#f97316",
    borderRadius: 4,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  avatarRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff3eb",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ffe4c6",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#f97316",
  },
  avatarDetails: {
    marginLeft: 16,
  },
  userName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  userRole: {
    fontSize: 12,
    color: "#f97316",
    fontWeight: "600",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#e5e7eb",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  infoIcon: {
    marginRight: 12,
  },
  infoTextContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#9ca3af",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
    marginTop: 2,
  },
  mobileInput: {
    height: 38,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 14,
    color: "#111827",
    marginTop: 4,
    backgroundColor: "#ffffff",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  verifiedBadge: {
    backgroundColor: "#dcfce7",
  },
  unverifiedBadge: {
    backgroundColor: "#fee2e2",
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "bold",
  },
  verifiedText: {
    color: "#16a34a",
  },
  unverifiedText: {
    color: "#dc2626",
  },
  mobileActionsContainer: {
    marginTop: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderColor: "#f3f4f6",
  },
  actionButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  editMobileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  editMobileButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  saveMobileButton: {
    backgroundColor: "#3b82f6",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  saveMobileButtonText: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 13,
  },
  sendOtpButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  sendOtpButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  otpCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 2,
    borderColor: "#f97316",
    marginBottom: 20,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  otpCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  otpIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff3eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  otpTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
  },
  otpSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  localTestingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  localTestingText: {
    fontSize: 11,
    color: "#1e40af",
    flex: 1,
    lineHeight: 16,
  },
  otpInputRow: {
    marginBottom: 12,
  },
  otpCodeInput: {
    height: 50,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: 4,
    textAlign: "center",
    backgroundColor: "#fafafa",
  },
  resendRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  resendLabel: {
    fontSize: 12,
    color: "#6b7280",
  },
  resendLink: {
    fontSize: 12,
    color: "#f97316",
    fontWeight: "bold",
  },
  addressCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sectionIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff3eb",
    justifyContent: "center",
    alignItems: "center",
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: "#f97316",
    gap: 4,
  },
  addAddressButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  addressLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 8,
  },
  addressLoaderText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  addressEmptyState: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  addressEmptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  addressEmptyTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  addressEmptySubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    paddingHorizontal: 18,
    lineHeight: 18,
    marginTop: 4,
  },
  addressEmptyCta: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff3eb",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  addressEmptyCtaText: {
    color: "#f97316",
    fontSize: 12,
    fontWeight: "bold",
  },
  addressList: {
    gap: 12,
  },
  addressItem: {
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
    padding: 12,
    backgroundColor: "#fafafa",
  },
  addressItemContent: {
    marginBottom: 10,
  },
  addressTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  addressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#111827",
  },
  defaultBadgeSmall: {
    backgroundColor: "#fff3eb",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  defaultBadgeSmallText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ea580c",
  },
  addressDetails: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginBottom: 2,
  },
  addressMeta: {
    fontSize: 12,
    color: "#6b7280",
    lineHeight: 18,
  },
  addressActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  secondaryActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#fff7ed",
  },
  secondaryActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f97316",
  },
  dangerActionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
  },
  dangerActionText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#ef4444",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.6)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 24,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    marginBottom: 12,
  },
  errorText: {
    flex: 1,
    color: "#b91c1c",
    fontSize: 12,
  },
  formScroll: {
    maxHeight: 420,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
    marginTop: 10,
    marginBottom: 6,
  },
  inputField: {
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#111827",
    backgroundColor: "#fafafa",
  },
  modalActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelAddressButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f9fafb",
  },
  cancelAddressButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
  },
  saveAddressButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f97316",
  },
  saveAddressButtonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#ffffff",
  },
  passwordCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 16,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 52,
    borderWidth: 1,
    borderColor: "#fee2e2",
    backgroundColor: "#fff5f5",
    borderRadius: 12,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    color: "#ef4444",
    fontSize: 14,
    fontWeight: "bold",
  },

  // ── My Bikes ──────────────────────────────────────────────────────────────
  bikesCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  bikesSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bikesSectionTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  bikesIconBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#fff3eb",
    justifyContent: "center",
    alignItems: "center",
  },
  addBikeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 5,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  addBikeButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "bold",
  },
  bikesLoader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    gap: 10,
  },
  bikesLoaderText: {
    fontSize: 13,
    color: "#9ca3af",
  },
  bikesEmptyState: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fafafa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderStyle: "dashed",
  },
  bikesEmptyIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  bikesEmptyTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 4,
  },
  bikesEmptySubtitle: {
    fontSize: 12,
    color: "#9ca3af",
    textAlign: "center",
    paddingHorizontal: 24,
    marginBottom: 16,
    lineHeight: 18,
  },
  bikesEmptyCta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#fff3eb",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  bikesEmptyCtaText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#f97316",
  },
  bikesList: {
    gap: 0,
  },
  bikeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
  },
  bikeItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  bikeItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  bikeItemIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#fff3eb",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bikeItemInfo: {
    flex: 1,
  },
  bikeNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  bikeItemName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  defaultBadge: {
    backgroundColor: "#fff3eb",
    borderWidth: 1,
    borderColor: "#fed7aa",
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ea580c",
  },
  bikeItemReg: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "600",
    marginTop: 2,
  },
  bikeItemOdometer: {
    fontSize: 11,
    color: "#9ca3af",
    marginTop: 2,
  },
});
