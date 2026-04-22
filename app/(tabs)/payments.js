import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '../../src/styles/theme';
import { IndianRupee, Download, MapPin, Calendar, CheckCircle2, Clock } from 'lucide-react-native';

const DUMMY_PAYMENTS = [
  {
    id: 'p1',
    route: 'Chennai → Bengaluru',
    date: '15 Oct 2023',
    total: 23500,
    advance: { amount: 18800, date: '15 Oct, 02:00 PM', method: 'UPI', status: 'PAID' },
    balance: { amount: 4700, date: '16 Oct, 11:30 AM', method: 'UPI', status: 'PENDING' },
    paymentStatus: 'Balance Pending'
  },
  {
    id: 'p2',
    route: 'Madurai → Kochi',
    date: '10 Oct 2023',
    total: 15800,
    advance: { amount: 12640, date: '10 Oct, 01:00 PM', method: 'UPI', status: 'PAID' },
    balance: { amount: 3160, date: '12 Oct, 09:00 AM', method: 'BANK', status: 'PAID' },
    paymentStatus: 'Fully Paid'
  }
];

export default function PaymentsScreen() {
  
  const handleDownload = () => {
    // Basic mock for PDF Export
    alert('Earnings Statement PDF descending locally in a real app.');
  };

  const PaymentCard = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.routeRow}>
          <MapPin size={16} color={theme.colors.textSecondary} />
          <Text style={styles.routeText}>{item.route}</Text>
        </View>
        <Text style={styles.dateText}>{item.date}</Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total Bid Amount</Text>
        <Text style={styles.totalValue}>₹{item.total.toLocaleString()}</Text>
      </View>

      <View style={styles.breakdownBox}>
         <View style={styles.breakdownRow}>
           <View>
             <Text style={styles.breakdownLabel}>Advance (80%)</Text>
             <Text style={styles.breakdownSub}>{item.advance.status === 'PAID' ? `Paid via ${item.advance.method}` : 'Pending'}</Text>
           </View>
           <View style={{alignItems: 'flex-end'}}>
             <Text style={styles.breakdownValue}>₹{item.advance.amount.toLocaleString()}</Text>
             {item.advance.status === 'PAID' ? (
                <CheckCircle2 size={16} color={theme.colors.success} style={{marginTop: 4}} />
             ) : (
                <Clock size={16} color={theme.colors.warning} style={{marginTop: 4}} />
             )}
           </View>
         </View>

         <View style={styles.divider} />

         <View style={styles.breakdownRow}>
           <View>
             <Text style={styles.breakdownLabel}>Balance (20%)</Text>
             <Text style={styles.breakdownSub}>{item.balance.status === 'PAID' ? `Paid via ${item.balance.method}` : 'Pending'}</Text>
           </View>
           <View style={{alignItems: 'flex-end'}}>
             <Text style={styles.breakdownValue}>₹{item.balance.amount.toLocaleString()}</Text>
             {item.balance.status === 'PAID' ? (
                <CheckCircle2 size={16} color={theme.colors.success} style={{marginTop: 4}} />
             ) : (
                <Clock size={16} color={theme.colors.warning} style={{marginTop: 4}} />
             )}
           </View>
         </View>
      </View>

      <View style={[
        styles.statusBadge, 
        item.paymentStatus === 'Fully Paid' ? styles.statusBadgePaid : styles.statusBadgePending
      ]}>
        <Text style={[
          styles.statusBadgeText,
          item.paymentStatus === 'Fully Paid' ? styles.statusTextPaid : styles.statusTextPending
        ]}>
          {item.paymentStatus}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Earnings & Payments</Text>
        <TouchableOpacity style={styles.downloadBtn} onPress={handleDownload}>
          <Download size={20} color={theme.colors.primary} />
          <Text style={styles.downloadBtnText}>Statement</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>This Week</Text>
            <Text style={styles.summaryValue}>₹23,500</Text>
          </View>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>This Month</Text>
            <Text style={styles.summaryValue}>₹85,200</Text>
          </View>
          <View style={[styles.summaryBox, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.summaryLabel, {color: theme.colors.textInverse, opacity: 0.8}]}>All Time</Text>
            <Text style={[styles.summaryValue, {color: theme.colors.textInverse}]}>₹4,12,500</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Transaction History</Text>
        
        {DUMMY_PAYMENTS.map(item => <PaymentCard key={item.id} item={item} />)}
        <View style={{height: 20}}/>
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    padding: theme.spacing.md, backgroundColor: theme.colors.surface,
  },
  headerTitle: { ...theme.typography.h2, color: theme.colors.text },
  downloadBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    backgroundColor: theme.colors.primary + '10', borderRadius: theme.borderRadius.full,
  },
  downloadBtnText: { ...theme.typography.label, color: theme.colors.primary },
  contentContainer: { padding: theme.spacing.md },
  summaryContainer: {
    flexDirection: 'row', gap: 10, marginBottom: theme.spacing.lg,
  },
  summaryBox: {
    flex: 1, padding: theme.spacing.md, backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md, ...theme.shadows.sm,
  },
  summaryLabel: { ...theme.typography.small, color: theme.colors.textSecondary, marginBottom: 4 },
  summaryValue: { ...theme.typography.bodySemiBold, color: theme.colors.text },
  sectionTitle: { ...theme.typography.h4, color: theme.colors.text, marginBottom: theme.spacing.md },
  card: {
    backgroundColor: theme.colors.surface, borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md, marginBottom: theme.spacing.md, ...theme.shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeText: { ...theme.typography.bodyMedium, color: theme.colors.textSecondary },
  dateText: { ...theme.typography.small, color: theme.colors.textSecondary },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  totalLabel: { ...theme.typography.body, color: theme.colors.text },
  totalValue: { ...theme.typography.h3, color: theme.colors.text },
  breakdownBox: {
    backgroundColor: theme.colors.background, borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md, marginBottom: theme.spacing.md,
  },
  breakdownRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
  },
  breakdownLabel: { ...theme.typography.bodyMedium, color: theme.colors.text },
  breakdownSub: { ...theme.typography.small, color: theme.colors.textSecondary, marginTop: 2 },
  breakdownValue: { ...theme.typography.bodySemiBold, color: theme.colors.text },
  divider: { height: 1, backgroundColor: theme.colors.borderLight, marginVertical: theme.spacing.sm },
  statusBadge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: theme.borderRadius.sm },
  statusBadgePaid: { backgroundColor: theme.colors.statusAccepted },
  statusTextPaid: { color: theme.colors.statusAcceptedText, ...theme.typography.small, fontWeight: '700' },
  statusBadgePending: { backgroundColor: theme.colors.statusPending },
  statusTextPending: { color: theme.colors.statusPendingText, ...theme.typography.small, fontWeight: '700' }
});
