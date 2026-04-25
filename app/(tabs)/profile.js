import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '../../src/styles/theme';
import { User, ShieldCheck, MapPin, Star, Settings, LogOut, FileText, Banknote, ChevronRight, AlertCircle, Phone } from 'lucide-react-native';

export default function ProfileScreen() {
  const { user, driverProfile, logout } = useAuth();
  const router = useRouter();

  const profile = {
    fullName: driverProfile?.fullName || 'New Driver',
    userType: driverProfile?.userType || 'SOLO_DRIVER',
    vehicleType: driverProfile?.vehicleType || 'Vehicle Info',
    vehicleRegNo: driverProfile?.vehicleRegNo || 'N/A',
    homeCity: driverProfile?.homeCity || '',
    homeState: driverProfile?.homeState || '',
    upiId: driverProfile?.upiId || '',
    phone: driverProfile?.phone || user?.phoneNumber || '',
    vehicles: driverProfile?.vehicles || []
  };

  const primaryVehicle = profile.vehicles[0] || { 
    vehicleRegNo: profile.vehicleRegNo, 
    vehicleType: profile.vehicleType 
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{profile.fullName.charAt(0)}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{profile.fullName}</Text>
            <Text style={styles.vehicleText}>
              {profile.userType === 'TRANSPORTER' 
                ? `${profile.vehicles.length} Vehicles in Fleet` 
                : `${primaryVehicle.vehicleRegNo} • ${primaryVehicle.vehicleType}`}
            </Text>
            <View style={styles.phoneRow}>
               <Phone size={14} color={theme.colors.textSecondary} />
               <Text style={styles.phoneText}>{profile.phone || 'Phone not set'}</Text>
            </View>
          </View>
        </View>

        {/* Verification Status */}
        <View style={styles.statusBox}>
           <ShieldCheck size={24} color={theme.colors.success} />
           <View style={{flex: 1, marginLeft: 12}}>
             <Text style={styles.statusHeader}>Verified Partner</Text>
             <Text style={styles.statusSub}>You can bid on all loads</Text>
           </View>
        </View>

        {/* Rating Summary */}
        <View style={styles.ratingCard}>
           <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={styles.sectionTitle}>Your Rating</Text>
              <View style={styles.ratingBadge}>
                 <Star size={18} color="#fff" fill="#fff" />
                 <Text style={styles.ratingValueText}>4.8</Text>
              </View>
           </View>
           <View style={styles.ratingBars}>
              <View style={styles.ratingRow}><Text style={styles.ratingLabel}>Punctuality</Text><View style={styles.barBg}><View style={[styles.barFill, {width: '95%'}]}/></View></View>
              <View style={styles.ratingRow}><Text style={styles.ratingLabel}>Goods Safety</Text><View style={styles.barBg}><View style={[styles.barFill, {width: '98%'}]}/></View></View>
              <View style={styles.ratingRow}><Text style={styles.ratingLabel}>Communication</Text><View style={styles.barBg}><View style={[styles.barFill, {width: '85%'}]}/></View></View>
           </View>
        </View>

        {/* My Fleet (Transporter Only) */}
        {profile.userType === 'TRANSPORTER' && (
          <View style={styles.fleetSection}>
            <View style={styles.fleetHeader}>
              <Text style={styles.sectionTitle}>My Fleet</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add Vehicle', 'Adding new vehicle feature coming soon.')}>
                <Text style={styles.addVehicleLink}>+ Add</Text>
              </TouchableOpacity>
            </View>

            {profile.vehicles.map((v, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.fleetCard}
                onPress={() => Alert.alert('Edit Vehicle', `Edit vehicle ${v.vehicleRegNo}`)}
              >
                <View style={styles.fleetCardHeader}>
                  <Text style={styles.fleetRegText}>{v.vehicleRegNo || 'No Reg'}</Text>
                  <Text style={styles.fleetTypeText}>{v.vehicleType || 'Type'}</Text>
                </View>
                <View style={styles.driverInfoRow}>
                  <User size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.driverText}>{v.driverName || 'No Driver Assigned'}</Text>
                </View>
                <View style={styles.driverInfoRow}>
                  <Phone size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.driverText}>{v.driverPhone || 'No Phone'}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuGroup}>
           <Text style={styles.sectionTitle}>Account & Settings</Text>

           <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/(auth)/document-upload', params: { isEdit: 'true' } })}>
              <View style={styles.menuIconBox}><FileText size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>My Documents</Text>
              <View style={styles.warningBadge}><AlertCircle size={14} color={theme.colors.warning} /><Text style={styles.warningText}>Renew RC</Text></View>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Payment Methods', 'UPI management coming soon.')}>
              <View style={styles.menuIconBox}><Banknote size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>Payment Methods (UPI)</Text>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Settings', 'App settings coming soon.')}>
              <View style={styles.menuIconBox}><Settings size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>App Settings</Text>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
           <LogOut size={20} color={theme.colors.error} />
           <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: { padding: theme.spacing.md, backgroundColor: theme.colors.surface },
  headerTitle: { ...theme.typography.h2, color: theme.colors.text },
  content: { padding: theme.spacing.md },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    padding: theme.spacing.md, borderRadius: theme.borderRadius.xl, marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  avatarBox: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: theme.colors.primary + '20',
    alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md,
  },
  avatarText: { ...theme.typography.h1, color: theme.colors.primary },
  profileInfo: { flex: 1 },
  nameText: { ...theme.typography.h3, color: theme.colors.text },
  vehicleText: { ...theme.typography.body, color: theme.colors.textSecondary, marginTop: 4 },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  phoneText: { ...theme.typography.small, color: theme.colors.textSecondary },
  statusBox: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.statusVerified,
    padding: theme.spacing.md, borderRadius: theme.borderRadius.lg, marginBottom: theme.spacing.lg,
  },
  statusHeader: { ...theme.typography.bodySemiBold, color: theme.colors.statusVerifiedText },
  statusSub: { ...theme.typography.small, color: theme.colors.statusVerifiedText, marginTop: 2 },
  ratingCard: {
    backgroundColor: theme.colors.surface, padding: theme.spacing.md, borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.lg, ...theme.shadows.sm,
  },
  ratingBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.accentDark, paddingHorizontal: 12, paddingVertical: 6, borderRadius: theme.borderRadius.full, gap: 6 },
  ratingValueText: { ...theme.typography.bodySemiBold, color: '#fff' },
  sectionTitle: { ...theme.typography.h4, color: theme.colors.text, marginBottom: theme.spacing.md },
  ratingBars: { marginTop: 12 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  ratingLabel: { width: 110, ...theme.typography.small, color: theme.colors.textSecondary },
  barBg: { flex: 1, height: 8, backgroundColor: theme.colors.borderLight, borderRadius: 4, overflow: 'hidden' },
  barFill: { height: '100%', backgroundColor: theme.colors.accent },
  menuGroup: { marginBottom: theme.spacing.xl },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.surface,
    padding: theme.spacing.md, borderRadius: theme.borderRadius.md, marginBottom: 8, ...theme.shadows.xs,
  },
  menuIconBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.primary + '10', alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md },
  menuText: { flex: 1, ...theme.typography.bodyMedium, color: theme.colors.text },
  warningBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 4, marginRight: 8 },
  warningText: { ...theme.typography.small, color: '#92400E' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: theme.colors.statusRejected, padding: 16, borderRadius: theme.borderRadius.md,
  },
  logoutText: { ...theme.typography.button, color: theme.colors.error },
  fleetSection: { marginBottom: theme.spacing.lg },
  fleetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.md },
  addVehicleLink: { ...theme.typography.button, color: theme.colors.primary },
  fleetCard: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.xs,
  },
  fleetCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: theme.spacing.sm },
  fleetRegText: { ...theme.typography.bodySemiBold, color: theme.colors.text },
  fleetTypeText: { ...theme.typography.small, color: theme.colors.primary, backgroundColor: theme.colors.primary + '10', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  driverInfoRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  driverText: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
});
