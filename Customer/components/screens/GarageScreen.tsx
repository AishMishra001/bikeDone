import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  ImageBackground,
  FlatList,
  Dimensions,
  Modal,
  Image,
  TouchableWithoutFeedback
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { CustomerVehicle, vehicleService } from '../../services/vehicleService';
import BikeDetailSheet from '../ui/BikeDetailSheet';
import BackButton from '../ui/BackButton';

interface GarageScreenProps {
  onNavigate: (screen: string) => void;
}

const BikeImageSlider = ({ images, onImagePress }: { images: string[], onImagePress: (uri: string) => void }) => {
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = (prev + 1) % images.length;
        if (flatListRef.current) {
          try {
            flatListRef.current.scrollToIndex({ index: next, animated: true });
          } catch(e) {}
        }
        return next;
      });
    }, 3500);
    return () => clearInterval(timer);
  }, [images.length]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  if (images.length === 0) {
    return (
      <View style={[styles.photoContainer, { justifyContent: 'center', alignItems: 'center' }]}>
        <Feather name="image" size={48} color="#d1d5db" style={styles.photoPlaceholderIcon} />
      </View>
    );
  }

  return (
    <View 
      style={styles.photoContainer} 
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
    >
      {width > 0 && (
        <FlatList
          ref={flatListRef}
          data={images}
          keyExtractor={(_, index) => String(index)}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
          renderItem={({ item }) => (
            <TouchableOpacity activeOpacity={0.9} onPress={() => onImagePress(item)}>
              <ImageBackground 
                source={{ uri: item }} 
                style={{ width, height: 180 }} 
                resizeMode="cover" 
              />
            </TouchableOpacity>
          )}
        />
      )}
      {images.length > 1 && (
        <View style={styles.paginationDots}>
          {images.map((_, idx) => (
            <View
              key={idx}
              style={[
                styles.dot,
                idx === currentIndex && styles.activeDot
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function GarageScreen({ onNavigate }: GarageScreenProps) {
  const [myBikes, setMyBikes] = useState<CustomerVehicle[]>([]);
  const [loadingBikes, setLoadingBikes] = useState(false);
  const [selectedBike, setSelectedBike] = useState<CustomerVehicle | null>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchBikes();
  }, []);

  const fetchBikes = async () => {
    setLoadingBikes(true);
    try {
      const data = await vehicleService.getMyVehicles();
      setMyBikes(data);
    } catch {
      // silent fail
    } finally {
      setLoadingBikes(false);
    }
  };

  return (
    <View style={styles.screenContainer}>
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => onNavigate('Home')} style={styles.backButton} />
        <Text style={styles.headerTitle}>My Garage</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loadingBikes ? (
          <View style={styles.loaderContainer}>
            <ActivityIndicator color="#ea580c" size="large" />
            <Text style={styles.loadingText}>Loading your bikes...</Text>
          </View>
        ) : myBikes.length === 0 ? (
          <View style={styles.emptyState}>
            <Feather name="zap-off" size={48} color="#d1d5db" />
            <Text style={styles.emptyTitle}>No bikes found</Text>
            <Text style={styles.emptySubtitle}>
              Click the + button below to add your first bike to the garage.
            </Text>
          </View>
        ) : (
          <View style={styles.bikeList}>
            {myBikes.map((bike) => (
              <View key={bike.id} style={styles.bikeCard}>
                {/* Photo Area */}
                <View style={{ position: 'relative' }}>
                  <BikeImageSlider 
                    images={bike.vehicleData?.['customer-bike-image'] || []} 
                    onImagePress={(uri) => setPreviewImage(uri)}
                  />
                  
                  {bike.isDefault && (
                    <View style={styles.activeBadge}>
                      <Text style={styles.activeBadgeText}>Active</Text>
                    </View>
                  )}
                </View>

                {/* Info Area */}
                <View style={styles.infoContainer}>
                  <Text style={styles.bikeName}>
                    {bike.brandName} {bike.modelName}
                  </Text>
                  
                  <View style={styles.detailRow}>
                    <Feather name="map-pin" size={12} color="#6b7280" />
                    <Text style={styles.detailText}>{bike.registrationNumber}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <Feather name="calendar" size={12} color="#6b7280" />
                    <Text style={styles.detailText}>
                      Model Year: {bike.manufacturingYear || 'N/A'} • {bike.odometerKm} km
                    </Text>
                  </View>

                  <View style={styles.divider} />

                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      onPress={() => {
                        setSelectedBike(bike);
                        setSheetVisible(true);
                      }}
                    >
                      <Text style={styles.viewDetailsText}>View Details</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => onNavigate('Booking')}>
                      <Text style={styles.requestServiceText}>Request Service</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Floating Add Button */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => onNavigate('AddBike')}
        activeOpacity={0.8}
      >
        <Feather name="plus" size={24} color="#ffffff" />
        <Text style={styles.fabText}>add</Text>
      </TouchableOpacity>

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

      {/* Image Preview Modal */}
      <Modal
        visible={!!previewImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewImage(null)}
      >
        <TouchableWithoutFeedback onPress={() => setPreviewImage(null)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              <View style={styles.modalContent}>
                {previewImage && (
                  <Image
                    source={{ uri: previewImage }}
                    style={styles.previewImage}
                    resizeMode="contain"
                  />
                )}
                <TouchableOpacity
                  style={styles.closePreviewBtn}
                  onPress={() => setPreviewImage(null)}
                >
                  <Feather name="x" size={24} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 16,
    paddingHorizontal: 24,
    backgroundColor: '#f9fafb',
  },
  backButton: {
    marginTop: 0,
    marginBottom: 0,
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 150, // Space for Bottom Nav and FAB
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
    fontSize: 14,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 32,
  },
  bikeList: {
    paddingTop: 8,
  },
  bikeCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  photoContainer: {
    height: 180,
    backgroundColor: '#e5e7eb',
    position: 'relative',
    overflow: 'hidden',
  },
  photoPlaceholderIcon: {
    opacity: 0.5,
  },
  paginationDots: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
  },
  activeDot: {
    width: 16,
    backgroundColor: '#fff',
  },
  activeBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
  },
  infoContainer: {
    padding: 16,
  },
  bikeName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: 13,
    color: '#6b7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewDetailsText: {
    color: '#ea580c',
    fontSize: 13,
    fontWeight: '700',
  },
  requestServiceText: {
    color: '#6b7280',
    fontSize: 13,
    fontWeight: '700',
  },
  fab: {
    position: 'absolute',
    bottom: 140, // Avoid bottom nav pill
    right: 24,
    backgroundColor: '#ea580c',
    width: 60,
    height: 60,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#ea580c',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    flexDirection: 'column',
    zIndex: 10,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    height: '70%',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  closePreviewBtn: {
    position: 'absolute',
    top: -50,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    padding: 8,
  }
});
