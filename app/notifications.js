import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Bell } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { theme } from '../src/styles/theme';

export default function NotificationsScreen() {
  const router = useRouter();

  const MOCK_NOTIFICATIONS = [
    {
      id: '1',
      title: 'New Load Available',
      message: 'A new load from Chennai to Bengaluru matches your route profile.',
      time: '2h ago',
      unread: true,
    },
    {
      id: '2',
      title: 'Bid Accepted',
      message: 'Your bid of ₹22,500 has been accepted for Load #L003.',
      time: '5h ago',
      unread: true,
    },
    {
      id: '3',
      title: 'Payment Received',
      message: 'Advance payment of ₹18,000 has been deposited to your account.',
      time: '1d ago',
      unread: false,
    },
  ];

  const renderItem = ({ item }) => (
    <View style={[styles.notificationCard, item.unread && styles.unreadCard]}>
      <View style={styles.iconContainer}>
        <Bell size={20} color={item.unread ? theme.colors.primary : theme.colors.textSecondary} />
      </View>
      <View style={styles.textContainer}>
        <View style={styles.cardHeader}>
          <Text style={[styles.title, item.unread && styles.unreadText]}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.colors.textInverse} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
      </View>

      <FlatList
        data={MOCK_NOTIFICATIONS}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>You have no new notifications.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.primary,
  },
  backBtn: {
    marginRight: theme.spacing.sm,
  },
  headerTitle: {
    ...theme.typography.h3,
    color: theme.colors.textInverse,
  },
  listContent: {
    padding: theme.spacing.md,
  },
  notificationCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    ...theme.shadows.sm,
  },
  unreadCard: {
    backgroundColor: theme.colors.primary + '05',
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.primary,
  },
  iconContainer: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  title: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
    flex: 1,
  },
  unreadText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  time: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginLeft: 8,
  },
  message: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
});
