import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/styles/theme';
import { Search, Filter, MapPin, Calendar, Weight, ArrowRight, X, ChevronDown, Check } from 'lucide-react-native';

export const DUMMY_LOADS = [
  {
    id: '1',
    pickup: 'Chennai, TN',
    pickupAddress: 'Plot 45, SIPCOT Industrial Park, Irrungattukottai, Chennai 602105',
    pickupLat: 13.0827, pickupLng: 80.2707,
    drop: 'Bengaluru, KA',
    dropAddress: 'Warehouse 12, Bommasandra Industrial Area, Bengaluru 560099',
    dropLat: 12.9716, dropLng: 77.5946,
    date: '15 Oct, 10:00 AM',
    expectedDelivery: '16 Oct, 08:00 PM',
    weight: '12 Tons',
    goods: 'Industrial Parts',
    budgetMin: 20000,
    budgetMax: 24000,
    distance: 345,
    distanceText: '345 km',
    vehicle: '16-ft Open Truck',
    instructions: 'Requires secure covering. Fast transit needed.',
    totalBidsCount: 12,
    timeRemaining: '2h 15m',
    status: 'pending'
  },
  {
    id: '2',
    pickup: 'Coimbatore, TN',
    pickupAddress: 'Block 2, SIDCO, Coimbatore, TN 641021',
    pickupLat: 11.0168, pickupLng: 76.9558,
    drop: 'Hyderabad, TS',
    dropAddress: 'Gachibowli Logistics Hub, Hyderabad 500032',
    dropLat: 17.3850, dropLng: 78.4867,
    date: '16 Oct, 08:30 AM',
    expectedDelivery: '18 Oct, 09:00 AM',
    weight: '18 Tons',
    goods: 'Textiles',
    budgetMin: 45000,
    budgetMax: 52000,
    distance: 912,
    distanceText: '912 km',
    vehicle: '22-ft Closed Truck',
    instructions: 'Keep dry. Avoid rain.',
    totalBidsCount: 5,
    timeRemaining: '4h 30m',
    status: 'pending'
  },
  {
    id: '3',
    pickup: 'Madurai, TN',
    pickupAddress: 'Kapur Industrial Estate, Madurai 625001',
    pickupLat: 9.9252, pickupLng: 78.1198,
    drop: 'Kochi, KL',
    dropAddress: 'Kochi Port Trust Warehouse, Kochi 682009',
    dropLat: 9.9312, dropLng: 76.2673,
    date: '15 Oct, 02:00 PM',
    expectedDelivery: '16 Oct, 06:00 AM',
    weight: '8 Tons',
    goods: 'FMCG Goods',
    budgetMin: 14000,
    budgetMax: 18000,
    distance: 270,
    distanceText: '270 km',
    vehicle: 'Mini Truck',
    instructions: 'Handle with care.',
    totalBidsCount: 22,
    timeRemaining: '1h 05m',
    status: 'pending'
  }
];

export default function AvailableLoads() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [filters, setFilters] = useState({
    vehicleType: '',
    startingPoint: '',
    destination: '',
  });

  const extractUnique = (field) => {
    const items = DUMMY_LOADS.map((load) => load[field]);
    return ['All', ...new Set(items)];
  };

  const startingPoints = useMemo(() => extractUnique('pickup'), []);
  const destinations = useMemo(() => extractUnique('drop'), []);
  const vehicleTypes = useMemo(() => extractUnique('vehicle'), []);

  const isFilterActive = useMemo(() => {
    return Object.values(filters).some(v => v !== '');
  }, [filters]);

  const filteredLoads = useMemo(() => {
    return DUMMY_LOADS.filter(load => {
      // Search filter
      const query = search.toLowerCase().trim();
      const matchesSearch = !query || 
        load.pickup.toLowerCase().includes(query) || 
        load.drop.toLowerCase().includes(query) ||
        load.vehicle.toLowerCase().includes(query);

      // Category filters
      const matchesVehicle = !filters.vehicleType || load.vehicle === filters.vehicleType;
      const matchesFrom = !filters.startingPoint || load.pickup === filters.startingPoint;
      const matchesTo = !filters.destination || load.drop === filters.destination;

      return matchesSearch && matchesVehicle && matchesFrom && matchesTo;
    });
  }, [search, filters]);

  const formatBudgetRange = (min, max) => {
    return `₹${Math.round(min/1000)}k – ₹${Math.round(max/1000)}k`;
  };

  const ChipSelector = ({ options, selected, onSelect }) => (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((option) => {
        const isActive = selected === option || (option === 'All' && !selected);
        return (
          <TouchableOpacity
            key={option}
            onPress={() => onSelect(option === 'All' ? '' : option)}
            style={[styles.chip, isActive && styles.chipActive]}
          >
            <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
              {option}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  const LoadCard = ({ item }) => (
    <TouchableOpacity style={styles.card} onPress={() => router.push(`/(tabs)/loads/${item.id}`)}>
      <View style={styles.cardHeader}>
        <View style={styles.routeContainer}>
          <View style={styles.locationRow}>
            <MapPin size={16} color={theme.colors.primary} />
            <Text style={styles.locationText}>{item.pickup}</Text>
          </View>
          <View style={styles.routeLine} />
          <View style={styles.locationRow}>
            <MapPin size={16} color={theme.colors.error} />
            <Text style={styles.locationText}>{item.drop}</Text>
          </View>
        </View>
        <View style={styles.budgetBadge}>
          <Text style={styles.budgetText}>{formatBudgetRange(item.budgetMin, item.budgetMax)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Calendar size={14} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.date}</Text>
        </View>
        <View style={styles.detailItem}>
          <Weight size={14} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.weight}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.detailLabel}>Dist: </Text>
          <Text style={styles.detailText}>{item.distance}</Text>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.vehicleText}>{item.vehicle}</Text>
        <TouchableOpacity style={styles.viewBtn} onPress={() => router.push(`/(tabs)/loads/${item.id}`)}>
          <Text style={styles.viewBtnText}>View Load</Text>
          <ArrowRight size={16} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchSection}>
        <View style={styles.searchBar}>
          <Search size={20} color={theme.colors.textSecondary} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by city or truck..."
            placeholderTextColor={theme.colors.textSecondary}
            value={search}
            onChangeText={setSearch}
            clearButtonMode="while-editing"
          />
        </View>
        <TouchableOpacity 
          style={[styles.filterBtn, isFilterActive && styles.filterBtnActive]} 
          onPress={() => setShowFilter(true)}
        >
          <Filter size={20} color={isFilterActive ? '#fff' : theme.colors.primary} />
          {isFilterActive && <View style={styles.activeDot} />}
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredLoads}
        keyExtractor={item => item.id}
        renderItem={({ item }) => <LoadCard item={item} />}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No loads found for "{search}"</Text>
            {isFilterActive && (
              <TouchableOpacity onPress={() => setFilters({ vehicleType: '', startingPoint: '', destination: '' })}>
                <Text style={styles.clearUnderline}>Clear all filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal visible={showFilter} animationType="slide" transparent={true} onRequestClose={() => setShowFilter(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowFilter(false)} />
        <View style={styles.filterSheet}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filter Loads</Text>
            <TouchableOpacity onPress={() => setFilters({ startingPoint: '', destination: '', vehicleType: '' })}>
              <Text style={styles.clearText}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>📍 Starting Point</Text>
              <ChipSelector
                options={startingPoints}
                selected={filters.startingPoint}
                onSelect={(val) => setFilters(prev => ({ ...prev, startingPoint: val }))}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>🔴 Destination</Text>
              <ChipSelector
                options={destinations}
                selected={filters.destination}
                onSelect={(val) => setFilters(prev => ({ ...prev, destination: val }))}
              />
            </View>

            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>🚛 Vehicle Type</Text>
              <ChipSelector
                options={vehicleTypes}
                selected={filters.vehicleType}
                onSelect={(val) => setFilters(prev => ({ ...prev, vehicleType: val }))}
              />
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.applyBtn} onPress={() => setShowFilter(false)}>
            <Text style={styles.applyBtnText}>Apply Filters</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  searchSection: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    gap: 10,
    alignItems: 'center',
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 12,
    height: 48,
    borderRadius: theme.borderRadius.md,
    gap: 8,
    ...theme.shadows.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 15,
  },
  filterBtn: {
    padding: 12,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    ...theme.shadows.sm,
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routeContainer: {
    flex: 1,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  routeLine: {
    width: 2,
    height: 12,
    backgroundColor: theme.colors.border,
    marginLeft: 7,
    marginVertical: 4,
  },
  budgetBadge: {
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  budgetText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: 15,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: 12,
  },
  cardDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
    paddingHorizontal: 2,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  viewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.primary + '10',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: theme.borderRadius.md,
  },
  viewBtnText: {
    color: theme.colors.primary,
    fontWeight: '600',
    fontSize: 14,
  },
  detailLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '400',
  },
  filterBtnActive: {
    backgroundColor: theme.colors.primary,
  },
  activeDot: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.error,
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginBottom: 8,
  },
  clearUnderline: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  filterSheet: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '75%', 
    paddingBottom: 0,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  filterTitle:   { fontSize: 17, fontWeight: '700', color: '#1a1a1a' },
  clearText:     { fontSize: 14, color: '#1E3A8A', fontWeight: '600' },
  filterSection: { marginBottom: 20 },
  filterLabel:   { fontSize: 13, fontWeight: '700', color: '#444', marginBottom: 10 },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f5f5f5',
  },
  chipActive: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  chipText:       { fontSize: 13, color: '#555' },
  chipTextActive: { fontSize: 13, color: '#fff', fontWeight: '600' },
  applyBtn: {
    backgroundColor: '#1E3A8A',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32, // More padding for bottom edge
  },
  applyBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
