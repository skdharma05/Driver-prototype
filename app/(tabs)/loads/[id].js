import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import OSMMap from '../../../src/components/OSMMap';
import { theme } from '../../../src/styles/theme';
import { ChevronLeft, MapPin, Calendar, Weight, Truck, User, Phone, PhoneCall, Languages } from 'lucide-react-native';
import { DUMMY_LOADS } from '../../../src/constants/dummyData';
import { useLanguage } from '../../../src/context/LanguageContext';
import { haptics } from '../../../src/utils/haptics';
import { ChevronLeft, MapPin, Calendar, Weight, Truck } from 'lucide-react-native';
import { calculateMarketRate } from '../../../src/utils/marketRate';
import { DUMMY_LOADS } from '../../../src/constants/dummyLoads';
import { fetchLoadById } from '../../../src/services/loads';
import { saveBid } from '../../../src/utils/bidStore';

export default function LoadDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  const [offerAmount, setOfferAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [load, setLoad] = useState(null);
  const [loadingLoad, setLoadingLoad] = useState(true);

  // Fetch the load from Firestore by loadId; fall back to local data.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const remote = await fetchLoadById(id);
        const found = remote || DUMMY_LOADS.find(l => l.loadId === id) || null;
        if (!cancelled) setLoad(found);
      } catch (e) {
        console.log('[load] Firestore fetch failed, using local data:', e?.message);
        if (!cancelled) setLoad(DUMMY_LOADS.find(l => l.loadId === id) || null);
      } finally {
        if (!cancelled) setLoadingLoad(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  const pickupCoords = { latitude: load.pickupLat, longitude: load.pickupLng };
  const dropCoords = { latitude: load.dropLat, longitude: load.dropLng };
  if (loadingLoad) {
    return (
      <SafeAreaView style={[styles.container, styles.centerFill]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!load) {
    return (
      <SafeAreaView style={[styles.container, styles.centerFill]}>
        <Text style={styles.notFoundText}>Load not found.</Text>
        <TouchableOpacity style={styles.notFoundBtn} onPress={() => router.back()}>
          <Text style={styles.submitOfferText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  // Derived values (with fallbacks for fields the canonical load may omit).
  const distanceText = load.distance != null ? `${load.distance} km` : '';
  const marketRate = calculateMarketRate(load.distance || 0, load.vehicleType);
  const bidsCount = load.bidsCount ?? load.totalBidsCount ?? 0;
  const isRevealed = load.status === 'accepted' || load.status === 'ASSIGNED';
  const instructions = load.instructions || 'No special instructions provided.';

  const hasCoords =
    load.pickupLat != null && load.pickupLng != null &&
    load.dropLat != null && load.dropLng != null;
  const pickupCoords = hasCoords ? { latitude: load.pickupLat, longitude: load.pickupLng } : null;
  const dropCoords = hasCoords ? { latitude: load.dropLat, longitude: load.dropLng } : null;

  const handleCallAgent = () => {
    if (!load.agentPhone) {
      Alert.alert(t('detail.noContactTitle'), t('detail.noContact'));
      return;
    }
    haptics.light();
    Linking.openURL(`tel:${load.agentPhone}`).catch(() =>
      Alert.alert(t('detail.callFailTitle'), t('detail.callFail'))
    );

    processSubmission(amount);
  };

  const processSubmission = async (amount) => {
    setLoading(true);
    try {
      const newBid = {
        bidId: `bid_${Date.now()}`,
        loadId: load.loadId,
        amount,
        status: 'pending',
        // ISO string: this bid is persisted to AsyncStorage (local JSON), where a
        // Firestore Timestamp can't be serialized. Switch to serverTimestamp()
        // if/when bids are written to the Firestore `bids` collection.
        submittedAt: new Date().toISOString(),
        load: {
          pickupCity: load.pickupCity,
          dropCity: load.dropCity,
          pickupDate: load.pickupDate,
          vehicleType: load.vehicleType,
          distanceText,
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
        <Text style={styles.headerTitle}>{t('detail.title')}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Map Preview — tap to open Google Maps directions */}
        {hasCoords && (
        <View style={styles.mapContainer}>
          <OSMMap
            pickup={pickupCoords}
            drop={dropCoords}
            pickupLabel={`Pickup: ${load.pickupCity}`}
            dropLabel={`Drop: ${load.dropCity}`}
            tapTarget="both"
          />
          <View style={styles.distanceBadge} pointerEvents="none">
             <Truck size={14} color={theme.colors.textInverse} />
             <Text style={styles.distanceText}>{distanceText}</Text>
          </View>
        </View>
        )}

        {/* Addresses */}
        <View style={styles.section}>
          <View style={styles.locationRow}>
             <MapPin size={20} color={theme.colors.success} />
             <View style={styles.locationInfo}>
               <Text style={styles.locationTitle}>{t('detail.pickup')}: {load.pickup}</Text>
               {load.status === 'accepted' ? (
                 <Text style={styles.locationSubtitle}>{load.pickupAddress}</Text>
               <Text style={styles.locationTitle}>Pickup: {load.pickupCity}</Text>
               {isRevealed ? (
                 <Text style={styles.locationSubtitle}>{load.pickupFullAddress}</Text>
               ) : (
                 <Text style={styles.addressMasked}>{t('detail.masked')}</Text>
               )}
               <Text style={styles.dateText}>{load.pickupDate}</Text>
             </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationRow}>
             <MapPin size={20} color={theme.colors.error} />
             <View style={styles.locationInfo}>
               <Text style={styles.locationTitle}>{t('detail.drop')}: {load.drop}</Text>
               {load.status === 'accepted' ? (
                 <Text style={styles.locationSubtitle}>{load.dropAddress}</Text>
               <Text style={styles.locationTitle}>Drop: {load.dropCity}</Text>
               {isRevealed ? (
                 <Text style={styles.locationSubtitle}>{load.dropFullAddress}</Text>
               ) : (
                 <Text style={styles.addressMasked}>{t('detail.masked')}</Text>
               )}
               <Text style={styles.dateText}>{t('detail.expected')} {load.expectedDelivery}</Text>
               <Text style={styles.dateText}>Expected: {load.expectedDelivery || '—'}</Text>
             </View>
          </View>
        </View>

        {/* Requirements */}
        <View style={styles.gridSection}>
            <View style={styles.gridItem}>
              <Weight size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.weight')}</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.weight}</Text>
                <Text style={styles.gridLabel}>Weight</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.weight} Tons</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Truck size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.vehicle')}</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.vehicle}</Text>
                <Text style={styles.gridLabel}>Vehicle</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.vehicleType}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <MapPin size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.goods')}</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.goods}</Text>
                <Text style={styles.gridLabel}>Goods</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.goodsType}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Truck size={18} color={theme.colors.primary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.bidsCount')}</Text>
                <Text style={[styles.gridValue, {color: theme.colors.primary}]} numberOfLines={2}>{load.totalBidsCount} {t('detail.offers')}</Text>
                <Text style={styles.gridLabel}>Bids Count</Text>
                <Text style={[styles.gridValue, {color: theme.colors.primary}]} numberOfLines={2}>{bidsCount} offers</Text>
              </View>
            </View>
        </View>

        {/* Instructions */}
        <View style={styles.noteBox}>
           <Text style={styles.noteTitle}>{t('detail.instructions')}</Text>
           <Text style={styles.noteText}>{load.instructions}</Text>
        {/* Suggested Market Rate */}
        <View style={styles.marketRateBox}>
           <View style={styles.marketRateHeader}>
             <Truck size={20} color={theme.colors.success} />
             <Text style={styles.marketRateTitle}>Suggested Market Rate</Text>
           </View>
           <Text style={styles.marketPrice}>₹{marketRate.min.toLocaleString()} – ₹{marketRate.max.toLocaleString()}</Text>
           <Text style={styles.marketSubtext}>
             Based on route distance ({distanceText}) and {load.vehicleType} type.
           </Text>
        </View>

        {/* Instructions */}
        <View style={styles.noteBox}>
           <Text style={styles.noteTitle}>Special Instructions</Text>
           <Text style={styles.noteText}>{instructions}</Text>
        </View>

        {/* Agent Details Section */}
        <View style={styles.agentSection}>
          <Text style={styles.agentSectionTitle}>{t('detail.agentDetails')}</Text>

          <View style={styles.agentRow}>
            <View style={styles.agentIconBox}>
              <User size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.agentTextCol}>
              <Text style={styles.agentLabel}>{t('detail.agentName')}</Text>
              <Text style={styles.agentValue}>{load.agentName || t('detail.notAvailable')}</Text>
            </View>
          </View>

          <View style={styles.agentDivider} />

          <View style={styles.agentRow}>
            <View style={styles.agentIconBox}>
              <Phone size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.agentTextCol}>
              <Text style={styles.agentLabel}>{t('detail.contactNumber')}</Text>
              <Text style={styles.agentValue}>{load.agentPhone || t('detail.notAvailable')}</Text>
            </View>
            <TouchableOpacity style={styles.callBtn} onPress={handleCallAgent} activeOpacity={0.8}>
              <PhoneCall size={16} color={theme.colors.textInverse} />
              <Text style={styles.callBtnText}>{t('loads.call')}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.agentDivider} />

          <View style={styles.agentRow}>
            <View style={styles.agentIconBox}>
              <Languages size={18} color={theme.colors.primary} />
            </View>
            <View style={styles.agentTextCol}>
              <Text style={styles.agentLabel}>{t('detail.preferredLanguage')}</Text>
              <Text style={styles.agentValue}>{load.agentLanguage || t('detail.notAvailable')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky Bottom Summary */}
      <View style={[styles.stickyFooter, { paddingBottom: insets.bottom + 12 }]}>
        <View style={styles.footerInfo}>
          <Calendar size={16} color={theme.colors.error} />
          <Text style={styles.timeRemaining}>{t('detail.remaining', { time: load.timeRemaining })}</Text>
        </View>
        <Text style={styles.bidCountText}>{t('detail.totalOffers', { count: load.totalBidsCount })}</Text>
          <Text style={styles.timeRemaining}>
            {load.timeRemaining ? `${load.timeRemaining} remaining` : 'Open for bids'}
          </Text>
        </View>
        <Text style={styles.bidCountText}>{bidsCount} total offers received</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  centerFill: { justifyContent: 'center', alignItems: 'center', padding: theme.spacing.lg },
  notFoundText: { ...theme.typography.body, color: theme.colors.textSecondary, marginBottom: 16 },
  notFoundBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24, height: 48,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center', justifyContent: 'center',
  },
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
  noteBox: {
    backgroundColor: theme.colors.background, padding: theme.spacing.md, 
    marginHorizontal: theme.spacing.md, borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl, borderLeftWidth: 4, borderLeftColor: theme.colors.warning
  },
  noteTitle: { ...theme.typography.label, color: theme.colors.text, marginBottom: 4 },
  noteText: { ...theme.typography.body, color: theme.colors.textSecondary },
  agentSection: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
    marginBottom: 40,
  },
  agentSectionTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: 16 },
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  agentIconBox: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: theme.colors.primary + '10',
    alignItems: 'center', justifyContent: 'center',
  },
  agentTextCol: { flex: 1 },
  agentLabel: { ...theme.typography.small, color: theme.colors.textSecondary },
  agentValue: { ...theme.typography.bodySemiBold, color: theme.colors.text, marginTop: 2 },
  agentDivider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: 14 },
  callBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: theme.colors.success,
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  callBtnText: { ...theme.typography.button, color: theme.colors.textInverse },
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
