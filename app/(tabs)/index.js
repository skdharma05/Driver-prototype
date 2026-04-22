import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../../src/styles/theme';
import { useAuth } from '../../src/context/AuthContext';
import { BadgeCheck, BatteryLow, Bell, ChevronRight, LayoutGrid, Package, Truck, Wallet } from 'lucide-react-native';
import * as Battery from 'expo-battery';
import { DUMMY_ACTIVE_TRIP } from '../../src/constants/dummyData';

export default function Dashboard() {
  const router = useRouter();
  const { driverProfile } = useAuth();
  const [batteryLevel, setBatteryLevel] = useState(null);
  const [activeTrip, setActiveTrip] = useState(null);
  
  const [availableLoadsCount, setAvailableLoadsCount] = useState(0);
  const [activeBidsCount, setActiveBidsCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchHomeSummary = () => {
      setTimeout(() => {
        setAvailableLoadsCount(12);
        setActiveBidsCount(3);
        setUnreadCount(2);
      }, 500);
    };
    fetchHomeSummary();
  }, []);

  const KKP_ADMIN_PHONE = '+919876543210';

  useEffect(() => {
    (async () => {
      const level = await Battery.getBatteryLevelAsync();
      setBatteryLevel(level);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      const fetchTrip = async () => {
        try {
          const saved = await AsyncStorage.getItem('activeTrip');
          if (saved) {
            setActiveTrip(JSON.parse(saved));
          } else {
            // For testing: use dummy trip if nothing active
            setActiveTrip(DUMMY_ACTIVE_TRIP);
          }
        } catch (e) {}
      };
      fetchTrip();
    }, [])
  );

  const StatCard = ({ title, value, icon: Icon, color, onPress }) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Icon size={20} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        {/* Header/Profile Summary */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcomeText}>Welcome back,</Text>
            <View style={styles.nameContainer}>
              <Text style={styles.driverName}>{driverProfile?.fullName || 'Driver'}</Text>
              <BadgeCheck size={18} color={theme.colors.success} fill={theme.colors.success + '20'} />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.notificationBtn}
            onPress={() => router.push('/notifications')}
          >
            <Bell size={24} color={theme.colors.text} />
            {unreadCount > 0 && (
              <View style={styles.notificationBadge}>
                <Text style={{color: '#fff', fontSize: 10, fontWeight: 'bold'}}>{unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Battery Alert */}
        {batteryLevel !== null && batteryLevel < 0.2 && (
          <View style={styles.batteryAlert}>
            <BatteryLow size={20} color={theme.colors.error} />
            <Text style={styles.batteryAlertText}>
              Low battery ({Math.round(batteryLevel * 100)}%). Please charge for active tracking.
            </Text>
          </View>
        )}

        {/* Stat Grid */}
        <View style={styles.grid}>
          <StatCard 
            title="Available Loads" 
            value={availableLoadsCount} 
            icon={Package} 
            color={theme.colors.primary} 
            onPress={() => router.push('/(tabs)/loads')}
          />
          <StatCard 
            title="Active Bids" 
            value={activeBidsCount} 
            icon={LayoutGrid} 
            color={theme.colors.secondary} 
            onPress={() => router.push('/(tabs)/trips')}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => router.push('/(tabs)/loads')}
            activeOpacity={0.75}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                <Package size={20} color={theme.colors.primary} />
              </View>
              <Text style={styles.actionText}>View Available Loads</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionRow}
            onPress={() => router.push('/(tabs)/payments')}
            activeOpacity={0.75}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '15' }]}>
                <Wallet size={20} color={theme.colors.success} />
              </View>
              <Text style={styles.actionText}>Payment History</Text>
            </View>
            <ChevronRight size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Current Trip Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Current Trip</Text>
        </View>
        
        {activeTrip ? (
          <TouchableOpacity
            style={styles.activeTripCard}
            onPress={() => router.push(`/(trip)/active?id=${activeTrip.id}`)}
          >
            <View style={styles.tripStatusBadge}>
              <Text style={styles.tripStatusText}>🟢 Trip In Progress</Text>
            </View>
            <View style={styles.tripRoute}>
              <Text style={styles.tripCity}>📍 {activeTrip.pickupCity}</Text>
              <Text style={styles.tripArrow}>→</Text>
              <Text style={styles.tripCity}>📍 {activeTrip.dropCity}</Text>
            </View>
            <Text style={styles.tripMeta}>
              🚛 {activeTrip.vehicleType}  ·  📏 {activeTrip.distance} km
            </Text>
            <Text style={styles.tripMeta}>
              📅 Pickup: {activeTrip.pickupDate}
            </Text>
            <View style={styles.tripActionRow}>
              <TouchableOpacity style={styles.callAdminBtn}
                onPress={() => Linking.openURL(`tel:${KKP_ADMIN_PHONE}`)}
              >
                <Text style={styles.callAdminText}>📞 Call KKP</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.viewTripBtn}
                onPress={() => router.push(`/(trip)/active?id=${activeTrip.id}`)}
              >
                <Text style={styles.viewTripText}>View Trip →</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={styles.emptyCard}>
            <Truck size={40} color={theme.colors.textSecondary} strokeWidth={1} />
            <Text style={styles.emptyTitle}>No Active Trip</Text>
            <Text style={styles.emptySub}>Bid on available loads to start your journey.</Text>
            <TouchableOpacity style={styles.bidButton} onPress={() => router.push('/(tabs)/loads')}>
              <Text style={styles.bidButtonText}>Go to Loads</Text>
            </TouchableOpacity>
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  welcomeText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  driverName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  notificationBtn: {
    padding: 8,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  notificationBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.error,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.surface,
  },
  batteryAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.error + '10',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: 10,
  },
  batteryAlertText: {
    color: theme.colors.error,
    fontSize: 13,
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    ...theme.shadows.sm,
  },
  iconContainer: {
    padding: 10,
    borderRadius: theme.borderRadius.md,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionIcon: {
    padding: 8,
    borderRadius: theme.borderRadius.sm,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.text,
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: theme.colors.border,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
  },
  emptySub: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: theme.spacing.lg,
  },
  bidButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: theme.borderRadius.full,
  },
  bidButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  sectionHeader: {
    marginBottom: theme.spacing.md,
  },
  activeTripCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    ...theme.shadows.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.success,
  },
  tripStatusBadge: {
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tripStatusText: { ...theme.typography.small, color: theme.colors.success, fontWeight: '700' },
  tripRoute: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  tripCity: { ...theme.typography.bodySemiBold, color: theme.colors.text },
  tripArrow: { marginHorizontal: 8, color: theme.colors.textSecondary },
  tripMeta: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  tripActionRow: {
    flexDirection: 'row',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    justifyContent: 'space-between',
    gap: 12,
  },
  callAdminBtn: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  callAdminText: { ...theme.typography.small, color: theme.colors.text, fontWeight: '600' },
  viewTripBtn: {
    flex: 1,
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewTripText: { ...theme.typography.small, color: '#fff', fontWeight: '600' },
});
