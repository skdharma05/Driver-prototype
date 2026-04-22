import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { theme } from '../../../src/styles/theme';
import { ChevronLeft, MapPin, Calendar, Weight, Truck } from 'lucide-react-native';
import { calculateMarketRate } from '../../../src/utils/marketRate';
import { DUMMY_LOADS } from '../loads';
import { saveBid } from '../../../src/utils/bidStore';

export default function LoadDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [offerAmount, setOfferAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // Fetch load based on id
  const load = DUMMY_LOADS.find(l => l.id === id) || DUMMY_LOADS[0];

  const marketRate = calculateMarketRate(load.distance, load.vehicle);

  const pickupCoords = { latitude: load.pickupLat, longitude: load.pickupLng };
  const dropCoords = { latitude: load.dropLat, longitude: load.dropLng };

  const handleSubmitOffer = () => {
    const amount = parseInt(offerAmount);
    if (!offerAmount || isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid offer amount.');
      return;
    }

    // Warn if too low (protects drivers from underbidding)
    if (amount < marketRate.min * 0.85) {
      Alert.alert(
        'Low Offer Warning',
        `Your offer ₹${amount} is significantly below the suggested market rate (₹${marketRate.min} – ₹${marketRate.max}). `+
        `Low offers may be ignored by customers. Continue anyway?`,
        [
          { text: 'Revise Offer', style: 'cancel' },
          { 
            text: 'Submit Anyway', 
            onPress: () => processSubmission(amount) 
          }
        ]
      );
      return;
    }

    processSubmission(amount);
  };

  const processSubmission = async (amount) => {
    setLoading(true);
    try {
      const newBid = {
        bidId: `bid_${Date.now()}`,
        loadId: load.id,
        amount,
        status: 'pending',
        submittedAt: new Date().toISOString(),
        load: {
          pickupCity: load.pickup,
          dropCity: load.drop,
          pickupDate: load.date,
          vehicleType: load.vehicle,
          distanceText: load.distanceText,
        },
      };
      await saveBid(newBid);
      setLoading(false);
      Alert.alert(
        '✅ Offer Submitted!',
        `Your offer of ₹${amount.toLocaleString()} has been submitted. You'll be notified when it's reviewed.`,
        [
          { text: 'View My Bids', onPress: () => router.replace('/(tabs)/trips') },
          { text: 'Back to Loads', onPress: () => router.push('/(tabs)/loads') },
        ]
      );
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Could not submit bid. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Load Details</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Map Preview */}
        <View style={styles.mapContainer}>
          <MapView
            provider="google"
            style={styles.map}
            initialRegion={{
              latitude: (pickupCoords.latitude + dropCoords.latitude) / 2,
              longitude: (pickupCoords.longitude + dropCoords.longitude) / 2,
              latitudeDelta: Math.abs(pickupCoords.latitude - dropCoords.latitude) + 1,
              longitudeDelta: Math.abs(pickupCoords.longitude - dropCoords.longitude) + 1,
            }}
            scrollEnabled={false}
          >
            <Marker coordinate={pickupCoords} title="Pickup" pinColor="green" />
            <Marker coordinate={dropCoords} title="Drop" pinColor="red" />
            <Polyline coordinates={[pickupCoords, dropCoords]} strokeColor={theme.colors.accentDark} strokeWidth={3} />
          </MapView>
          <View style={styles.distanceBadge}>
             <Truck size={14} color={theme.colors.textInverse} />
             <Text style={styles.distanceText}>{load.distanceText}</Text>
          </View>
        </View>

        {/* Addresses */}
        <View style={styles.section}>
          <View style={styles.locationRow}>
             <MapPin size={20} color={theme.colors.success} />
             <View style={styles.locationInfo}>
               <Text style={styles.locationTitle}>Pickup: {load.pickup}</Text>
               {load.status === 'accepted' ? (
                 <Text style={styles.locationSubtitle}>{load.pickupAddress}</Text>
               ) : (
                 <Text style={styles.addressMasked}>🔒 Full address revealed after acceptance</Text>
               )}
               <Text style={styles.dateText}>{load.date}</Text>
             </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationRow}>
             <MapPin size={20} color={theme.colors.error} />
             <View style={styles.locationInfo}>
               <Text style={styles.locationTitle}>Drop: {load.drop}</Text>
               {load.status === 'accepted' ? (
                 <Text style={styles.locationSubtitle}>{load.dropAddress}</Text>
               ) : (
                 <Text style={styles.addressMasked}>🔒 Full address revealed after acceptance</Text>
               )}
               <Text style={styles.dateText}>Expected: {load.expectedDelivery}</Text>
             </View>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.gridSection}>
            <View style={styles.gridItem}>
              <Weight size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>Weight</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.weight}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Truck size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>Vehicle</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.vehicle}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <MapPin size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>Goods</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.goods}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Truck size={18} color={theme.colors.primary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>Bids Count</Text>
                <Text style={[styles.gridValue, {color: theme.colors.primary}]} numberOfLines={2}>{load.totalBidsCount} offers</Text>
              </View>
            </View>
        </View>

        {/* Suggested Market Rate */}
        <View style={styles.marketRateBox}>
           <View style={styles.marketRateHeader}>
             <Truck size={20} color={theme.colors.success} />
             <Text style={styles.marketRateTitle}>Suggested Market Rate</Text>
           </View>
           <Text style={styles.marketPrice}>₹{marketRate.min.toLocaleString()} – ₹{marketRate.max.toLocaleString()}</Text>
           <Text style={styles.marketSubtext}>
             Based on route distance ({load.distanceText}) and {load.vehicle} type.
           </Text>
        </View>

        {/* Instructions */}
        <View style={styles.noteBox}>
           <Text style={styles.noteTitle}>Special Instructions</Text>
           <Text style={styles.noteText}>{load.instructions}</Text>
        </View>

        {/* Offer Input Section */}
        <View style={styles.offerSection}>
          <Text style={styles.offerSectionTitle}>Your Offer Amount</Text>
          <View style={styles.offerInputWrapper}>
            <Text style={styles.offerCurrency}>₹</Text>
            <TextInput 
              style={styles.offerInput}
              placeholder="Enter your best price"
              keyboardType="number-pad"
              value={offerAmount}
              onChangeText={setOfferAmount}
            />
          </View>
          <TouchableOpacity 
            style={[styles.submitOfferBtn, (!offerAmount || loading) && styles.submitOfferBtnDisabled]} 
            onPress={handleSubmitOffer}
            disabled={!offerAmount || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textInverse} />
            ) : (
              <Text style={styles.submitOfferText}>Submit Offer</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Sticky Bottom Summary */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerInfo}>
          <Calendar size={16} color={theme.colors.error} />
          <Text style={styles.timeRemaining}>{load.timeRemaining} remaining</Text>
        </View>
        <Text style={styles.bidCountText}>{load.totalBidsCount} total offers received</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center',
    padding: theme.spacing.md, backgroundColor: theme.colors.primary,
  },
  backBtn: { marginRight: theme.spacing.sm },
  headerTitle: { ...theme.typography.h3, color: theme.colors.textInverse },
  content: { paddingBottom: 40 },
  mapContainer: {
    height: 180, width: '100%', position: 'relative'
  },
  map: { flex: 1 },
  distanceBadge: {
    position: 'absolute', bottom: 10, right: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full,
  },
  distanceText: { ...theme.typography.label, color: theme.colors.textInverse },
  section: {
    backgroundColor: theme.colors.surface, padding: theme.spacing.md,
    marginTop: theme.spacing.sm, ...theme.shadows.sm,
  },
  locationRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  locationInfo: { flex: 1 },
  locationTitle: { ...theme.typography.bodySemiBold, color: theme.colors.text, marginBottom: 2 },
  locationSubtitle: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  addressMasked: { ...theme.typography.small, color: theme.colors.textSecondary, fontStyle: 'italic', backgroundColor: theme.colors.background, padding: 4, borderRadius: 4, marginTop: 2, marginBottom: 4 },
  dateText: { ...theme.typography.small, color: theme.colors.primary, fontWeight: '600' },
  routeLine: { width: 2, height: 20, backgroundColor: theme.colors.borderLight, marginLeft: 9, marginVertical: 4 },
  gridSection: {
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 10, padding: theme.spacing.md,
  },
  gridItem: {
    width: '47%', backgroundColor: theme.colors.surface,
    padding: theme.spacing.md, borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm, flexDirection: 'row', alignItems: 'center', gap: 10,
    minHeight: 70,
  },
  gridTextContainer: { flex: 1 },
  gridLabel: { ...theme.typography.small, color: theme.colors.textSecondary },
  gridValue: { ...theme.typography.bodySemiBold, color: theme.colors.text, flexWrap: 'wrap' },
  marketRateBox: {
    backgroundColor: theme.colors.success + '05',
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.success + '20',
    marginBottom: theme.spacing.md,
  },
  marketRateHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  marketRateTitle: { ...theme.typography.bodySemiBold, color: theme.colors.success },
  marketPrice: { ...theme.typography.h2, color: theme.colors.text, marginBottom: 4 },
  marketSubtext: { ...theme.typography.small, color: theme.colors.textSecondary },
  noteBox: {
    backgroundColor: theme.colors.background, padding: theme.spacing.md, 
    marginHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl, borderLeftWidth: 4, borderLeftColor: theme.colors.warning
  },
  noteTitle: { ...theme.typography.label, color: theme.colors.text, marginBottom: 4 },
  noteText: { ...theme.typography.body, color: theme.colors.textSecondary },
  offerSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
    marginBottom: 40,
  },
  offerSectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 16, textAlign: 'center' },
  offerInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  offerCurrency: { ...theme.typography.h3, color: theme.colors.textSecondary, marginRight: 8 },
  offerInput: { flex: 1, height: 60, ...theme.typography.h3, color: theme.colors.text },
  submitOfferBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.md,
  },
  submitOfferBtnDisabled: { backgroundColor: theme.colors.border },
  submitOfferText: { ...theme.typography.buttonLarge, color: theme.colors.textInverse },
  stickyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    paddingBottom: 12, // fallback
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  footerInfo: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeRemaining: { ...theme.typography.small, color: theme.colors.error, fontWeight: '600' },
  bidCountText: { ...theme.typography.small, color: theme.colors.textSecondary },
});
