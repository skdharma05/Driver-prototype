import { SafeAreaView } from 'react-native-safe-area-context';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, Image, Modal } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as DocumentPicker from 'expo-document-picker';
import { theme } from '../../src/styles/theme';
import { DOCUMENT_TYPES } from '../../src/utils/constants';
import { CheckCircle2, ChevronRight, UploadCloud, AlertCircle, FileText } from 'lucide-react-native';

export default function DocumentUploadScreen() {
  const router = useRouter();
  const { isEdit } = useLocalSearchParams();
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const pickDocument = async (docKey, docLabel) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setSelectedDoc({ 
          docKey, 
          uri: result.assets[0].uri, 
          name: result.assets[0].name,
          docLabel 
        });
        setIsModalVisible(true);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const handleUploadConfirm = () => {
    if (selectedDoc && selectedDoc.uri) {
      const { docKey, uri, name } = selectedDoc;

      setDocuments(prev => ({
        ...prev,
        [docKey]: {
          uri,
          name,
          status: 'UPLOADED'
        }
      }));

      setIsModalVisible(false);
      setTimeout(() => {
        setSelectedDoc(null);
      }, 300);
    }
  };

  const handleRetake = () => {
    if (!selectedDoc) return;
    const { docKey, docLabel } = selectedDoc;
    setIsModalVisible(false);
    setTimeout(() => {
      setSelectedDoc(null);
      pickDocument(docKey, docLabel);
    }, 300);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Simulate save
      setTimeout(() => {
        setLoading(false);
        if (isEdit === 'true') {
          router.back();
        } else {
          router.push('/(tabs)');
        }
      }, 1000);
    } catch (err) {
      setLoading(false);
      Alert.alert('Upload Failed', 'There was an issue saving your documents.');
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Upload Later',
      'You can upload these documents later from your Profile section. Note that you cannot bid until verified.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Continue to App', onPress: () => router.push('/(tabs)') }
      ]
    );
  };

  const allMandatoryUploaded = DOCUMENT_TYPES.every(doc => 
    !doc.mandatory || (documents[doc.key] && documents[doc.key].status === 'UPLOADED')
  );

  const DocumentCard = ({ item }) => {
    const docData = documents[item.key];
    const isUploaded = !!docData && docData.status === 'UPLOADED';
    const isPartial = !!docData && docData.status === 'PARTIAL';

    // Decide what icon and colors to use
    const showSuccess = isUploaded;
    const showWarning = isPartial;

    return (
      <TouchableOpacity 
        style={[
          styles.card, 
          isUploaded && styles.cardUploaded,
        ]}
        onPress={() => pickDocument(item.key, item.label)}
      >
        <View style={styles.cardLeft}>
          <View style={[
            styles.iconBox, 
            isUploaded && styles.iconBoxActive,
          ]}>
            {isUploaded ? (
              <CheckCircle2 size={24} color={theme.colors.success} />
            ) : (
              <FileText size={24} color={theme.colors.primary} />
            )}
          </View>
          <View style={styles.cardTextContainer}>
            <View style={styles.titleRow}>
              <Text style={styles.docTitle}>{item.label}</Text>
              {isUploaded && <Text style={styles.uploadedBadge}>Uploaded</Text>}
            </View>
            <Text style={styles.docSubtitle}>
              {isUploaded ? docData.name : item.description}
            </Text>
          </View>
        </View>
        
        {isUploaded ? (
          <FileText size={24} color={theme.colors.success} />
        ) : (
          <ChevronRight size={20} color={theme.colors.border} />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {isEdit === 'true' && (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
              <ChevronRight size={24} color={theme.colors.text} style={{ transform: [{ rotate: '180deg' }] }} />
            </TouchableOpacity>
          )}
          <View>
            <Text style={styles.headerTitle}>{isEdit === 'true' ? 'Manage Documents' : 'Verification Documents'}</Text>
            <Text style={styles.headerSubtitle}>{isEdit === 'true' ? 'Update your PDF documents' : 'Step 2 of 2: Document Upload'}</Text>
          </View>
        </View>
      </View>

      <View style={styles.infoBanner}>
        <AlertCircle size={20} color={theme.colors.warning} />
        <Text style={styles.infoText}>
          You cannot bid on loads until KKP Logistics verifies your documents. Please upload PDF documents.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {DOCUMENT_TYPES.map((doc) => (
          <DocumentCard key={doc.key} item={doc} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitBtn, !allMandatoryUploaded && styles.submitBtnDisabled]}
          onPress={handleFinish}
          disabled={loading || !allMandatoryUploaded}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.textInverse} />
          ) : (
            <Text style={styles.submitBtnText}>{isEdit === 'true' ? 'Save Changes' : 'Submit for Verification'}</Text>
          )}
        </TouchableOpacity>

        {isEdit !== 'true' && (
          <TouchableOpacity 
            style={styles.skipBtn}
            onPress={handleSkip}
            disabled={loading}
          >
            <Text style={styles.skipBtnText}>Upload Documents Later</Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => {
            setIsModalVisible(false);
            setTimeout(() => setSelectedImage(null), 300);
          }}
        >
          {selectedDoc && (
            <View style={styles.bottomSheet} onStartShouldSetResponder={() => true}>
              <Text style={styles.modalTitle}>Upload {selectedDoc.docLabel}</Text>
              <Text style={styles.modalSubtitle}>Do you want to upload this PDF document?</Text>
              
              <View style={styles.pdfPreview}>
                <FileText size={64} color={theme.colors.primary} />
                <Text style={styles.pdfName}>{selectedDoc.name}</Text>
              </View>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.primaryBtn} onPress={handleUploadConfirm}>
                  <Text style={styles.primaryBtnText}>Upload Document</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.secondaryBtn} onPress={handleRetake}>
                  <Text style={styles.secondaryBtnText}>Choose Different PDF</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.cancelBtn} 
                  onPress={() => {
                    setIsModalVisible(false);
                    setTimeout(() => setSelectedDoc(null), 300);
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
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
  infoBanner: {
    flexDirection: 'row',
    backgroundColor: '#FEF9C3', // light yellow
    padding: theme.spacing.md,
    gap: 12,
    alignItems: 'flex-start',
  },
  infoText: {
    ...theme.typography.caption,
    color: theme.colors.warning,
    flex: 1,
    lineHeight: 20,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xxxl,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    ...theme.shadows.sm,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  uploadedBadge: {
    ...theme.typography.small,
    color: theme.colors.success,
    backgroundColor: theme.colors.success + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  partialBadge: {
    ...theme.typography.small,
    color: theme.colors.warning,
    backgroundColor: theme.colors.warning + '10',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
  cardUploaded: {
    borderColor: theme.colors.success + '40',
    backgroundColor: theme.colors.success + '05',
  },
  cardPartial: {
    borderColor: theme.colors.warning + '40',
    backgroundColor: theme.colors.warning + '05',
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconBoxActive: {
    backgroundColor: theme.colors.success + '10',
  },
  iconBoxPartial: {
    backgroundColor: theme.colors.warning + '10',
  },
  docSubtitle: {
    ...theme.typography.small,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  cardTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: theme.borderRadius.sm,
  },
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
  },
  submitBtn: {
    height: 56,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.md,
  },
  submitBtnDisabled: {
    backgroundColor: theme.colors.border,
    elevation: 0,
    shadowOpacity: 0,
  },
  submitBtnText: {
    ...theme.typography.buttonLarge,
    color: theme.colors.textInverse,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  modalTitle: {
    ...theme.typography.h3,
    color: theme.colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  modalSubtitle: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  skipBtn: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  skipBtnText: {
    ...theme.typography.bodySemiBold,
    color: theme.colors.primary,
    textDecorationLine: 'underline',
  },
  pdfPreview: {
    width: '100%',
    padding: theme.spacing.xl,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
  },
  pdfName: {
    ...theme.typography.bodyMedium,
    color: theme.colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  cancelBtn: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelBtnText: {
    ...theme.typography.bodyMedium,
    color: theme.colors.textSecondary,
  },
});
