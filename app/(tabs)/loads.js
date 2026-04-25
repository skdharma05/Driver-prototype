import React from 'react';
import {
  View, Text, ScrollView,
  TouchableOpacity, StyleSheet
} from 'react-native';
import { ChevronRight, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

// City hubs with their sub-cities
const CITY_HUBS = [
  {
    city: 'Chennai',
    subCities: 'Chittoor | Coimbatore | Kanchipuram | Madurai | Pondicherry | Tiruchirappalli & More',
  },
  {
    city: 'Mumbai',
    subCities: 'Kolhapur | Mumbai City | Nashik | Palghar | Pune | Raigad & More',
  },
  {
    city: 'Bengaluru',
    subCities: 'Mysuru | Hubli | Mangaluru | Tumkur | Bellary & More',
  },
  {
    city: 'Hyderabad',
    subCities: 'Guntur | Krishna | Mahabubnagar | Medak | Medchal | Rangareddy & More',
  },
  {
    city: 'Nagpur',
    subCities: 'Wadi | Wardhamna | Butibori | Hingna | Kapsi | Bhandara Road & More',
  },
  {
    city: 'Delhi',
    subCities: 'Gurgaon | Noida | Faridabad | Ghaziabad | Sonipat & More',
  },
  {
    city: 'Pune',
    subCities: 'Chakan | Talegaon | Pimpri | Chinchwad | Satara & More',
  },
  {
    city: 'Coimbatore',
    subCities: 'Tirupur | Salem | Erode | Namakkal | Karur & More',
  },
];

const LoadsHomeScreen = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#F0F4F8' }}>

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Text style={styles.headerTitle}>Loads</Text>
        <Text style={styles.headerSub}>Select your pickup location</Text>
      </View>

      {/* City Hub List */}
      <ScrollView contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}>

        <View style={styles.sectionHeader}>
          <MapPin size={16} color="#1E3A8A" />
          <Text style={styles.sectionTitle}>Loads From</Text>
        </View>

        {CITY_HUBS.map((hub) => (
          <TouchableOpacity
            key={hub.city}
            style={styles.cityCard}
            onPress={() => router.push({ pathname: '/loads-result', params: { fromCity: hub.city } })}
            activeOpacity={0.75}
          >
            <View style={styles.cityCardContent}>
              <Text style={styles.cityName}>{hub.city}</Text>
              <Text style={styles.citySubCities} numberOfLines={2}>
                {hub.subCities}
              </Text>
            </View>
            <ChevronRight size={20} color="#9CA3AF" />
          </TouchableOpacity>
        ))}

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff' },
  headerSub:   { fontSize: 13, color: '#93C5FD', marginTop: 2 },

  listContainer: { padding: 16, gap: 10 },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#1E3A8A' },

  cityCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cityCardContent: { flex: 1, marginRight: 8 },
  cityName:     { fontSize: 17, fontWeight: '700', color: '#1a1a1a', marginBottom: 4 },
  citySubCities:{ fontSize: 13, color: '#6B7280', lineHeight: 19 },
});

export default LoadsHomeScreen;
