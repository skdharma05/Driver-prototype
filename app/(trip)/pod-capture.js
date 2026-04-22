import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView, TextInput } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { theme } from '../../src/styles/theme';
import { Camera, X, Check, FileText, Plus } from 'lucide-react-native';

export default function PodCaptureScreen() {
  const { type, id } = useLocalSearchParams(); // 'pickup' or 'delivery'
  const router = useRouter();

  const [permission, requestPermission] = useCameraPermissions();
  const [locationPerm, setLocationPerm] = useState(null);
  const [location, setLocation] = useState(null);
  const cameraRef = useRef(null);

  const [photos, setPhotos] = useState([]);
  const otpLength = 4;
  const [otp, setOtp] = useState(Array(otpLength).fill(''));
  const [loading, setLoading] = useState(false);
  const [takingPhoto, setTakingPhoto] = useState(false);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const otpRefs = useRef([]);
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPerm(status);
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High
        });
        setLocation(loc);
      }
    })();
  }, []);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.btn} onPress={requestPermission}>
          <Text style={styles.btnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePhoto = async () => {
    if (cameraRef.current && !takingPhoto) {
      setTakingPhoto(true);
      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.7,
        });
        if (photo) {
          setPhotos([...photos, photo.uri]);
          setIsAddingPhoto(false);
        }
      } catch (e) {
        Alert.alert('Error', 'Failed to take photo');
      }
      setTakingPhoto(false);
    }
  };

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
  };

  const handleOtpChange = (value, index) => {
    const newOtp = [...otp];
    
    // Handle paste
    if (value.length > 1) {
      const pastedDigits = value.replace(/\D/g, '').slice(0, otpLength).split('');
      pastedDigits.forEach((digit, i) => {
        if (i < otpLength) newOtp[i] = digit;
      });
      setOtp(newOtp);
      // Focus last filled or next
      const nextIndex = Math.min(pastedDigits.length, otpLength - 1);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-advance
    if (value && index < otpLength - 1) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        otpRefs.current[index - 1]?.focus();
      }
    }
  };

  const handleSubmit = async () => {
    setHasSubmitted(true);
    
    if (photos.length < 2) {
      // Inline error will show
      return;
    }

    const otpCode = otp.join('');
    const isOtpValid = otpCode.length === otpLength && /^\d+$/.test(otpCode);

    if (!isOtpValid) {
      Alert.alert('Incomplete', `Please enter valid ${otpLength}-digit OTP`);
      return;
    }

    if (!location) {
      Alert.alert('Error', 'GPS location is required to submit POD. Please ensure GPS is ON.');
      return;
    }

    if (type === 'delivery') {
      // Need signature before submit
      router.push({ pathname: '/(trip)/signature', params: { id, photos: JSON.stringify(photos), otp: otpCode, lat: location.coords.latitude, lng: location.coords.longitude } });
      return;
    }

    // Pickup submission
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Success', 'Pickup POD Submitted! You can now start the transit.', [
        { text: 'OK', onPress: () => router.replace({ pathname: '/(trip)/active', params: { id, pickupSubmitted: 'true' } }) }
      ]);
    }, 1500);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: 12 + insets.top }]}>
        <Text style={styles.title}>{type === 'pickup' ? 'Pickup ePOD' : 'Delivery ePOD'}</Text>
        <Text style={styles.subtitle}>Take minimum 2 photos of goods</Text>
      </View>

      <View style={styles.cameraContainer}>
        { (photos.length < 2 || isAddingPhoto) ? (
          <View style={styles.cameraFrame}>
            <CameraView style={styles.camera} facing="back" ref={cameraRef} />
            <View style={styles.overlay}>
               <View style={styles.guideFrame} />
               <View style={styles.gpsStamp}>
                 <Text style={styles.gpsStampText}>
                   GPS: {location ? `${location.coords.latitude.toFixed(6)}, ${location.coords.longitude.toFixed(6)}` : 'Locating...'}
                 </Text>
               </View>
            </View>
            <View style={styles.cameraControls}>
               <TouchableOpacity style={styles.captureBtn} onPress={takePhoto} disabled={takingPhoto}>
                 {takingPhoto ? <ActivityIndicator color="#000" /> : <Camera size={32} color="#000" />}
               </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.successBox}>
            <Check size={48} color={theme.colors.success} />
            <Text style={styles.successText}>Photos Captured</Text>
            <TouchableOpacity 
              style={styles.retakeBtn} 
              onPress={() => {
                setPhotos([]);
                setOtp(Array(otpLength).fill(''));
                setIsAddingPhoto(false);
              }}
            >
              <Text style={styles.retakeText}>Retake Photos</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 + insets.bottom }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.bottomSection}>
          <Text style={styles.sectionTitle}>Captured Photos ({photos.length}/2+)</Text>
          <View style={styles.photoGrid}>
            {photos.map((uri, index) => (
              <View key={index} style={styles.photoThumbContainer}>
                <Image source={{uri}} style={styles.thumbImage} />
                <TouchableOpacity style={styles.removeBtn} onPress={() => removePhoto(index)}>
                  <X size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
            <TouchableOpacity 
              style={styles.addMoreBtn} 
              onPress={() => setIsAddingPhoto(true)}
            >
              <Plus size={32} color={theme.colors.primary} />
              <Text style={styles.addMoreText}>Add more</Text>
            </TouchableOpacity>
          </View>

          {hasSubmitted && photos.length < 2 && (
            <Text style={styles.errorText}>Please capture at least 2 photos before submitting.</Text>
          )}

          <View style={styles.inputSection}>
            <Text style={styles.sectionTitle}>
               {type === 'pickup' ? 'Driver OTP (sent to your phone)' : 'Receiver OTP (ask the receiver)'}
            </Text>
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(el) => otpRefs.current[index] = el}
                  style={styles.otpBox}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(val) => handleOtpChange(val, index)}
                  onKeyPress={(e) => handleOtpKeyPress(e, index)}
                />
              ))}
            </View>
            {!(photos.length >= 2 && otp.join('').length === otpLength && /^\d+$/.test(otp.join(''))) && (
              <Text style={styles.helperText}>
                {photos.length < 2 
                  ? `Add ${2 - photos.length} more photo(s) to continue` 
                  : `Enter the ${otpLength}-digit OTP to submit`}
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed bottom button */}
      <View style={[styles.fixedFooter, { paddingBottom: insets.bottom + 12 }]}>
        <TouchableOpacity 
          style={[
            styles.submitBtn, 
            (photos.length < 2 || otp.join('').length !== otpLength || !/^\d+$/.test(otp.join(''))) && styles.submitBtnDisabled
          ]} 
          onPress={handleSubmit}
          disabled={photos.length < 2 || otp.join('').length !== otpLength || !/^\d+$/.test(otp.join('')) || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitBtnText}>
               {type === 'delivery' ? 'Next: Receiver Signature' : 'Submit Pickup POD'}
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  permissionText: {
    ...theme.typography.body,
    textAlign: 'center',
    marginBottom: 20,
  },
  btn: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: theme.borderRadius.md,
  },
  btnText: {
    color: '#fff',
    ...theme.typography.button,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 10,
    backgroundColor: theme.colors.surface,
    zIndex: 1,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.text,
  },
  subtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: 4,
  },
  cameraContainer: {
    width: '100%',
    height: 280,
    backgroundColor: '#000',
    overflow: 'hidden',
    position: 'relative',
  },
  cameraFrame: {
    flex: 1,
    position: 'relative',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  guideFrame: {
    width: '80%',
    height: '60%',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    borderStyle: 'dashed',
  },
  gpsStamp: {
    position: 'absolute',
    bottom: 80,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  gpsStampText: {
    ...theme.typography.small,
    color: '#fff',
  },
  cameraControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingBottom: 20,
  },
  captureBtn: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.accentLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  successBox: {
    flex: 1,
    backgroundColor: theme.colors.statusAccepted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  successText: {
    ...theme.typography.h3,
    color: theme.colors.statusAcceptedText,
    marginTop: 10,
  },
  retakeBtn: {
    marginTop: 20,
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.statusAcceptedText,
    borderRadius: theme.borderRadius.sm,
  },
  retakeText: {
    ...theme.typography.button,
    color: theme.colors.statusAcceptedText,
  },
  bottomSection: {
    flex: 1,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    ...theme.typography.bodySemiBold,
    marginBottom: theme.spacing.sm,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: theme.spacing.lg,
  },
  photoThumbContainer: {
    position: 'relative',
  },
  thumbImage: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  removeBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: theme.colors.error,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputSection: {
    marginBottom: theme.spacing.lg,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: theme.spacing.sm,
  },
  otpBox: {
    flex: 1,
    height: 56,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    textAlign: 'center',
    ...theme.typography.h3,
    backgroundColor: theme.colors.surface,
  },
  addMoreBtn: {
    width: 100,
    height: 100,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  addMoreText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    marginTop: 4,
  },
  errorText: {
    ...theme.typography.caption,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
  },
  helperText: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
  fixedFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24, // fallback
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.lg,
  },
  submitBtn: {
    backgroundColor: theme.colors.primary,
    height: 56,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtnDisabled: {
    backgroundColor: theme.colors.border,
  },
  submitBtnText: {
    ...theme.typography.buttonLarge,
    color: '#fff',
  }
});
