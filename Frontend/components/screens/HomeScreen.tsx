import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { tokenStorage, LoggedInUser } from '../../services/tokenStorage';

interface HomeScreenProps {
  onNavigate: (screen: string) => void;
}

export default function HomeScreen({ onNavigate }: HomeScreenProps) {
  const [searchText, setSearchText] = useState('');
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const u = await tokenStorage.getUser();
      setUser(u);
    };
    loadUser();
  }, []);

  const services = [
    { id: 1, title: 'General Service', icon: 'tool', color: '#f97316', bg: '#fff3eb' },
    { id: 2, title: 'Tyre Issue', icon: 'disc', color: '#ea580c', bg: '#fff7ed' },
    { id: 3, title: 'Brake & Clutch', icon: 'sliders', color: '#ef4444', bg: '#fef2f2' },
    { id: 4, title: 'Emergency Tow', icon: 'truck', color: '#a855f7', bg: '#faf5ff' },
  ] as const;

  return (
    <View style={styles.screenContainer}>
      {/* Top Header */}
      <View style={styles.homeHeader}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.headerLabel}>Current Location</Text>
            <View style={styles.locationContainer}>
              <Feather name="map-pin" size={14} color="white" />
              <Text style={styles.headerLocation}> Connaught Place, Delhi </Text>
              <Feather name="chevron-down" size={14} color="white" />
            </View>
          </View>
          <View style={styles.bellIcon}>
            <Feather name="bell" size={20} color="white" />
            <View style={styles.notificationDot} />
          </View>
        </View>
        <Text style={styles.greetingText}>Hello, {user ? user.firstName : 'Rider'}! 🏍️</Text>
        <Text style={styles.greetingSub}>What does your bike need today?</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.homeContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Feather name="search" size={20} color="#9ca3af" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search services (e.g., Puncture)"
            placeholderTextColor="#9ca3af"
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Active Ticket */}
        <View style={styles.alertBox}>
          <View style={styles.alertIconBox}>
            <Feather name="info" size={18} color="#2563eb" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.alertTitle}>No active bookings</Text>
            <Text style={styles.alertSub}>
              Your bike is running smoothly. Book a service if needed!
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Quick Services</Text>

        {/* Service Grid */}
        <View style={styles.gridContainer}>
          {services.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.gridItem}
              onPress={() => onNavigate('Booking')}
            >
              <View style={[styles.gridIconBox, { backgroundColor: item.bg }]}>
                <Feather name={item.icon} size={24} color={item.color} />
              </View>
              <Text style={styles.gridText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Nav */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navItem}>
          <Feather name="home" size={24} color="#f97316" />
          <Text style={[styles.navText, { color: '#f97316' }]}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Booking')}>
          <Feather name="file-text" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Bookings</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => onNavigate('Profile')}>
          <Feather name="user" size={24} color="#9ca3af" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  homeHeader: {
    backgroundColor: '#f97316',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerLabel: {
    color: '#fff3eb',
    fontSize: 12,
    marginBottom: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLocation: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  bellIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 10,
    right: 12,
    width: 8,
    height: 8,
    backgroundColor: '#ef4444',
    borderRadius: 4,
  },
  greetingText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  greetingSub: {
    color: '#fff3eb',
    fontSize: 14,
    marginTop: 4,
  },
  homeContent: {
    padding: 24,
    paddingBottom: 100,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#111827',
  },
  alertBox: {
    flexDirection: 'row',
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  alertIconBox: {
    padding: 8,
    backgroundColor: '#dbeafe',
    borderRadius: 8,
    marginRight: 12,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  alertSub: {
    fontSize: 12,
    color: '#1d4ed8',
    marginTop: 4,
    lineHeight: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: '48%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  gridIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  gridText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#f3f4f6',
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: 4,
    color: '#9ca3af',
  },
});
