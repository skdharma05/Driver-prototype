export const DUMMY_DRIVER = {
  driverId: 'D001',
  name: 'Ramesh Kumar',
  phone: '+919876543210',
  isVerified: true,
};

export const DUMMY_APPROVED_BID = {
  bidId: 'B001',
  loadId: 'L001',
  driverId: 'D001',
  amount: 22000,
  status: 'approved',        // ← approved state
  submittedAt: new Date('2024-10-14T08:00:00').toISOString(),
  load: {
    id: 'L001',
    pickupCity: 'Chennai, TN',
    dropCity: 'Bengaluru, KA',
    vehicleType: '16-ft Open Truck',
    pickupDate: '15 Oct, 10:00 AM',
    distance: 346,
  }
};

export const DUMMY_ACTIVE_TRIP = {
  tripId: 'T001',
  loadId: 'L001',
  driverId: 'D001',
  bidId: 'B001',
  status: 'accepted',         // accepted | in_progress | completed
  // Load details
  pickupCity: 'Chennai, TN',
  pickupFullAddress: 'Plot 45, SIPCOT Industrial Park, Irrungattukottai, Chennai 602105',
  pickupLat: 13.0827,
  pickupLng: 80.2707,
  pickupDate: '15 Oct, 10:00 AM',
  pickupContactName: 'KKP Logistics Support',
  pickupContactPhone: '+919000000000',
  dropCity: 'Bengaluru, KA',
  dropFullAddress: 'Warehouse 12, Bommasandra Industrial Area, Bengaluru 560099',
  dropLat: 12.9716,
  dropLng: 77.5946,
  dropDate: 'Expected: 16 Oct, 08:00 PM',
  dropContactName: 'Suresh Logistics',
  dropContactPhone: '+919111111111',
  vehicleType: '16-ft Open Truck',
  weight: '12 Tons',
  goodsType: 'Industrial Parts',
  distance: 346,
  agreedAmount: 22000,
  specialInstructions: 'Fragile goods. Maintain speed limit of 50 km/h. Park near gate 2.',
  // Trip progress tracking
  pickupEPOD: null,     // null = not submitted yet
  dropEPOD: null,
  acceptedAt: new Date('2024-10-14T09:00:00').toISOString(),
};
