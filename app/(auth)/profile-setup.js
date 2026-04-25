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
    userType: 'SOLO_DRIVER',
    vehicles: [{ vehicleType: '', vehicleRegNo: '', driverName: '', driverPhone: '' }],
    homeCity: '',
    homeState: '',
    upiId: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showVehiclePicker, setShowVehiclePicker] = useState(false);
  const [activeVehicleIndex, setActiveVehicleIndex] = useState(0);

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
    if (!form.homeCity.trim()) { newErrors.homeCity = 'Required'; valid = false; }
    if (!form.upiId.trim()) { newErrors.upiId = 'Required'; valid = false; }

    form.vehicles.forEach((v, index) => {
      if (!v.vehicleType) { newErrors[`vehicleType_${index}`] = 'Required'; valid = false; }
      if (!v.vehicleRegNo.trim()) { newErrors[`vehicleRegNo_${index}`] = 'Required'; valid = false; }
      
      if (form.userType === 'TRANSPORTER') {
        if (!v.driverName?.trim()) { newErrors[`driverName_${index}`] = 'Required'; valid = false; }
        if (!v.driverPhone?.trim() || v.driverPhone.trim().length < 10) { 
          newErrors[`driverPhone_${index}`] = 'Valid phone required'; valid = false; 
        }
      }
    });

    setErrors(newErrors);
    return valid;
  };

  const addVehicle = () => {
    setForm({
      ...form,
      vehicles: [...form.vehicles, { vehicleType: '', vehicleRegNo: '', driverName: '', driverPhone: '' }]
    });
  };

  const removeVehicle = (index) => {
    const updated = form.vehicles.filter((_, i) => i !== index);
    setForm({ ...form, vehicles: updated });
  };

  const updateVehicle = (index, field, value) => {
    const updated = [...form.vehicles];
    updated[index][field] = value;
    setForm({ ...form, vehicles: updated });
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
              <Text style={styles.label}>I am a *</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[styles.roleBtn, form.userType === 'SOLO_DRIVER' && styles.roleBtnActive]}
                  onPress={() => setForm({...form, userType: 'SOLO_DRIVER', vehicles: [form.vehicles[0] || { vehicleType: '', vehicleRegNo: '', driverName: '', driverPhone: '' }]})}
                >
                  <Text style={[styles.roleBtnText, form.userType === 'SOLO_DRIVER' && styles.roleBtnTextActive]}>Solo Driver</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.roleBtn, form.userType === 'TRANSPORTER' && styles.roleBtnActive]}
                  onPress={() => setForm({...form, userType: 'TRANSPORTER'})}
                >
                  <Text style={[styles.roleBtnText, form.userType === 'TRANSPORTER' && styles.roleBtnTextActive]}>Transporter</Text>
                </TouchableOpacity>
              </View>
            </View>

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
            <Text style={styles.sectionTitle}>
              {form.userType === 'TRANSPORTER' ? 'Fleet Details' : 'Vehicle Details'}
            </Text>

            {form.vehicles.map((vehicle, index) => (
              <View key={index} style={styles.vehicleCard}>
                {form.userType === 'TRANSPORTER' && (
                  <View style={styles.vehicleHeader}>
                    <Text style={styles.vehicleTitle}>Vehicle {index + 1}</Text>
                    {form.vehicles.length > 1 && (
                      <TouchableOpacity onPress={() => removeVehicle(index)} style={styles.removeBtn}>
                        <Text style={styles.removeText}>Remove</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Vehicle Type *</Text>
                  <TouchableOpacity 
                    style={[styles.pickerBtn, errors[`vehicleType_${index}`] && styles.inputError]} 
                    onPress={() => {
                      setActiveVehicleIndex(index);
                      setShowVehiclePicker(true);
                    }}
                  >
                    <Text style={vehicle.vehicleType ? styles.pickerBtnText : styles.pickerBtnPlaceholder}>
                      {vehicle.vehicleType ? VEHICLE_TYPE_OPTIONS.find(o => o.value === vehicle.vehicleType)?.label : 'Select Vehicle Type'}
                    </Text>
                    <ChevronDown size={20} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                  {errors[`vehicleType_${index}`] && <Text style={styles.errorText}>{errors[`vehicleType_${index}`]}</Text>}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Registration Number *</Text>
                  <TextInput
                    style={[styles.input, errors[`vehicleRegNo_${index}`] && styles.inputError]}
                    placeholder="e.g. TN38CD5678"
                    autoCapitalize="characters"
                    value={vehicle.vehicleRegNo}
                    onChangeText={(text) => updateVehicle(index, 'vehicleRegNo', text.toUpperCase())}
                    returnKeyType="next"
                    autoCorrect={false}
                  />
                  {errors[`vehicleRegNo_${index}`] && <Text style={styles.errorText}>{errors[`vehicleRegNo_${index}`]}</Text>}
                </View>

                {form.userType === 'TRANSPORTER' && (
                  <>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Driver Name *</Text>
                      <TextInput
                        style={[styles.input, errors[`driverName_${index}`] && styles.inputError]}
                        placeholder="Enter driver name"
                        value={vehicle.driverName || ''}
                        onChangeText={(text) => updateVehicle(index, 'driverName', text)}
                        returnKeyType="next"
                        autoCorrect={false}
                        spellCheck={false}
                      />
                      {errors[`driverName_${index}`] && <Text style={styles.errorText}>{errors[`driverName_${index}`]}</Text>}
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={styles.label}>Driver Phone Number *</Text>
                      <TextInput
                        style={[styles.input, errors[`driverPhone_${index}`] && styles.inputError]}
                        placeholder="10-digit mobile number"
                        keyboardType="number-pad"
                        maxLength={10}
                        value={vehicle.driverPhone || ''}
                        onChangeText={(text) => updateVehicle(index, 'driverPhone', text.replace(/[^0-9]/g, ''))}
                        returnKeyType="done"
                      />
                      {errors[`driverPhone_${index}`] && <Text style={styles.errorText}>{errors[`driverPhone_${index}`]}</Text>}
                    </View>
                  </>
                )}
              </View>
            ))}

            {form.userType === 'TRANSPORTER' && (
              <TouchableOpacity style={styles.addVehicleBtn} onPress={addVehicle}>
                <Text style={styles.addVehicleText}>+ Add Another Vehicle</Text>
              </TouchableOpacity>
            )}
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
                    updateVehicle(activeVehicleIndex, 'vehicleType', item.value);
                    setShowVehiclePicker(false);
                  }}
                >
                  <Text style={[styles.modalItemText, form.vehicles[activeVehicleIndex]?.vehicleType === item.value && styles.modalItemTextActive]}>
                    {item.label}
                  </Text>
                  {form.vehicles[activeVehicleIndex]?.vehicleType === item.value && <Check size={20} color={theme.colors.primary} />}
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
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  roleBtnActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10', // Light primary bg
  },
  roleBtnText: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.textSecondary,
  },
  roleBtnTextActive: {
    color: theme.colors.primaryDark,
  },
  vehicleCard: {
    marginBottom: theme.spacing.md,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  vehicleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  vehicleTitle: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.text,
  },
  removeBtn: {
    padding: 4,
  },
  removeText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    fontWeight: '600',
  },
  addVehicleBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    borderStyle: 'dashed',
    marginTop: theme.spacing.xs,
  },
  addVehicleText: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.primary,
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
