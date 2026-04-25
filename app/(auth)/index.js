import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '../../src/styles/theme';
import { Truck } from 'lucide-react-native';
import { useAuth } from '../../src/context/AuthContext';

const DUMMY_USERS = [
  {
    id: 'solo',
    label: 'Solo Driver',
    user: { uid: 'dummy_solo_123', phoneNumber: '+919000000001' },
    profile: {
      fullName: 'Raj Kumar',
      phone: '+919000000001',
      userType: 'SOLO_DRIVER',
      vehicles: [{ vehicleType: 'TATA_ACE', vehicleRegNo: 'TN38CD5678', driverName: '', driverPhone: '' }],
      homeCity: 'Chennai',
      homeState: 'TN',
      upiId: 'rajkumar@upi',
      isProfileComplete: true,
      status: 'VERIFIED'
    }
  },
  {
    id: 'transporter',
    label: 'Transporter (Fleet)',
    user: { uid: 'dummy_fleet_456', phoneNumber: '+919000000002' },
    profile: {
      fullName: 'KKP Logistics',
      phone: '+919000000002',
      userType: 'TRANSPORTER',
      vehicles: [
        { vehicleType: 'ASHOK_LEYLAND_DOST', vehicleRegNo: 'TN02CD1234', driverName: 'Suresh', driverPhone: '9000000003' },
        { vehicleType: 'EICHER_14FT', vehicleRegNo: 'TN03EF5678', driverName: 'Ramesh', driverPhone: '9000000004' }
      ],
      homeCity: 'Coimbatore',
      homeState: 'TN',
      upiId: 'kkplogistics@upi',
      isProfileComplete: true,
      status: 'VERIFIED'
    }
  }
];

export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { loginAsDummy } = useAuth();

  const handleDummyLogin = async (dummy) => {
    setLoading(true);
    await loginAsDummy(dummy.user, dummy.profile);
    setLoading(false);
    router.replace('/(tabs)');
  };

  const handleSendOtp = async () => {
    // Basic validation
    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app with Firebase Auth:
      // const confirmation = await auth().signInWithPhoneNumber('+91' + phoneNumber);
      // Pass confirmation.verificationId to next screen
      
      // Simulating API call for now
      setTimeout(() => {
        setLoading(false);
        router.push({ pathname: '/(auth)/otp', params: { phone: phoneNumber } });
      }, 1000);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
      setLoading(false);
      console.error(err);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Truck size={48} color={theme.colors.surface} />
          </View>
          <Text style={styles.title}>KKP Logistics</Text>
          <Text style={styles.subtitle}>Driver Partner Platform</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Mobile Number</Text>
          <View style={styles.inputContainer}>
            <View style={styles.prefix}>
              <Text style={styles.prefixText}>+91</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="Enter carefully"
              keyboardType="number-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text.replace(/[^0-9]/g, ''));
                if (error) setError('');
              }}
            />
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, phoneNumber.length !== 10 && styles.buttonDisabled]} 
            onPress={handleSendOtp}
            disabled={phoneNumber.length !== 10 || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textInverse} />
            ) : (
              <Text style={styles.buttonText}>Get OTP</Text>
            )}
          </TouchableOpacity>
        </View>

        {__DEV__ && (
          <View style={styles.devContainer}>
            <Text style={styles.devTitle}>🛠 Dev Mode: Quick Login</Text>
            {DUMMY_USERS.map(dummy => (
              <TouchableOpacity key={dummy.id} style={styles.devBtn} onPress={() => handleDummyLogin(dummy)} disabled={loading}>
                <Text style={styles.devBtnText}>Login as {dummy.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxxl,
  },
  logoContainer: {
    width: 96,
    height: 96,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.xl,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.primaryDark,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.h4,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
    height: 56, // Ensure > 48px tap target
  },
  prefix: {
    paddingHorizontal: theme.spacing.md,
    borderRightWidth: 1,
    borderRightColor: theme.colors.borderLight,
    height: '100%',
    justifyContent: 'center',
    backgroundColor: theme.colors.background,
  },
  prefixText: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.textSecondary,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.textInverse,
  },
  devContainer: {
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    borderStyle: 'dashed',
  },
  devTitle: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  devBtn: {
    backgroundColor: theme.colors.primary + '15',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  devBtnText: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.primaryDark,
  },
});
