import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, Polyline, PROVIDER_DEFAULT, UrlTile } from 'react-native-maps';
import { theme } from '../../../src/styles/theme';
import { ChevronLeft, MapPin, Calendar, Weight, Truck, User, Phone, PhoneCall, Languages } from 'lucide-react-native';
import { DUMMY_LOADS } from '../../../src/constants/dummyData';
import { useLanguage } from '../../../src/context/LanguageContext';
import { haptics } from '../../../src/utils/haptics';

export default function LoadDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { t } = useLanguage();

  // Fetch load based on id
  const load = DUMMY_LOADS.find(l => l.id === id) || DUMMY_LOADS[0];

  const pickupCoords = { latitude: load.pickupLat, longitude: load.pickupLng };
  const dropCoords = { latitude: load.dropLat, longitude: load.dropLng };

  const handleCallAgent = () => {
    if (!load.agentPhone) {
      Alert.alert(t('detail.noContactTitle'), t('detail.noContact'));
      return;
    }
    haptics.light();
    Linking.openURL(`tel:${load.agentPhone}`).catch(() =>
      Alert.alert(t('detail.callFailTitle'), t('detail.callFail'))
    );
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
               <Text style={styles.locationTitle}>{t('detail.pickup')}: {load.pickup}</Text>
               {load.status === 'accepted' ? (
                 <Text style={styles.locationSubtitle}>{load.pickupAddress}</Text>
               ) : (
                 <Text style={styles.addressMasked}>{t('detail.masked')}</Text>
               )}
               <Text style={styles.dateText}>{load.date}</Text>
             </View>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationRow}>
             <MapPin size={20} color={theme.colors.error} />
             <View style={styles.locationInfo}>
               <Text style={styles.locationTitle}>{t('detail.drop')}: {load.drop}</Text>
               {load.status === 'accepted' ? (
                 <Text style={styles.locationSubtitle}>{load.dropAddress}</Text>
               ) : (
                 <Text style={styles.addressMasked}>{t('detail.masked')}</Text>
               )}
               <Text style={styles.dateText}>{t('detail.expected')} {load.expectedDelivery}</Text>
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
              </View>
            </View>
            <View style={styles.gridItem}>
              <Truck size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.vehicle')}</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.vehicle}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <MapPin size={18} color={theme.colors.textSecondary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.goods')}</Text>
                <Text style={styles.gridValue} numberOfLines={2}>{load.goods}</Text>
              </View>
            </View>
            <View style={styles.gridItem}>
              <Truck size={18} color={theme.colors.primary} />
              <View style={styles.gridTextContainer}>
                <Text style={styles.gridLabel}>{t('detail.bidsCount')}</Text>
                <Text style={[styles.gridValue, {color: theme.colors.primary}]} numberOfLines={2}>{load.totalBidsCount} {t('detail.offers')}</Text>
              </View>
            </View>
        </View>

        {/* Instructions */}
        <View style={styles.noteBox}>
           <Text style={styles.noteTitle}>{t('detail.instructions')}</Text>
           <Text style={styles.noteText}>{load.instructions}</Text>
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
