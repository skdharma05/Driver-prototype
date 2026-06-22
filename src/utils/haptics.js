import * as Haptics from 'expo-haptics';

// Lightweight wrappers so haptic feedback never throws on unsupported devices.
export const haptics = {
  // Light tap — for normal button presses (e.g. Call)
  light: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {}),
  // Medium tap — for more significant actions (e.g. raise hand)
  medium: () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {}),
  // Selection tick — for choosing from a list / switching tabs
  select: () => Haptics.selectionAsync().catch(() => {}),
  // Success buzz — for confirmations
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {}),
};
