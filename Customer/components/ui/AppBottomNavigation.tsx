import { Feather } from "@expo/vector-icons";
import React, { useState, useEffect } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { vehicleService, MyServiceRequest } from "../../services/vehicleService";

type MainScreen = "Home" | "MyRequests" | "Garage" | "Profile" | "FullProfile";

interface AppBottomNavigationProps {
  activeScreen: MainScreen;
  onNavigate: (screen: any, params?: any) => void;
  activeRequest?: MyServiceRequest | null;
}

const NAV_ITEMS: Array<{
  screen: MainScreen;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  { screen: "Home", label: "Home", icon: "home" },
  { screen: "MyRequests", label: "Activity", icon: "clock" },
  { screen: "Garage", label: "Garage", icon: "tool" },
  { screen: "Profile", label: "Support", icon: "user" },
];

export default function AppBottomNavigation({
  activeScreen,
  onNavigate,
  activeRequest: propActiveRequest,
}: AppBottomNavigationProps) {
  const [activeRequest, setActiveRequest] = useState<MyServiceRequest | null>(propActiveRequest || null);

  useEffect(() => {
    if (propActiveRequest !== undefined) {
      setActiveRequest(propActiveRequest);
    }
  }, [propActiveRequest]);

  useEffect(() => {
    let isMounted = true;
    const fetchActive = async () => {
      try {
        const reqs = await vehicleService.getMyServiceRequests();
        const active = reqs.find((req) =>
          ["SEARCHING", "MECHANIC_ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "INSPECTION_STARTED", "WORK_STARTED"].includes(req.status)
        );
        if (isMounted) {
          setActiveRequest(active || null);
        }
      } catch (e) {}
    };
    fetchActive();
    const interval = setInterval(fetchActive, 4000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <View style={styles.floatingContainer} pointerEvents="box-none">
      {/* Live Track Ribbon: Directly docked & attached on top of bottom nav */}
      {activeRequest && activeScreen === "Home" && (
        <TouchableOpacity
          style={styles.activeRequestWidget}
          activeOpacity={0.9}
          onPress={() =>
            onNavigate("FindingMechanic", {
              requestId: activeRequest.id,
              requestNumber: activeRequest.requestNumber,
            })
          }
        >
          <View style={styles.widgetIconContainer}>
            <Feather name="navigation" size={16} color="#ffffff" />
          </View>
          <View style={styles.widgetTextContainer}>
            <View style={styles.widgetHeaderRow}>
              <View style={styles.liveIndicatorDot} />
              <Text style={styles.widgetTitle} numberOfLines={1}>
                {activeRequest.vehicleName
                  ? `${activeRequest.vehicleName} • #${activeRequest.requestNumber}`
                  : `Request #${activeRequest.requestNumber}`}
              </Text>
            </View>
            <Text style={styles.widgetSubtitle} numberOfLines={1}>
              {["SEARCHING"].includes(activeRequest.status)
                ? "Connecting your mechanic..."
                : ["ON_THE_WAY", "ARRIVED"].includes(activeRequest.status)
                ? "Mechanic on the way • Tap to track"
                : "Mechanic assigned • Tap to track"}
            </Text>
          </View>
          <View style={styles.trackBadge}>
            <Text style={styles.trackBadgeText}>Track</Text>
            <Feather name="chevron-right" size={14} color="#f97316" />
          </View>
        </TouchableOpacity>
      )}

      {/* Main Bottom Navigation Bar */}
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.screen;

          return (
            <TouchableOpacity
              key={item.screen}
              style={styles.navItem}
              onPress={() => onNavigate(item.screen)}
              activeOpacity={0.7}
            >
              <View style={[styles.pillWrapper, isActive && styles.pillActive]}>
                <Feather
                  name={item.icon}
                  size={18}
                  color={isActive ? "#000000" : "#64748b"}
                />
                <Text style={[styles.navText, isActive && styles.navTextActive]}>
                  {item.label}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: "transparent",
    gap: 6, // Seamless tight docking
  },
  activeRequestWidget: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#f97316",
    borderWidth: 1,
    borderColor: "#f1f5f9",
  },
  widgetIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f97316",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  widgetTextContainer: {
    flex: 1,
  },
  widgetHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  liveIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#22c55e",
    marginRight: 6,
  },
  widgetTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
  },
  widgetSubtitle: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "500",
  },
  trackBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7ed",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ffedd5",
    gap: 2,
    marginLeft: 6,
  },
  trackBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#f97316",
  },
  bottomNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 36,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 2,
  },
  pillWrapper: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    minWidth: 64,
  },
  pillActive: {
    backgroundColor: "#f97316",
  },
  navText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
    color: "#64748b",
  },
  navTextActive: {
    fontSize: 11,
    fontWeight: "800",
    color: "#000000",
  },
});
