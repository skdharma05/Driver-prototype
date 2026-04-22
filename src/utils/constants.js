// ─── Enum Constants ──────────────────────────────────────────────
// Used throughout app for status management and display

export const VERIFICATION_STATUS = {
  PENDING: 'PENDING',
  UNDER_REVIEW: 'UNDER_REVIEW',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
};

export const DOCUMENT_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  REJECTED: 'REJECTED',
  EXPIRED: 'EXPIRED',
};

export const LOAD_STATUS = {
  OPEN: 'OPEN',
  ASSIGNED: 'ASSIGNED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

export const BID_STATUS = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
};

export const ASSIGNMENT_STATUS = {
  ASSIGNED: 'ASSIGNED',
  DRIVER_ACCEPTED: 'DRIVER_ACCEPTED',
  HEADING_TO_PICKUP: 'HEADING_TO_PICKUP',
  PICKUP_POD_SUBMITTED: 'PICKUP_POD_SUBMITTED',
  ADVANCE_PAID: 'ADVANCE_PAID',
  IN_TRANSIT: 'IN_TRANSIT',
  DELIVERY_POD_SUBMITTED: 'DELIVERY_POD_SUBMITTED',
  BALANCE_PAID: 'BALANCE_PAID',
  COMPLETED: 'COMPLETED',
  DISPUTE: 'DISPUTE',
};

export const POD_STATUS = {
  SUBMITTED: 'SUBMITTED',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  PAID: 'PAID',
};

export const PAYMENT_METHOD = {
  UPI: 'UPI',
  BANK: 'BANK',
  CASH: 'CASH',
};

export const NOTIFICATION_TYPES = {
  LOAD_AVAILABLE: 'LOAD_AVAILABLE',
  BID_SUBMITTED: 'BID_SUBMITTED',
  BID_ACCEPTED: 'BID_ACCEPTED',
  BID_REJECTED: 'BID_REJECTED',
  ASSIGNMENT_CREATED: 'ASSIGNMENT_CREATED',
  PICKUP_POD_APPROVED: 'PICKUP_POD_APPROVED',
  PICKUP_POD_REJECTED: 'PICKUP_POD_REJECTED',
  ADVANCE_PAID: 'ADVANCE_PAID',
  DELIVERY_POD_APPROVED: 'DELIVERY_POD_APPROVED',
  DELIVERY_POD_REJECTED: 'DELIVERY_POD_REJECTED',
  BALANCE_PAID: 'BALANCE_PAID',
  TRIP_COMPLETED: 'TRIP_COMPLETED',
  DOCUMENT_VERIFIED: 'DOCUMENT_VERIFIED',
  DOCUMENT_REJECTED: 'DOCUMENT_REJECTED',
  DOCUMENT_EXPIRY: 'DOCUMENT_EXPIRY',
  DISPUTE_RAISED: 'DISPUTE_RAISED',
  DISPUTE_RESOLVED: 'DISPUTE_RESOLVED',
  LOW_BATTERY_WARNING: 'LOW_BATTERY_WARNING',
};

export const DISPUTE_TYPE = {
  POD_REJECTED: 'POD_REJECTED',
  PAYMENT_DELAYED: 'PAYMENT_DELAYED',
};

// ─── Trip progress stages for progress bar ───────────────────────
export const TRIP_STAGES = [
  { key: ASSIGNMENT_STATUS.ASSIGNED, label: 'Assigned' },
  { key: ASSIGNMENT_STATUS.DRIVER_ACCEPTED, label: 'Accepted' },
  { key: ASSIGNMENT_STATUS.HEADING_TO_PICKUP, label: 'Heading to Pickup' },
  { key: ASSIGNMENT_STATUS.PICKUP_POD_SUBMITTED, label: 'Pickup POD' },
  { key: ASSIGNMENT_STATUS.ADVANCE_PAID, label: 'Advance Paid' },
  { key: ASSIGNMENT_STATUS.IN_TRANSIT, label: 'In Transit' },
  { key: ASSIGNMENT_STATUS.DELIVERY_POD_SUBMITTED, label: 'Delivery POD' },
  { key: ASSIGNMENT_STATUS.BALANCE_PAID, label: 'Balance Paid' },
  { key: ASSIGNMENT_STATUS.COMPLETED, label: 'Complete' },
];

// ─── Document types list for upload ──────────────────────────────
export const DOCUMENT_TYPES = [
  {
    key: 'drivingLicense',
    label: 'Driving License',
    description: 'PDF Document',
    mandatory: true,
    hasExpiry: true,
  },
  {
    key: 'vehicleRC',
    label: 'Vehicle RC',
    description: 'PDF Document',
    mandatory: true,
    hasExpiry: false,
  },
  {
    key: 'insurance',
    label: 'Vehicle Insurance',
    description: 'PDF Document',
    mandatory: true,
    hasExpiry: true,
  },
  {
    key: 'aadhaar',
    label: 'Aadhaar Card',
    description: 'PDF Document',
    mandatory: true,
    hasExpiry: false,
  },
  {
    key: 'permit',
    label: 'National Permit',
    description: 'PDF Document',
    mandatory: false,
    hasExpiry: true,
  },
  {
    key: 'fitnessCertificate',
    label: 'Fitness Certificate',
    description: 'PDF Document',
    mandatory: false,
    hasExpiry: true,
  },
];

// ─── Manual check-in cities (Layer 3 fallback) ───────────────────
export const MAJOR_CHECKPOINTS = [
  'Chennai', 'Bengaluru', 'Hyderabad', 'Mumbai', 'Delhi',
  'Pune', 'Coimbatore', 'Madurai', 'Vijayawada', 'Kochi',
  'Mysuru', 'Hubli', 'Krishnagiri Toll', 'Dharmapuri',
  'Salem', 'Tiruchirappalli', 'Vellore', 'Tirupati',
  'Nellore', 'Guntur', 'Visakhapatnam', 'Nashik', 'Nagpur',
];

// ─── App Config ──────────────────────────────────────────────────
export const APP_CONFIG = {
  SESSION_TIMEOUT_DAYS: 7,
  OTP_EXPIRY_MINUTES: 5,
  MAX_POD_RESUBMIT: 3,
  MIN_POD_PHOTOS: 2,
  CACHE_DURATION_MINUTES: 30,
  ADVANCE_PAYMENT_PERCENT: 0.8,  // 80%
  BALANCE_PAYMENT_PERCENT: 0.2,  // 20%
  BATTERY_LOW_THRESHOLD: 0.2,    // 20%
  DOCUMENT_EXPIRY_WARNING_DAYS: 30,
  DOCUMENT_EXPIRY_URGENT_DAYS: 7,
  ORS_API_KEY: 'YOUR_ORS_API_KEY', // OpenRouteService
  ORS_BASE_URL: 'https://api.openrouteservice.org/v2/directions/driving-hgv',
  MSG91_API_KEY: 'YOUR_MSG91_API_KEY',
  KKP_SUPPORT_PHONE_DEFAULT: '+919000000000',
  KKP_WHATSAPP_DEFAULT: '+919000000000',
};
