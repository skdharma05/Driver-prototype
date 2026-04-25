export const DUMMY_DRIVER = {
  driverId: 'D001',
  name: 'Ramesh Kumar',
  phone: '+919876543210',
  isVerified: true,
};

export const DUMMY_LOADS = [
  {
    id: 'L001',
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
    id: 'L002',
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
    id: 'L003',
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
