import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, FlatList,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { ArrowLeft, ChevronRight, X } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import VehicleFilterSheet from '../src/components/VehicleFilterSheet';
import TruckIcon from '../src/components/TruckIcon';

import { useRouter, useLocalSearchParams } from 'expo-router';
import { DUMMY_LOADS } from '../src/constants/dummyLoads';

const CATEGORIES = [
  { id: 'open',       label: 'Open',       icon: '🚛', tons: '7.5 - 43 Ton' },
  { id: 'container',  label: 'Container',  icon: '📦', tons: '7.5 - 30 Ton' },
  { id: 'lcv',        label: 'LCV',        icon: '🚐', tons: '2.5 - 7 Ton'  },
  { id: 'mini',       label: 'Mini',       icon: '🛻', tons: '0.75 - 2 Ton' },
  { id: 'trailer',    label: 'Trailer',    icon: '🚜', tons: '22 - 43 Ton'  },
  { id: 'industrial', label: 'Industrial', icon: '🏭', tons: '8 - 36 Ton'   },
];

const LoadsResultScreen = () => {
  const { fromCity = 'Chennai' } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [sheetVisible,    setSheetVisible]    = useState(false);
  const [activeCategory,  setActiveCategory]  = useState(null);
  const [activeFilter,    setActiveFilter]    = useState(null);

  // Filter by selected city
  const cityLoads = useMemo(() => {
    return DUMMY_LOADS.filter(load =>
      load.pickupCity.toLowerCase().includes(fromCity.toLowerCase())
    );
  }, [fromCity]);

  // Filter loads by selected city + vehicle type
  const filteredLoads = useMemo(() => {
    return cityLoads.filter(load => {
      const vehicleMatch = !activeFilter?.category ||
        load.vehicleCategory?.toLowerCase() === activeFilter.category;
      return vehicleMatch;
    });
  }, [cityLoads, activeFilter]);

  // Count per vehicle category for chips
  const getCategoryCount = (categoryId) =>
    cityLoads.filter(l => l.vehicleCategory === categoryId).length;

  const handleCategoryTap = (categoryId) => {
    setActiveCategory(categoryId);
    setSheetVisible(true);
  };

  const handleFilterSelect = (filter) => {
    setActiveFilter(filter);
    setSheetVisible(false);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>

      {/* ── Header ─────────────────────────────────── */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft size={22} color="#fff" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerTitle}>{fromCity} → Anywhere</Text>
          <Text style={styles.headerSub}>{filteredLoads.length} loads available</Text>
        </View>
      </View>

      {/* ── Top Category Chips ───────────────── */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 12, paddingVertical: 12, gap: 8 }}
        >
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                activeCategory === cat.id && styles.categoryChipActive
              ]}
              onPress={() => handleCategoryTap(cat.id)}
            >
              {/* Truck SVG icon */}
              <TruckIcon category={cat.id} size={32}
                color={activeCategory === cat.id ? '#1E3A8A' : '#6B7280'}
              />
              <Text style={[
                styles.categoryChipLabel,
                activeCategory === cat.id && styles.categoryChipLabelActive
              ]}>
                {cat.label}
              </Text>
              <Text style={[
                styles.categoryChipTons,
                activeCategory === cat.id && styles.categoryChipTonsActive
              ]}>
                {cat.tons}
              </Text>
              {/* Count badge */}
              {getCategoryCount(cat.id) > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>
                    {getCategoryCount(cat.id)}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filter sheet */}
      <VehicleFilterSheet
        visible={sheetVisible}
        category={activeCategory}
        onClose={() => setSheetVisible(false)}
        onSelect={handleFilterSelect}
      />

      {/* ── Loads List ─────────────────────────────── */}
      <FlatList
        data={filteredLoads}
        keyExtractor={(item) => item.loadId}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: insets.bottom + 20 }}
        renderItem={({ item }) => <LoadCard load={item} />}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📦</Text>
            <Text style={styles.emptyTitle}>No loads available</Text>
            <Text style={styles.emptySub}>
              No {activeFilter?.category ? activeFilter.category : ''} loads from {fromCity} right now.
            </Text>
            <TouchableOpacity
              onPress={() => { setActiveFilter(null); setActiveCategory(null); }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Show All Vehicle Types</Text>
            </TouchableOpacity>
          </View>
        }
      />

    </View>
  );
};

// ── Load Card ─────────────────────────────────────────
const LoadCard = ({ load }) => {
  const router = useRouter();
  
  return (
  <TouchableOpacity
    style={styles.loadCard}
    onPress={() => {
      router.push(`/(tabs)/loads/${load.loadId}`);
    }}
    activeOpacity={0.85}
  >
    {/* NEW badge */}
    {load.isNew && (
      <View style={styles.newBadge}>
        <Text style={styles.newBadgeText}>NEW</Text>
      </View>
    )}

    {/* Route */}
    <View style={styles.routeRow}>
      <View style={styles.routeDots}>
        <View style={styles.dotGreen} />
        <View style={styles.routeLine} />
        <View style={styles.dotRed} />
      </View>
      <View style={styles.routeCities}>
        <Text style={styles.cityText} numberOfLines={1}>{load.pickupCity}</Text>
        <Text style={styles.cityText} numberOfLines={1}>{load.dropCity}</Text>
      </View>
      <ChevronRight size={18} color="#9CA3AF" />
    </View>

    <View style={styles.divider} />

    {/* Truck info */}
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>Truck Type</Text>
      <View style={styles.truckTags}>
        <View style={styles.tag}>
          <Text style={styles.tagText}>🚛 {load.vehicleType}</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>⚖️ {load.weight} TON</Text>
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>⚙️ {load.axle}</Text>
        </View>
      </View>
    </View>

    {/* Product + Payment */}
    <View style={styles.metaRow}>
      <View style={styles.metaCol}>
        <Text style={styles.metaLabel}>Product</Text>
        <Text style={styles.metaValue} numberOfLines={1}>{load.goodsType}</Text>
      </View>
      <View style={styles.metaCol}>
        <Text style={styles.metaLabel}>Payment</Text>
        <Text style={styles.metaValue} numberOfLines={1}>{load.paymentTerms}</Text>
      </View>
      {load.paymentGuaranteed && (
        <View style={styles.guaranteeBadge}>
          <Text style={styles.guaranteeText}>✅ PAYMENT{'\n'}GUARANTEED</Text>
        </View>
      )}
    </View>

  </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1E3A8A',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 12, color: '#93C5FD', marginTop: 2 },

  filterSection: {
    backgroundColor: '#fff',
    elevation: 2,
    zIndex: 10,
  },
  categoryChip: {
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minWidth: 80,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  categoryChipActive: { backgroundColor: '#EFF6FF', borderColor: '#1E3A8A' },
  categoryChipLabel:  { fontSize: 13, fontWeight: '600', color: '#374151', marginTop: 4 },
  categoryChipLabelActive: { color: '#1E3A8A' },
  categoryChipTons:   { fontSize: 10, color: '#9CA3AF', marginTop: 2 },
  categoryChipTonsActive: { color: '#3B82F6' },
  countBadge: {
    position: 'absolute',
    top: -4, right: -4,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 18, height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  countBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' },

  loadCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 12,
  },
  newBadge: {
    position: 'absolute', top: 0, right: 0,
    backgroundColor: '#22C55E',
    borderTopRightRadius: 16,
    borderBottomLeftRadius: 10,
    paddingHorizontal: 10, paddingVertical: 4,
    zIndex: 1,
  },
  newBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },

  routeRow:   { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  routeDots:  { alignItems: 'center', gap: 3 },
  dotGreen:   { width: 10, height: 10, borderRadius: 5, backgroundColor: '#22C55E' },
  dotRed:     { width: 10, height: 10, borderRadius: 5, backgroundColor: '#EF4444' },
  routeLine:  { width: 2, height: 20, backgroundColor: '#D1D5DB' },
  routeCities:{ flex: 1, gap: 10 },
  cityText:   { fontSize: 15, fontWeight: '700', color: '#1a1a1a' },

  divider:    { height: 1, backgroundColor: '#F3F4F6', marginBottom: 10 },

  infoLabel:  { fontSize: 11, color: '#6B7280', marginBottom: 6, fontWeight: '500' },
  infoRow:    { marginBottom: 10 },
  truckTags:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    paddingHorizontal: 8, paddingVertical: 4,
  },
  tagText: { fontSize: 12, color: '#374151', fontWeight: '500' },

  metaRow:    { flexDirection: 'row', gap: 8, alignItems: 'center' },
  metaCol:    { flex: 1, paddingRight: 4 },
  metaLabel:  { fontSize: 11, color: '#6B7280', marginBottom: 2 },
  metaValue:  { fontSize: 13, fontWeight: '600', color: '#1a1a1a' },

  guaranteeBadge: {
    marginLeft: 'auto',
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 6,
    borderWidth: 1, borderColor: '#22C55E',
  },
  guaranteeText: { fontSize: 9, color: '#16A34A', fontWeight: '800', textAlign: 'center' },

  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyIcon:  { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#1a1a1a', marginBottom: 6 },
  emptySub:   { fontSize: 14, color: '#6B7280', marginBottom: 20, textAlign: 'center' },
  resetBtn:   { backgroundColor: '#1E3A8A', borderRadius: 20, paddingHorizontal: 24, paddingVertical: 10 },
  resetBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});

export default LoadsResultScreen;
