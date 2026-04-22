import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { theme, VEHICLE_TYPE_OPTIONS } from '../../src/styles/theme';
import { ChevronDown, Check, User, Target, Phone } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';
import { db } from '../../src/services/firebase';
import { doc, setDoc } from 'firebase/firestore';

export default function ProfileSetupScreen() {
  const router = useRouter();

  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    fullName: '',
    phone: user?.phoneNumber || '',
    vehicleType: '',
    vehicleRegNo: '',
    homeCity: '',
    homeState: '',
    upiId: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);

  // Refs for focus navigation
  const phoneRef = useRef(null);
  const cityRef = useRef(null);
  const stateRef = useRef(null);
  const regRef = useRef(null);
  const upiRef = useRef(null);

  const validate = () => {
    let valid = true;
    let newErrors = {};

    if (!form.fullName.trim()) { newErrors.fullName = 'Required'; valid = false; }
    if (!form.vehicleType) { newErrors.vehicleType = 'Required'; valid = false; }
    if (!form.vehicleRegNo.trim()) { newErrors.vehicleRegNo = 'Required'; valid = false; }
    if (!form.homeCity.trim()) { newErrors.homeCity = 'Required'; valid = false; }
    if (!form.upiId.trim()) { newErrors.upiId = 'Required'; valid = false; }

    setErrors(newErrors);
    return valid;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setLoading(true);

    try {
      await updateProfile({
        ...form,
        phone: user?.phoneNumber || form.phone,
        updatedAt: new Date().toISOString(),
        isProfileComplete: true,
        status: 'PENDING_VERIFICATION'
      });
      
      setLoading(false);
      router.push('/(auth)/document-upload');
    } catch (err) {
      setLoading(false);
      console.error(err);
      Alert.alert('Error', 'Could not save profile details.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Driver Profile</Text>
          <Text style={styles.headerSubtitle}>Step 1 of 2: Basic Details</Text>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          
          {/* Personal Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Details</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={[styles.input, errors.fullName && styles.inputError]}
                placeholder="As per Aadhaar"
                value={form.fullName}
                onChangeText={(text) => setForm({...form, fullName: text})}
                returnKeyType="next"
                onSubmitEditing={() => cityRef.current?.focus()}
                autoCorrect={false}
                spellCheck={false}
              />
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.label}>Home City *</Text>
                <TextInput
                  ref={cityRef}
                  style={[styles.input, errors.homeCity && styles.inputError]}
                  placeholder="e.g. Chennai"
                  value={form.homeCity}
                  onChangeText={(text) => setForm({...form, homeCity: text})}
                  returnKeyType="next"
                  onSubmitEditing={() => stateRef.current?.focus()}
                  autoCorrect={false}
                />
                {errors.homeCity && <Text style={styles.errorText}>{errors.homeCity}</Text>}
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.label}>State *</Text>
                <TextInput
                  ref={stateRef}
                  style={styles.input}
                  placeholder="e.g. TN"
                  value={form.homeState}
                  onChangeText={(text) => setForm({...form, homeState: text})}
                  returnKeyType="next"
                  autoCorrect={false}
                />
              </View>
            </View>
          </View>

          {/* Vehicle Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Vehicle Details</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Vehicle Type *</Text>
              <TouchableOpacity 
                style={[styles.pickerBtn, errors.vehicleType && styles.inputError]} 
                onPress={() => setShowVehiclePicker(true)}
              >
                <Text style={form.vehicleType ? styles.pickerBtnText : styles.pickerBtnPlaceholder}>
                  {form.vehicleType ? VEHICLE_TYPE_OPTIONS.find(o => o.value === form.vehicleType)?.label : 'Select Vehicle Type'}
                </Text>
                <ChevronDown size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              {errors.vehicleType && <Text style={styles.errorText}>{errors.vehicleType}</Text>}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Registration Number *</Text>
              <TextInput
                ref={regRef}
                style={[styles.input, errors.vehicleRegNo && styles.inputError]}
                placeholder="e.g. TN38CD5678"
                autoCapitalize="characters"
                value={form.vehicleRegNo}
                onChangeText={(text) => setForm({...form, vehicleRegNo: text.toUpperCase()})}
                returnKeyType="next"
                onSubmitEditing={() => upiRef.current?.focus()}
                autoCorrect={false}
              />
              {errors.vehicleRegNo && <Text style={styles.errorText}>{errors.vehicleRegNo}</Text>}
            </View>
          </View>

          {/* Payment Details */}
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Payment Details</Text>
              <View style={styles.secureBadge}>
                <Target size={12} color={theme.colors.success} />
                <Text style={styles.secureText}>Secured</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>UPI ID (Mandatory) *</Text>
              <TextInput
                ref={upiRef}
                style={[styles.input, errors.upiId && styles.inputError]}
                placeholder="e.g. 9876543210@ybl"
                autoCapitalize="none"
                value={form.upiId}
                onChangeText={(text) => setForm({...form, upiId: text.toLowerCase()})}
                returnKeyType="done"
                onSubmitEditing={handleSave}
                autoCorrect={false}
                spellCheck={false}
              />
              <Text style={styles.helperText}>Used for advance & balance payments</Text>
              {errors.upiId && <Text style={styles.errorText}>{errors.upiId}</Text>}
            </View>
          </View>

          <TouchableOpacity 
            style={styles.submitBtn}
            onPress={handleSave}
            disabled={loading}
          >
            <Text style={styles.submitBtnText}>Save & Next Step</Text>
          </TouchableOpacity>
          <View style={{height: 40}} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Vehicle Type Picker Modal */}
      <Modal visible={showVehiclePicker} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Vehicle Type</Text>
              <TouchableOpacity onPress={() => setShowVehiclePicker(false)} style={styles.modalClose}>
                <Text style={styles.modalCloseText}>Close</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={VEHICLE_TYPE_OPTIONS}
              keyExtractor={(item) => item.value}
              renderItem={({item}) => (
                <TouchableOpacity 
                  style={styles.modalItem}
                  onPress={() => {
                    setForm({...form, vehicleType: item.value});
                    setShowVehiclePicker(false);
                    // Focus registration number after vehicle selection
                    regRef.current?.focus();
                  }}
                >
                  <Text style={[styles.modalItemText, form.vehicleType === item.value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {form.vehicleType === item.value && <Check size={20} color={theme.colors.primary} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

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
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  headerSubtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.primary,
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  secureBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.statusVerified,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    gap: 4,
  },
  secureText: {
    ...theme.typography.small,
    color: theme.colors.statusVerifiedText,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
  },
  inputGroup: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
    color: theme.colors.text,
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: 4,
  },
  helperText: {
    ...theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: 4,
  },
  pickerBtn: {
    height: 52,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerBtnText: {
    ...theme.typography.body,
    color: theme.colors.text,
  },
  pickerBtnPlaceholder: {
    ...theme.typography.body,
    color: theme.colors.textMuted,
  },
  submitBtn: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    ...theme.shadows.md,
  },
  submitBtnText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
  },
  modalCloseText: {
    ...theme.typography.button,
    color: theme.colors.primary,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  modalItemText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  modalItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
