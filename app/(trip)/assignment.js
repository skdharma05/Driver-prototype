import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../src/styles/theme';
import { MapPin, Phone, User, Info, FileText, CheckCircle2, XCircle } from 'lucide-react-native';
import { DUMMY_APPROVED_BID } from '../../src/constants/dummyData';

export default function AssignmentDetailsScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();

  // Mock data for assignment
  const assignment = id === 'B001' ? {
    pickupAddress: DUMMY_APPROVED_BID.load.pickupCity + ' (Full Address)',
    pickupContact: 'KKP Logistics Support',
    pickupPhone: '+919000000000',
    dropAddress: DUMMY_APPROVED_BID.load.dropCity + ' (Full Address)',
    dropContact: 'Suresh Logistics',
    dropPhone: '+919111111111',
    date: DUMMY_APPROVED_BID.load.pickupDate,
    instructions: 'Fragile goods. Maintain speed limit of 50 km/h. Park near gate 2.',
    bidAmount: DUMMY_APPROVED_BID.amount,
    advance: DUMMY_APPROVED_BID.amount * 0.8,
    balance: DUMMY_APPROVED_BID.amount * 0.2,
  } : {
    pickupAddress: 'Plot 45, SIPCOT Industrial Park, Irrungattukottai, Chennai 602105',
    pickupContact: 'Ramesh Kumar',
    pickupPhone: '+919876543210',
    dropAddress: 'Warehouse 12, Bommasandra Industrial Area, Bengaluru 560099',
    dropContact: 'Suresh Logistics',
    dropPhone: '+919876543211',
    date: '15 Oct, 10:00 AM',
    instructions: 'Fragile goods. Maintain speed limit of 50 km/h. Park near gate 2.',
    bidAmount: 23500,
    advance: 18800,
    balance: 4700,
  };

  const KKP_ADMIN_PHONE = '+919876543210';

  const handleAccept = async () => {
    setLoading(true);
    try {
      const mockTrip = {
        id: id || assignment.id || 'T123',
        pickupCity: 'Chennai',
        dropCity: 'Bengaluru',
        vehicleType: '16-ft Open Truck',
        distance: 345,
        pickupDate: assignment.date,
      };
      await AsyncStorage.setItem('activeTrip', JSON.stringify(mockTrip));
      setLoading(false);
      // Navigate to home to show active trip
      router.replace('/(tabs)');
    } catch (e) {
      setLoading(false);
      Alert.alert('Error', 'Could not accept trip. Please try again.');
    }
  };

  const handleDecline = () => {
    Alert.alert(
      'Decline Assignment',
      'Are you sure you want to decline this trip?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Yes, Decline', 
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              router.replace('/(tabs)');
            }, 1000);
          }
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>New Assignment!</Text>
        <Text style={styles.headerSubtitle}>Please accept to start the trip</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Addresses */}
        <View style={styles.section}>
          
          <View style={styles.locationGroup}>
             <View style={styles.locationHeader}>
                <MapPin size={20} color={theme.colors.success} />
                <Text style={styles.locationTitle}>Pickup Address</Text>
             </View>
             <Text style={styles.addressText}>{assignment.pickupAddress}</Text>
             <Text style={styles.dateTimeText}>On: {assignment.date}</Text>
             
             <View style={styles.contactCard}>
                <User size={16} color={theme.colors.textSecondary} />
                <Text style={styles.contactText}>KKP Logistics Support</Text>
                <TouchableOpacity 
                   style={styles.callCircle}
                   onPress={() => Linking.openURL(`tel:${KKP_ADMIN_PHONE}`)}
                >
                   <Phone size={14} color="#fff" />
                </TouchableOpacity>
             </View>
          </View>

          <View style={styles.routeLine} />

          <View style={styles.locationGroup}>
             <View style={styles.locationHeader}>
                <MapPin size={20} color={theme.colors.error} />
                <Text style={styles.locationTitle}>Drop Address</Text>
             </View>
             <Text style={styles.addressText}>{assignment.dropAddress}</Text>
             
             <View style={styles.contactCard}>
                <User size={16} color={theme.colors.textSecondary} />
                <Text style={styles.contactText}>{assignment.dropContact}</Text>
                <TouchableOpacity 
                   style={styles.callCircle}
                   onPress={() => Linking.openURL(`tel:${assignment.dropPhone}`)}
                >
                   <Phone size={14} color="#fff" />
                </TouchableOpacity>
             </View>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.noteSection}>
          <Info size={20} color={theme.colors.warning} />
          <View style={{flex: 1}}>
             <Text style={styles.noteTitle}>Special Instructions</Text>
             <Text style={styles.noteText}>{assignment.instructions}</Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <View style={styles.paymentHeader}>
             <FileText size={20} color={theme.colors.primary} />
             <Text style={styles.sectionTitle}>Payment Breakdown</Text>
          </View>

          <View style={styles.paymentRow}>
             <Text style={styles.paymentLabel}>Total Bid Amount</Text>
             <Text style={styles.paymentTotal}>₹{assignment.bidAmount.toLocaleString()}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.paymentRow}>
             <View>
                <Text style={styles.paymentLabel}>Advance (80%)</Text>
                <Text style={styles.paymentHint}>Paid after Pickup POD</Text>
             </View>
             <Text style={styles.paymentValue}>₹{assignment.advance.toLocaleString()}</Text>
          </View>

          <View style={styles.paymentRow}>
             <View>
                <Text style={styles.paymentLabel}>Balance (20%)</Text>
                <Text style={styles.paymentHint}>Paid after Delivery POD</Text>
             </View>
             <Text style={styles.paymentValue}>₹{assignment.balance.toLocaleString()}</Text>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
         <TouchableOpacity 
           style={styles.declineBtn}
           onPress={handleDecline}
           disabled={loading}
         >
           <XCircle size={20} color={theme.colors.error} />
           <Text style={styles.declineText}>Decline</Text>
         </TouchableOpacity>

         <TouchableOpacity 
           style={styles.acceptBtn}
           onPress={handleAccept}
           disabled={loading}
         >
           {loading ? (
             <ActivityIndicator color="#fff" />
           ) : (
             <>
               <CheckCircle2 size={20} color="#fff" />
               <Text style={styles.acceptText}>Accept Trip</Text>
             </>
           )}
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.primary,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.textInverse,
  },
  headerSubtitle: {
    ...theme.typography.body,
    color: theme.colors.textInverse,
    opacity: 0.8,
    marginTop: 4,
  },
  content: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  locationGroup: {
    paddingVertical: theme.spacing.sm,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  locationTitle: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  addressText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    marginLeft: 28,
  },
  dateTimeText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    marginLeft: 28,
    marginTop: 4,
  },
  routeLine: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: theme.spacing.sm,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: 10,
    borderRadius: theme.borderRadius.md,
    marginLeft: 28,
    marginTop: 12,
    gap: 8,
  },
  contactText: {
    ...theme.typography.body,
    flex: 1,
  },
  callCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSection: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: theme.colors.statusPending,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  noteTitle: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.statusPendingText,
    marginBottom: 4,
  },
  noteText: {
    ...theme.typography.body,
    color: theme.colors.statusPendingText,
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  paymentLabel: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  paymentHint: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  paymentTotal: {
    ...theme.typography.h3,
    color: theme.colors.primary,
  },
  paymentValue: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.borderLight,
    marginVertical: 4,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    paddingBottom: 12, // fallback
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 56,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.error,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  declineText: {
    ...theme.typography.button,
    color: theme.colors.error,
  },
  acceptBtn: {
    flex: 2,
    flexDirection: 'row',
    height: 56,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...theme.shadows.md,
  },
  acceptText: {
    ...theme.typography.buttonLarge,
    color: '#fff',
  }
});
