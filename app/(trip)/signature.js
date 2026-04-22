import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import SignatureScreen from 'react-native-signature-canvas';
import { theme } from '../../src/styles/theme';
import { RefreshCcw, Check, ChevronLeft } from 'lucide-react-native';

export default function SignatureCaptureScreen() {
  const { id, photos, otp, lat, lng } = useLocalSearchParams();
  const router = useRouter();
  const signatureRef = useRef();
  const [loading, setLoading] = useState(false);

  const handleSignature = async (signature) => {
    // Expected to get a base64 string
    // console.log(signature);
    setLoading(true);

    try {
      // In a real app:
      // 1. Upload base64 signature to Firebase Storage
      // 2. Upload photos to Firebase Storage
      // 3. Update Firestore assignment document with all POD data and status = DELIVERY_POD_SUBMITTED

      setTimeout(() => {
        setLoading(false);
        Alert.alert('Success', 'Delivery POD Submitted Successfully!', [
          {
            text: 'OK', onPress: () => {
              // Return to home screen
              router.replace('/(tabs)');
            }
          }
        ]);
      }, 2000);
    } catch (err) {
      setLoading(false);
      Alert.alert('Error', 'Failed to submit delivery POD.');
    }
  };

  const handleEmpty = () => {
    Alert.alert('Empty', 'Please ask the receiver to sign.');
  };

  const handleClear = () => {
    signatureRef.current.clearSignature();
  };

  const handleConfirm = () => {
    signatureRef.current.readSignature();
  };

  // The custom style for the signature canvas webview
  const imgWidth = 300;
  const imgHeight = 200;
  const style = `
    .m-signature-pad {
      box-shadow: none; border: none;
      margin-left: auto; margin-right: auto; margin-top: 10px;
    } 
    .m-signature-pad--body { border: 1px solid ${theme.colors.border}; }
    .m-signature-pad--footer { display: none; margin: 0px; }
  `;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <ChevronLeft size={28} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Receiver Signature</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.instructions}>
          Please ask the receiver to sign inside the box below to confirm delivery.
        </Text>

        <View style={styles.canvasContainer}>
          <SignatureScreen
            ref={signatureRef}
            onOK={handleSignature}
            onEmpty={handleEmpty}
            descriptionText="Receiver Signature"
            clearText="Clear"
            confirmText="Save"
            webStyle={style}
            autoClear={false}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity style={styles.clearBtn} onPress={handleClear} disabled={loading}>
            <RefreshCcw size={20} color={theme.colors.textSecondary} />
            <Text style={styles.clearBtnText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Check size={20} color="#fff" />
                <Text style={styles.confirmBtnText}>Submit POD</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderLight,
  },
  backBtn: {
    marginRight: 12,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  content: {
    flex: 1,
    padding: theme.spacing.md,
  },
  instructions: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  canvasContainer: {
    height: 300,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    gap: 16,
  },
  clearBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    gap: 8,
  },
  clearBtnText: {
    ...theme.typography.button,
    color: theme.colors.textSecondary,
  },
  confirmBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    gap: 8,
    ...theme.shadows.sm,
  },
  confirmBtnText: {
    ...theme.typography.buttonLarge,
    color: '#fff',
  }
});
