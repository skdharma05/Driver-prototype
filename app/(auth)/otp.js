import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { theme } from '../../src/styles/theme';
import { ChevronLeft } from 'lucide-react-native';

export default function OtpScreen() {
  const { phone } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // 6 digit OTP for Firebase defaults
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);
  const router = useRouter();

  useEffect(() => {
    let interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOtpChange = (value, index) => {
    if (error) setError('');
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const verifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter complete 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // In a real app with Firebase Auth:
      // const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
      // await auth().signInWithCredential(credential);
      
      // Simulating success
      setTimeout(() => {
        setLoading(false);
        // Note: The AuthContext listener will detect the user change
        // and RootNavigation will handle the redirect.
        // But for this mockup flow without actual auth state:
        router.push('/(auth)/profile-setup');
      }, 1500);
      
    } catch (err) {
      setError('Invalid OTP code. Try again.');
      setLoading(false);
    }
  };

  const handleResend = () => {
    if (timer > 0) return;
    setTimer(30);
    setOtp(['', '', '', '', '', '']);
    inputRefs.current[0].focus();
    // Logic to resend OTP
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>

        <View style={styles.headerContainer}>
          <Text style={styles.title}>Verify OTP</Text>
          <Text style={styles.subtitle}>
            Code sent to +91 {phone}
          </Text>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.otpContainer}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={(el) => inputRefs.current[index] = el}
                style={[
                  styles.otpInput,
                  digit && styles.otpInputFilled,
                  error && styles.otpInputError
                ]}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(val) => handleOtpChange(val, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
              />
            ))}
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <TouchableOpacity 
            style={[styles.button, otp.join('').length !== 6 && styles.buttonDisabled]} 
            onPress={verifyOtp}
            disabled={otp.join('').length !== 6 || loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.colors.textInverse} />
            ) : (
              <Text style={styles.buttonText}>Verify & Login</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive code? </Text>
            <TouchableOpacity onPress={handleResend} disabled={timer > 0}>
              <Text style={[styles.resendAction, timer > 0 && styles.resendActionDisabled]}>
                {timer > 0 ? `Wait ${timer}s` : 'Resend Now'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    flex: 1,
    padding: theme.spacing.lg,
  },
  backBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  headerContainer: {
    marginBottom: theme.spacing.xxxl,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
  formContainer: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    ...theme.shadows.md,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  otpInput: {
    width: 48,
    height: 56,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    ...theme.typography.h2,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '0A', // very light tint
  },
  otpInputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    marginTop: -theme.spacing.sm,
  },
  button: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    ...theme.shadows.sm,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.border,
  },
  buttonText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.textInverse,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  resendText: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
  },
  resendAction: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.primary,
  },
  resendActionDisabled: {
    color: theme.colors.textMuted,
  },
});
