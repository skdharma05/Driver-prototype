import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from 'react-native-maps';
import { theme } from '../../src/styles/theme';
import { MapPin, Phone, CheckCircle2, Camera } from 'lucide-react-native';

export const ASSIGNMENT_STATUS = {
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED',
  HEADING_TO_PICKUP: 'HEADING_TO_PICKUP',
  PICKUP_POD_SUBMITTED: 'PICKUP_POD_SUBMITTED',
  ADVANCE_PAID: 'ADVANCE_PAID',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERY_POD_SUBMITTED: 'DELIVERY_POD_SUBMITTED',
  BALANCE_PAID: 'BALANCE_PAID'
};

export const TRIP_STAGES = [
  { key: 'DRIVER_ACCEPTED', label: 'Accepted' },
  { key: 'HEADING_TO_PICKUP', label: 'Heading to Pickup' },
  { key: 'PICKUP_POD_SUBMITTED', label: 'Pickup Verification' },
  { key: 'ADVANCE_PAID', label: 'Advance Paid' },
  { key: 'IN_TRANSIT', label: 'In Transit' },
  { key: 'DELIVERY_POD_SUBMITTED', label: 'Delivery Verification' },
  { key: 'BALANCE_PAID', label: 'Completed' }
];

export default function ActiveTripScreen() {
  const { id, pickupSubmitted, deliverySubmitted } = useLocalSearchParams();
  const router = useRouter();
  const [currentStage, setCurrentStage] = useState(ASSIGNMENT_STATUS.DRIVER_ACCEPTED);

  useEffect(() => {
    if (pickupSubmitted === 'true') {
      setCurrentStage(ASSIGNMENT_STATUS.PICKUP_POD_SUBMITTED);
    } else if (deliverySubmitted === 'true') {
      setCurrentStage(ASSIGNMENT_STATUS.DELIVERY_POD_SUBMITTED);
    }
  }, [pickupSubmitted, deliverySubmitted]);

  useEffect(() => {
    if (currentStage === ASSIGNMENT_STATUS.PICKUP_POD_SUBMITTED) {
      // Simulate automatic payment/approval after POD
      const timer = setTimeout(() => {
        setCurrentStage(ASSIGNMENT_STATUS.ADVANCE_PAID);
      }, 3000);
      return () => clearTimeout(timer);
    }
    if (currentStage === ASSIGNMENT_STATUS.DELIVERY_POD_SUBMITTED) {
      // Simulate automatic balance payment/approval
      const timer = setTimeout(() => {
        setCurrentStage(ASSIGNMENT_STATUS.BALANCE_PAID);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentStage]);
  const [routeCoords, setRouteCoords] = useState([]);
  const insets = useSafeAreaInsets();

  // Mock initial coordinates
  const pickupCoords = { latitude: 13.0827, longitude: 80.2707 }; // Chennai
  const dropCoords = { latitude: 12.9716, longitude: 77.5946 }; // Bengaluru

  useEffect(() => {
    // In real app, fetch from Firestore assignment's routeCoordinates, or call ORS API if null
    // Here we provide a mock polyline straight line for demo MVP purposes
    setRouteCoords([
      pickupCoords,
      { latitude: 13.0000, longitude: 79.5000 },
      { latitude: 12.9800, longitude: 78.5000 },
      dropCoords
    ]);
  }, []);

  const openMaps = (destLat, destLng, address) => {
    const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
    const latLng = `${destLat},${destLng}`;
    const label = address;
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`
    });

    Linking.openURL(url);
  };

  const advanceStage = () => {
    if (currentStage === ASSIGNMENT_STATUS.DRIVER_ACCEPTED) {
      setCurrentStage(ASSIGNMENT_STATUS.HEADING_TO_PICKUP);
    } else if (currentStage === ASSIGNMENT_STATUS.HEADING_TO_PICKUP) {
      // Need to capture Pickup POD
      router.push({ pathname: '/(trip)/pod-capture', params: { type: 'pickup', id } });
    } else if (currentStage === ASSIGNMENT_STATUS.ADVANCE_PAID) {
      setCurrentStage(ASSIGNMENT_STATUS.IN_TRANSIT);
    } else if (currentStage === ASSIGNMENT_STATUS.IN_TRANSIT) {
      // Need to capture Delivery POD
      router.push({ pathname: '/(trip)/pod-capture', params: { type: 'delivery', id } });
    }
  };

  const getStageActionText = () => {
    switch (currentStage) {
      case ASSIGNMENT_STATUS.DRIVER_ACCEPTED: return "Start Heading to Pickup";
      case ASSIGNMENT_STATUS.HEADING_TO_PICKUP: return "Arrived at Pickup (Submit POD)";
      case ASSIGNMENT_STATUS.PICKUP_POD_SUBMITTED: return "Processing Advance Payment...";
      case ASSIGNMENT_STATUS.ADVANCE_PAID: return "Start Transit";
      case ASSIGNMENT_STATUS.IN_TRANSIT: return "Arrived at Drop (Submit POD)";
      case ASSIGNMENT_STATUS.DELIVERY_POD_SUBMITTED: return "Waiting for Balance Payment...";
      case ASSIGNMENT_STATUS.BALANCE_PAID: return "Complete Trip & Rate";
      default: return "";
    }
  };

  const renderProgressBar = () => {
    const currentIdx = TRIP_STAGES.findIndex(s => s.key === currentStage);
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressBarBg}>
           <View style={[styles.progressBarFill, { width: `${(currentIdx / (TRIP_STAGES.length - 1)) * 100}%` }]} />
        </View>
        <Text style={styles.stageText}>Current: {TRIP_STAGES[currentIdx]?.label}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Active Trip</Text>
        {renderProgressBar()}
      </View>

      {/* Map Section (OpenStreetMap mapping via default props) */}
      <View style={styles.mapContainer}>
        <MapView
          provider="google"
          style={styles.map}
          initialRegion={{
            latitude: (pickupCoords.latitude + dropCoords.latitude) / 2,
            longitude: (pickupCoords.longitude + dropCoords.longitude) / 2,
            latitudeDelta: 3.5,
            longitudeDelta: 3.5,
          }}
        >
          <Marker coordinate={pickupCoords} title="Pickup" pinColor="green" />
          <Marker coordinate={dropCoords} title="Drop" pinColor="red" />
          <Polyline coordinates={routeCoords} strokeColor={theme.colors.accentDark} strokeWidth={4} />
        </MapView>
      </View>

      <ScrollView style={styles.detailsContainer}>
        {/* Navigation Actions */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Locations</Text>
          
          <View style={styles.navRow}>
             <View style={styles.navInfo}>
               <View style={[styles.dot, { backgroundColor: theme.colors.success }]} />
               <View>
                 <Text style={styles.navLabel}>Pickup</Text>
                 <Text style={styles.navCity}>Chennai, TN</Text>
               </View>
             </View>
             <TouchableOpacity 
               style={styles.navBtn}
               onPress={() => openMaps(pickupCoords.latitude, pickupCoords.longitude, "Chennai Pickup")}
             >
               <MapPin size={18} color={theme.colors.primary} />
               <Text style={styles.navBtnText}>Navigate</Text>
             </TouchableOpacity>
          </View>

          <View style={styles.navRow}>
             <View style={styles.navInfo}>
               <View style={[styles.dot, { backgroundColor: theme.colors.error }]} />
               <View>
                 <Text style={styles.navLabel}>Drop</Text>
                 <Text style={styles.navCity}>Bengaluru, KA</Text>
               </View>
             </View>
             <TouchableOpacity 
               style={styles.navBtn}
               onPress={() => openMaps(dropCoords.latitude, dropCoords.longitude, "Bengaluru Drop")}
             >
               <MapPin size={18} color={theme.colors.primary} />
               <Text style={styles.navBtnText}>Navigate</Text>
             </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.card}>
           <Text style={styles.sectionTitle}>KKP Logistics Support</Text>
           <View style={{flexDirection: 'row', gap: 12, marginTop: 8}}>
             <TouchableOpacity style={styles.supportBtn} onPress={() => Linking.openURL('tel:+919000000000')}>
               <Phone size={20} color="#fff" />
               <Text style={styles.supportBtnText}>Call Support</Text>
             </TouchableOpacity>
           </View>
        </View>
        <View style={{height: 100}} />
      </ScrollView>

      {/* Sticky Action Button */}
      <View style={[styles.actionFooter, { paddingBottom: insets.bottom + 12 }]}>
         <TouchableOpacity 
           style={[
             styles.mainActionBtn, 
             (currentStage === ASSIGNMENT_STATUS.PICKUP_POD_SUBMITTED || currentStage === ASSIGNMENT_STATUS.DELIVERY_POD_SUBMITTED) && styles.mainActionDisabled
           ]}
           onPress={advanceStage}
           disabled={currentStage === ASSIGNMENT_STATUS.PICKUP_POD_SUBMITTED || currentStage === ASSIGNMENT_STATUS.DELIVERY_POD_SUBMITTED}
         >
           {currentStage.includes('HEADING') || currentStage.includes('TRANSIT') ? (
             <Camera size={24} color="#fff" />
           ) : (
             <CheckCircle2 size={24} color="#fff" />
           )}
           <Text style={styles.mainActionBtnText}>{getStageActionText()}</Text>
         </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
    zIndex: 10,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  progressContainer: {
    marginTop: 8,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: theme.colors.success,
  },
  stageText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
  },
  mapContainer: {
    height: 250,
    width: '100%',
  },
  map: {
    flex: 1,
  },
  detailsContainer: {
    flex: 1,
    padding: theme.spacing.md,
  },
  card: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  navInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  navLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  navCity: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  navBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.colors.primary + '15',
    borderRadius: theme.borderRadius.full,
  },
  navBtnText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  supportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: theme.colors.success,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  supportBtnText: {
    ...theme.typography.button,
    color: '#fff',
  },
  actionFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.lg,
    paddingBottom: 12, // base; overridden per-render with insets
  },
  mainActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.xl,
  },
  mainActionDisabled: {
    backgroundColor: theme.colors.border,
  },
  mainActionBtnText: {
    ...theme.typography.buttonLarge,
    color: '#fff',
  }
});
