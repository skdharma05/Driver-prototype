import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useFocusEffect } from 'expo-router';
import { theme } from '../../../src/styles/theme';
import { Truck, MapPin, Calendar, Banknote, ArrowRight, ShieldCheck, Package } from 'lucide-react-native';
import { getBids } from '../../../src/utils/bidStore';
import { DUMMY_APPROVED_BID } from '../../../src/constants/dummyData';

const STATUS_CONFIG = {
  pending:  { label: 'Pending',  bg: theme.colors.statusPending,  text: theme.colors.statusPendingText,  icon: '⏳' },
  approved: { label: 'Approved', bg: theme.colors.statusAccepted, text: theme.colors.statusAcceptedText, icon: '✅' },
  rejected: { label: 'Rejected', bg: theme.colors.statusRejected, text: theme.colors.statusRejectedText, icon: '❌' },
  // Legacy uppercase status from DUMMY_BIDS fallback
  PENDING:  { label: 'Pending',  bg: theme.colors.statusPending,  text: theme.colors.statusPendingText,  icon: '⏳' },
  ACCEPTED: { label: 'Approved', bg: theme.colors.statusAccepted, text: theme.colors.statusAcceptedText, icon: '✅' },
  REJECTED: { label: 'Rejected', bg: theme.colors.statusRejected, text: theme.colors.statusRejectedText, icon: '❌' },
};

const TABS = [
  { key: 'all',      label: 'All' },
  { key: 'pending',  label: 'Pending' },
  { key: 'approved', label: 'Approved' },
  { key: 'rejected', label: 'Rejected' },
];

export default function MyTripsScreen() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchMyBids();
    }, [])
  );

  const fetchMyBids = async () => {
    try {
      setLoading(true);
      const stored = await getBids();
      // Combine stored bids with dummy for testing
      const combined = [DUMMY_APPROVED_BID, ...stored.filter(b => b.bidId !== DUMMY_APPROVED_BID.bidId)];
      setBids(combined);
    } catch (err) {
      Alert.alert('Error', 'Could not load bids.');
    } finally {
      setLoading(false);
    }
  };

  const normaliseStatus = (s) => (s || '').toLowerCase();

  const filteredBids = bids.filter(bid => {
    if (activeTab === 'all') return true;
    return normaliseStatus(bid.status) === activeTab;
  });

  const countFor = (tab) => {
    if (tab === 'all') return bids.length;
    return bids.filter(b => normaliseStatus(b.status) === tab).length;
  };

  const BidCard = ({ item }) => {
    const statusKey = item.status || 'pending';
    const status = STATUS_CONFIG[statusKey] || STATUS_CONFIG.pending;
    const pickupCity = item.load?.pickupCity || item.pickup || '—';
    const dropCity   = item.load?.dropCity   || item.drop   || '—';
    const date       = item.load?.pickupDate  || item.date   || '—';
    const vehicle    = item.load?.vehicleType || '—';
    const amountNum  = typeof item.amount === 'number' ? item.amount : parseInt((item.amount || '0').replace(/[^\d]/g, ''));
    const amountStr  = isNaN(amountNum) ? item.amount : `₹${amountNum.toLocaleString('en-IN')}`;
    const submitted  = item.submittedAt ? new Date(item.submittedAt).toLocaleDateString('en-IN') : null;
    const isApproved = normaliseStatus(item.status) === 'approved' || item.status === 'ACCEPTED';

    return (
      <View style={styles.card}>
        {/* Header row – route + status */}
        <View style={styles.cardHeader}>
          <View style={styles.routeRow}>
            <MapPin size={14} color={theme.colors.success} />
            <Text style={styles.routeCity} numberOfLines={1}>{pickupCity}</Text>
            <Text style={styles.routeArrow}>→</Text>
            <MapPin size={14} color={theme.colors.error} />
            <Text style={styles.routeCity} numberOfLines={1}>{dropCity}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
            <Text style={[styles.statusText, { color: status.text }]}>{status.icon} {status.label}</Text>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Details */}
        <View style={styles.metaGrid}>
          <View style={styles.metaItem}>
            <Banknote size={13} color={theme.colors.textSecondary} />
            <Text style={styles.metaLabel}>Your Offer </Text>
            <Text style={[styles.metaValue, { color: theme.colors.primary }]}>{amountStr}</Text>
          </View>
          <View style={styles.metaItem}>
            <Calendar size={13} color={theme.colors.textSecondary} />
            <Text style={styles.metaValue}>{date}</Text>
          </View>
          <View style={styles.metaItem}>
            <Truck size={13} color={theme.colors.textSecondary} />
            <Text style={styles.metaValue}>{vehicle}</Text>
          </View>
          {submitted && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>Submitted: </Text>
              <Text style={styles.metaValue}>{submitted}</Text>
            </View>
          )}
        </View>

        {/* CTA for approved bids */}
        {isApproved && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => router.push({ pathname: '/(trip)/assignment', params: { id: item.bidId || item.id } })}
          >
            <ShieldCheck size={18} color="#fff" />
            <Text style={styles.actionBtnText}>View Assignment</Text>
            <ArrowRight size={18} color="#fff" style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Status filter chips */}
      <View style={styles.tabsBar}>
        {TABS.map(tab => {
          const count = countFor(tab.key);
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabChip, isActive && styles.tabChipActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabChipText, isActive && styles.tabChipTextActive]}>
                {tab.label} ({count})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 48 }} />
      ) : filteredBids.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Package size={52} color={theme.colors.border} strokeWidth={1} />
          <Text style={styles.emptyTitle}>No bids yet</Text>
          <Text style={styles.emptySub}>
            {activeTab === 'all'
              ? 'Submit an offer on a load to see it here.'
              : `No ${activeTab} bids found.`}
          </Text>
          <TouchableOpacity style={styles.browseBtn} onPress={() => router.push('/(tabs)/loads')}>
            <Text style={styles.browseBtnText}>Browse Loads</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredBids}
          keyExtractor={item => item.bidId || item.id}
          renderItem={({ item }) => <BidCard item={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchMyBids}
          refreshing={loading}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    gap: 8,
    ...theme.shadows.sm,
    flexWrap: 'wrap',
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  tabChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  tabChipText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  tabChipTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 32,
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
    gap: 8,
  },
  routeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    flexWrap: 'wrap',
  },
  routeCity: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
    flexShrink: 1,
  },
  routeArrow: {
    color: theme.colors.textSecondary,
    marginHorizontal: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
  },
  statusText: {
    ...theme.typography.small,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 12,
  },
  metaGrid: {
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaLabel: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
  },
  metaValue: {
    ...theme.typography.small,
    color: theme.colors.text,
    fontWeight: '500',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    gap: 8,
  },
  actionBtnText: {
    ...theme.typography.button,
    color: '#fff',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    padding: theme.spacing.xl,
  },
  emptyTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 6,
  },
  emptySub: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  browseBtn: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.md,
  },
  browseBtnText: {
    ...theme.typography.button,
    color: '#fff',
  },
});
