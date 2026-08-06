import { Feather } from "@expo/vector-icons";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MyServiceRequest, vehicleService } from "../../services/vehicleService";
import BackButton from "../ui/BackButton";

// ─── Props ────────────────────────────────────────────────────────────────────

interface MyRequestsScreenProps {
  onNavigate: (screen: string) => void;
}

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { bg: string; color: string; icon: keyof typeof Feather.glyphMap }> = {
  REQUEST_CREATED: { bg: "#eff6ff", color: "#2563eb", icon: "clock" },
  MECHANIC_ASSIGNED: { bg: "#f0fdf4", color: "#16a34a", icon: "user-check" },
  IN_PROGRESS: { bg: "#fffbeb", color: "#d97706", icon: "loader" },
  COMPLETED: { bg: "#f0fdf4", color: "#16a34a", icon: "check-circle" },
  CANCELLED: { bg: "#fef2f2", color: "#dc2626", icon: "x-circle" },
};

const getStatusConfig = (status: string) => {
  return STATUS_CONFIG[status] || { bg: "#f3f4f6", color: "#6b7280", icon: "circle" as keyof typeof Feather.glyphMap };
};

const formatStatus = (status: string) => {
  return status
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const getRequestTypeIcon = (type: string): keyof typeof Feather.glyphMap => {
  const lower = type.toLowerCase();
  if (lower.includes("routine")) return "settings";
  if (lower.includes("repair")) return "tool";
  if (lower.includes("inspection")) return "search";
  if (lower.includes("breakdown")) return "alert-triangle";
  return "file-text";
};

const getRequestTypeColor = (type: string): string => {
  const lower = type.toLowerCase();
  if (lower.includes("routine")) return "#f97316";
  if (lower.includes("repair")) return "#ea580c";
  if (lower.includes("inspection")) return "#8b5cf6";
  if (lower.includes("breakdown")) return "#ef4444";
  return "#6b7280";
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonCard() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(shimmer, { toValue: 0, duration: 800, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [shimmer]);

  const opacity = shimmer.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  return (
    <View style={styles.requestCard}>
      <Animated.View style={[styles.skeletonLine, { opacity, width: "50%", height: 16 }]} />
      <Animated.View style={[styles.skeletonLine, { opacity, width: "30%", height: 12, marginTop: 8 }]} />
      <View style={{ flexDirection: "row", marginTop: 12, gap: 16 }}>
        <Animated.View style={[styles.skeletonLine, { opacity, width: 80, height: 12 }]} />
        <Animated.View style={[styles.skeletonLine, { opacity, width: 80, height: 12 }]} />
      </View>
    </View>
  );
}

// ─── Request Card Component ───────────────────────────────────────────────────

function RequestCard({ item }: { item: MyServiceRequest }) {
  const statusConfig = getStatusConfig(item.status);
  const typeIcon = getRequestTypeIcon(item.requestType);
  const typeColor = getRequestTypeColor(item.requestType);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "—";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <View style={styles.requestCard}>
      {/* Header Row */}
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <View style={[styles.typeIconBg, { backgroundColor: typeColor + "15" }]}>
            <Feather name={typeIcon} size={18} color={typeColor} />
          </View>
          <View>
            <Text style={styles.requestNumber}>{item.requestNumber}</Text>
            <Text style={styles.requestType}>{item.requestType}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConfig.bg }]}>
          <Feather name={statusConfig.icon} size={12} color={statusConfig.color} />
          <Text style={[styles.statusText, { color: statusConfig.color }]}>{formatStatus(item.status)}</Text>
        </View>
      </View>

      {/* Details Row */}
      <View style={styles.cardDetails}>
        {item.preferredServiceDate ? (
          <View style={styles.detailItem}>
            <Feather name="calendar" size={13} color="#9ca3af" />
            <Text style={styles.detailText}>{formatDate(item.preferredServiceDate)}</Text>
          </View>
        ) : null}

        {item.serviceSlot ? (
          <View style={styles.detailItem}>
            <Feather name="clock" size={13} color="#9ca3af" />
            <Text style={styles.detailText}>{item.serviceSlot}</Text>
          </View>
        ) : null}
      </View>

      {/* Divider */}
      <View style={styles.cardDivider} />

      {/* Footer */}
      <View style={styles.cardFooter}>
        <View style={styles.detailItem}>
          <Feather name="truck" size={13} color="#9ca3af" />
          <Text style={styles.footerText}>
            {item.customerVehicleId ? `Vehicle: ${item.customerVehicleId.substring(0, 8)}...` : "—"}
          </Text>
        </View>
      </View>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MyRequestsScreen({ onNavigate }: MyRequestsScreenProps) {
  const [requests, setRequests] = useState<MyServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setLoading(true);
    setError(null);

    try {
      const data = await vehicleService.getMyServiceRequests();
      // Sort newest first
      const sorted = [...data].sort((a, b) => {
        // Sort by preferredServiceDate descending, then by requestNumber
        if (a.preferredServiceDate && b.preferredServiceDate) {
          return b.preferredServiceDate.localeCompare(a.preferredServiceDate);
        }
        return b.requestNumber.localeCompare(a.requestNumber);
      });
      setRequests(sorted);
    } catch (err: any) {
      console.warn("Failed to load service requests", err);
      setError(err?.message || "Unable to load requests. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadRequests(true);
  };

  // ── Loading State ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton style={styles.backButtonOverride} onPress={() => onNavigate("Home")} />
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.skeletonContainer}>
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </View>
      </View>
    );
  }

  // ── Error State ────────────────────────────────────────────────────────────

  if (error && requests.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <BackButton style={styles.backButtonOverride} onPress={() => onNavigate("Home")} />
          <Text style={styles.headerTitle}>My Bookings</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.centerContent}>
          <Feather name="wifi-off" size={48} color="#d1d5db" />
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => loadRequests()}>
            <Feather name="refresh-cw" size={16} color="#ffffff" />
            <Text style={styles.retryBtnText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton style={styles.backButtonOverride} onPress={() => onNavigate("Home")} />
        <Text style={styles.headerTitle}>My Bookings</Text>
        <TouchableOpacity onPress={() => onNavigate("Booking")} style={styles.newRequestBtn}>
          <Feather name="plus" size={18} color="#f97316" />
        </TouchableOpacity>
      </View>

      {/* Summary Bar */}
      {requests.length > 0 && (
        <View style={styles.summaryBar}>
          <Text style={styles.summaryText}>
            {requests.length} booking{requests.length !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity onPress={handleRefresh} style={styles.refreshBtn}>
            <Feather name="refresh-cw" size={14} color="#f97316" />
          </TouchableOpacity>
        </View>
      )}

      {requests.length === 0 ? (
        /* Empty State */
        <View style={styles.centerContent}>
          <View style={styles.emptyIcon}>
            <Feather name="inbox" size={48} color="#d1d5db" />
          </View>
          <Text style={styles.emptyTitle}>No Bookings Yet</Text>
          <Text style={styles.emptySubtitle}>
            You haven&apos;t booked any service yet.{"\n"}Book your first service now!
          </Text>
          <TouchableOpacity
            style={styles.bookNowBtn}
            onPress={() => onNavigate("Booking")}
            activeOpacity={0.8}
          >
            <Feather name="plus" size={18} color="#ffffff" />
            <Text style={styles.bookNowBtnText}>Book Service</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={requests}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RequestCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#f97316"
              colors={["#f97316"]}
            />
          }
        />
      )}
    </View>
  );
}

// ─── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  backButtonOverride: {
    marginTop: 0,
    marginBottom: 0,
  },
  newRequestBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff3eb",
    borderWidth: 1.5,
    borderColor: "#fed7aa",
    justifyContent: "center",
    alignItems: "center",
  },

  // ── Summary Bar ─────────────────────────────────────────────────────────
  summaryBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  summaryText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#6b7280",
  },
  refreshBtn: {
    padding: 6,
  },

  // ── List ────────────────────────────────────────────────────────────────
  listContent: {
    padding: 20,
    paddingBottom: 40,
  },

  // ── Request Card ────────────────────────────────────────────────────────
  requestCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    flex: 1,
  },
  typeIconBg: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  requestNumber: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
    letterSpacing: 0.3,
  },
  requestType: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
    gap: 4,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
  },

  // ── Card Details ────────────────────────────────────────────────────────
  cardDetails: {
    flexDirection: "row",
    marginTop: 14,
    gap: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  detailText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },

  // ── Card Divider & Footer ───────────────────────────────────────────────
  cardDivider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#9ca3af",
  },

  // ── Skeleton ────────────────────────────────────────────────────────────
  skeletonContainer: {
    padding: 20,
  },
  skeletonLine: {
    borderRadius: 6,
    backgroundColor: "#e5e7eb",
  },

  // ── Center Content ──────────────────────────────────────────────────────
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },

  // ── Empty State ─────────────────────────────────────────────────────────
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 21,
    marginBottom: 24,
  },
  bookNowBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
    gap: 8,
    shadowColor: "#f97316",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bookNowBtnText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },

  // ── Error State ─────────────────────────────────────────────────────────
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#374151",
    marginTop: 16,
  },
  errorMessage: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  retryBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f97316",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  retryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
