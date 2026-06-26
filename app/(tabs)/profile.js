import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useAuth } from '../../src/context/AuthContext';
import { useRouter } from 'expo-router';
import { theme } from '../../src/styles/theme';
import { User, ShieldCheck, Star, Settings, LogOut, FileText, Banknote, ChevronRight, AlertCircle, Phone, Languages, Check } from 'lucide-react-native';
import { useLanguage } from '../../src/context/LanguageContext';
import { LANGUAGES } from '../../src/i18n/translations';
import { haptics } from '../../src/utils/haptics';

export default function ProfileScreen() {
  const { user, driverProfile, logout } = useAuth();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();

  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLangLabel = LANGUAGES.find(l => l.code === language)?.label || 'English';

  const profile = {
    fullName: driverProfile?.fullName || t('profile.newDriver'),
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
    haptics.medium();
    Alert.alert(t('profile.logout'), t('profile.logoutConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.logout'), style: 'destructive', onPress: async () => {
        await logout();
        router.replace('/(auth)');
      }}
    ]);
  };

  const handleSelectLanguage = (code) => {
    haptics.select();
    setLanguage(code);
    setLangModalVisible(false);
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
                ? t('profile.vehiclesInFleet', { count: profile.vehicles.length })
                : `${primaryVehicle.vehicleRegNo} • ${primaryVehicle.vehicleType}`}
            </Text>
            <View style={styles.phoneRow}>
               <Phone size={14} color={theme.colors.textSecondary} />
               <Text style={styles.phoneText}>{profile.phone || t('profile.phoneNotSet')}</Text>
            </View>
          </View>
        </View>

        {/* Verification Status */}
        <View style={styles.statusBox}>
           <ShieldCheck size={24} color={theme.colors.success} />
           <View style={{flex: 1, marginLeft: 12}}>
             <Text style={styles.statusHeader}>{t('profile.verified')}</Text>
             <Text style={styles.statusSub}>{t('profile.canBid')}</Text>
           </View>
        </View>

        {/* Rating Summary */}
        <View style={styles.ratingCard}>
           <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
              <Text style={styles.sectionTitle}>{t('profile.yourRating')}</Text>
              <View style={styles.ratingBadge}>
                 <Star size={18} color="#fff" fill="#fff" />
                 <Text style={styles.ratingValueText}>4.8</Text>
              </View>
           </View>
           <View style={styles.ratingBars}>
              <View style={styles.ratingRow}><Text style={styles.ratingLabel}>{t('profile.punctuality')}</Text><View style={styles.barBg}><View style={[styles.barFill, {width: '95%'}]}/></View></View>
              <View style={styles.ratingRow}><Text style={styles.ratingLabel}>{t('profile.goodsSafety')}</Text><View style={styles.barBg}><View style={[styles.barFill, {width: '98%'}]}/></View></View>
              <View style={styles.ratingRow}><Text style={styles.ratingLabel}>{t('profile.communication')}</Text><View style={styles.barBg}><View style={[styles.barFill, {width: '85%'}]}/></View></View>
           </View>
        </View>

        {/* My Fleet (Transporter Only) */}
        {profile.userType === 'TRANSPORTER' && (
          <View style={styles.fleetSection}>
            <View style={styles.fleetHeader}>
              <Text style={styles.sectionTitle}>{t('profile.myFleet')}</Text>
              <TouchableOpacity onPress={() => Alert.alert('Add Vehicle', 'Adding new vehicle feature coming soon.')}>
                <Text style={styles.addVehicleLink}>{t('profile.add')}</Text>
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
                  <Text style={styles.driverText}>{v.driverName || t('profile.noDriver')}</Text>
                </View>
                <View style={styles.driverInfoRow}>
                  <Phone size={14} color={theme.colors.textSecondary} />
                  <Text style={styles.driverText}>{v.driverPhone || t('profile.noPhone')}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Menu Items */}
        <View style={styles.menuGroup}>
           <Text style={styles.sectionTitle}>{t('profile.accountSettings')}</Text>

           <TouchableOpacity style={styles.menuItem} onPress={() => router.push({ pathname: '/(auth)/document-upload', params: { isEdit: 'true' } })}>
              <View style={styles.menuIconBox}><FileText size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>{t('profile.myDocuments')}</Text>
              <View style={styles.warningBadge}><AlertCircle size={14} color={theme.colors.warning} /><Text style={styles.warningText}>{t('profile.renewRC')}</Text></View>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Payment Methods', 'UPI management coming soon.')}>
              <View style={styles.menuIconBox}><Banknote size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>{t('profile.paymentMethods')}</Text>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('Settings', 'App settings coming soon.')}>
              <View style={styles.menuIconBox}><Settings size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>{t('profile.appSettings')}</Text>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>

           <TouchableOpacity style={styles.menuItem} onPress={() => { haptics.select(); setLangModalVisible(true); }}>
              <View style={styles.menuIconBox}><Languages size={20} color={theme.colors.primary} /></View>
              <Text style={styles.menuText}>{t('profile.language')}</Text>
              <Text style={styles.menuValue}>{currentLangLabel}</Text>
              <ChevronRight size={20} color={theme.colors.border} />
           </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
           <LogOut size={20} color={theme.colors.error} />
           <Text style={styles.logoutText}>{t('profile.logout')}</Text>
        </TouchableOpacity>

        <View style={{height: 40}} />
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalSheet} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>{t('profile.selectLanguage')}</Text>
            {LANGUAGES.map(lang => (
              <TouchableOpacity
                key={lang.code}
                style={styles.langOption}
                onPress={() => handleSelectLanguage(lang.code)}
              >
                <Text style={[styles.langOptionText, language === lang.code && styles.langOptionTextActive]}>
                  {lang.label}
                </Text>
                {language === lang.code && <Check size={20} color={theme.colors.primary} />}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
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
  menuValue: { ...theme.typography.small, color: theme.colors.textSecondary, marginRight: 6 },
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

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.lg, paddingBottom: 32,
  },
  modalTitle: { ...theme.typography.h3, color: theme.colors.text, marginBottom: theme.spacing.sm },
  langOption: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: theme.colors.borderLight,
  },
  langOptionText: { ...theme.typography.body, color: theme.colors.text },
  langOptionTextActive: { color: theme.colors.primary, fontWeight: '700' },
});
