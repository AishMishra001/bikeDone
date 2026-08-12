import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

// Garage added to match UI, will need to be added to routing later if needed.
type MainScreen = "Home" | "MyRequests" | "Garage" | "Profile" | "FullProfile";

interface AppBottomNavigationProps {
  activeScreen: MainScreen;
  onNavigate: (screen: any) => void;
}

const NAV_ITEMS: Array<{
  screen: MainScreen;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  { screen: "Home", label: "Home", icon: "home" },
  { screen: "MyRequests", label: "Activity", icon: "clock" },
  { screen: "Garage", label: "Garage", icon: "tool" }, // Using tool as placeholder for bike
  { screen: "Profile", label: "Support", icon: "user" },
];

export default function AppBottomNavigation({
  activeScreen,
  onNavigate,
}: AppBottomNavigationProps) {
  return (
    <View style={styles.floatingContainer}>
      <View style={styles.bottomNav}>
        {NAV_ITEMS.map((item) => {
          const isActive = activeScreen === item.screen;
          
          if (isActive) {
            return (
              <TouchableOpacity
                key={item.screen}
                style={[styles.navItem, styles.navItemActive]}
                onPress={() => onNavigate(item.screen)}
                activeOpacity={0.7}
              >
                <Feather name={item.icon} size={20} color="#000000" />
                <Text style={styles.navTextActive}>{item.label}</Text>
              </TouchableOpacity>
            );
          }
          
          return (
            <TouchableOpacity
              key={item.screen}
              style={styles.navItem}
              onPress={() => onNavigate(item.screen)}
              activeOpacity={0.7}
            >
              <Feather name={item.icon} size={22} color="#6b7280" />
              <Text style={styles.navText}>{item.label}</Text>
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
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: "transparent",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 36,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navItemActive: {
    backgroundColor: "#f97316", // Orange background for active item
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 24,
    flexDirection: "column",
    flex: 0,
    minWidth: 80,
  },
  navText: {
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    color: "#6b7280",
  },
  navTextActive: {
    fontSize: 12,
    fontWeight: "700",
    marginTop: 4,
    color: "#000000",
  },
});
