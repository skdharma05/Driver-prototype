// KKP Logistics Design System
// High contrast, outdoor visibility, driver-optimised

export const theme = {
  colors: {
    // Primary Brand
    primary: '#1B3D8F',       // Deep Navy Blue (KKP brand)
    primaryDark: '#0F2660',
    primaryLight: '#2E5BCC',

    // Accent / CTA
    accent: '#F59E0B',         // Amber — used for bids, highlights
    accentDark: '#D97706',
    accentLight: '#FCD34D',

    // Status Colors (high contrast for outdoor)
    success: '#16A34A',        // Green
    error: '#DC2626',          // Red
    warning: '#CA8A04',        // Dark amber
    info: '#0369A1',           // Blue

    // Backgrounds
    background: '#F1F5F9',     // Slate-100
    surface: '#FFFFFF',
    surfaceDark: '#1E293B',    // Dark mode surface
    overlay: 'rgba(0,0,0,0.5)',

    // Text
    text: '#0F172A',           // Slate-900
    textSecondary: '#475569',  // Slate-600
    textMuted: '#94A3B8',      // Slate-400
    textInverse: '#FFFFFF',

    // Borders
    border: '#CBD5E1',         // Slate-300
    borderLight: '#E2E8F0',    // Slate-200

    // Status Badges
    statusPending: '#FEF3C7',
    statusPendingText: '#92400E',
    statusAccepted: '#D1FAE5',
    statusAcceptedText: '#065F46',
    statusRejected: '#FEE2E2',
    statusRejectedText: '#991B1B',
    statusVerified: '#D1FAE5',
    statusVerifiedText: '#065F46',
    statusExpired: '#FEE2E2',
    statusExpiredText: '#991B1B',
    statusUnderReview: '#E0F2FE',
    statusUnderReviewText: '#0C4A6E',
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
    xxxl: 64,
  },

  borderRadius: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    full: 9999,
  },

  typography: {
    // Minimum 14px throughout app (Section 24 requirement)
    h1: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    h2: { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
    h3: { fontSize: 20, fontWeight: '700' },
    h4: { fontSize: 18, fontWeight: '600' },
    body: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
    bodyMedium: { fontSize: 16, fontWeight: '500' },
    bodySemiBold: { fontSize: 16, fontWeight: '600' },
    label: { fontSize: 14, fontWeight: '500' },
    caption: { fontSize: 14, fontWeight: '400' },
    button: { fontSize: 16, fontWeight: '700' },
    buttonLarge: { fontSize: 18, fontWeight: '700' },
    small: { fontSize: 12, fontWeight: '400' },
  },

  // Minimum 48px tap targets (Section 24)
  tapTarget: {
    minHeight: 48,
    minWidth: 48,
  },

  shadows: {
    xs: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
  },

  // Dark mode colors
  dark: {
    background: '#0F172A',
    surface: '#1E293B',
    surfaceElevated: '#293548',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    border: '#334155',
  },
};

// Vehicle type display map
export const VEHICLE_TYPES = {
  '16ft_open': '16-ft Open Truck',
  '22ft_closed': '22-ft Closed Truck',
  '22ft_trailer': '22-ft Trailer',
  'container_20ft': 'Container 20ft',
  'container_40ft': 'Container 40ft',
  'mini_truck': 'Mini Truck',
  'tanker': 'Tanker',
  'refrigerator': 'Refrigerator Truck',
  'open_flatbed': 'Open Flatbed',
};

export const VEHICLE_TYPE_OPTIONS = Object.entries(VEHICLE_TYPES).map(([value, label]) => ({ value, label }));
