import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

type MainScreen = "Home" | "MyRequests" | "Profile";

interface AppBottomNavigationProps {
  activeScreen: MainScreen;
  onNavigate: (screen: MainScreen) => void;
}

const NAV_ITEMS: Array<{
  screen: MainScreen;
  label: string;
  icon: keyof typeof Feather.glyphMap;
}> = [
  { screen: "Home", label: "Home", icon: "home" },
  { screen: "MyRequests", label: "My Bookings", icon: "clipboard" },
  { screen: "Profile", label: "Profile", icon: "user" },
];

/** Shared navigation for the three main customer screens. */
export default function AppBottomNavigation({
  activeScreen,
  onNavigate,
}: AppBottomNavigationProps) {
  return (
    <View style={styles.bottomNav}>
      {NAV_ITEMS.map((item) => {
        const isActive = activeScreen === item.screen;
        const color = isActive ? "#f97316" : "#9ca3af";
        return (
          <TouchableOpacity
            key={item.screen}
            style={styles.navItem}
            onPress={() => onNavigate(item.screen)}
            activeOpacity={0.7}
          >
            <Feather name={item.icon} size={24} color={color} />
            <Text style={[styles.navText, isActive && styles.navTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#ffffff",
    paddingTop: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    elevation: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  navItem: {
    alignItems: "center",
    minWidth: 84,
  },
  navText: {
    fontSize: 10,
    fontWeight: "700",
    marginTop: 4,
    color: "#9ca3af",
  },
  navTextActive: {
    color: "#f97316",
  },
});
