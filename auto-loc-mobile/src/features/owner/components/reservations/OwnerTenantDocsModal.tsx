import React, { useState } from 'react';
import {
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import {
  Camera,
  CreditCard,
  FileBadge,
  Lock,
  ShieldCheck,
  X,
  Eye,
  FileText,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { OwnerLocataireDocs } from '../../hooks/useOwnerBookingDetail';

interface OwnerTenantDocsModalProps {
  visible: boolean;
  onClose: () => void;
  docs: OwnerLocataireDocs | null;
}

type TabType = 'KYC_ID' | 'SELFIE' | 'PERMIS';
type SideType = 'RECTO' | 'VERSO';

export const OwnerTenantDocsModal: React.FC<OwnerTenantDocsModalProps> = ({
  visible,
  onClose,
  docs,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('KYC_ID');
  const [side, setSide] = useState<SideType>('RECTO');

  if (!visible) return null;

  const isVerified = docs?.kycStatus === 'VERIFIE';

  const getDocInfo = () => {
    switch (activeTab) {
      case 'KYC_ID':
        return {
          url: side === 'RECTO' ? docs?.kycDocumentUrl : (docs?.kycDocumentBackUrl || null),
          title: side === 'RECTO' ? 'Pièce d’identité (Recto)' : 'Pièce d’identité (Verso)',
          subtitle: side === 'RECTO' ? 'Face avant du document d’identité' : 'Face arrière du document d’identité',
        };
      case 'SELFIE':
        return {
          url: docs?.kycSelfieUrl,
          title: 'Selfie de vérification',
          subtitle: 'Photo en direct avec la pièce d’identité',
        };
      case 'PERMIS':
        return {
          url: docs?.permisUrl,
          title: 'Permis de conduire',
          subtitle: 'Permis valide conforme à la catégorie',
        };
      default:
        return { url: null, title: 'Document', subtitle: '' };
    }
  };

  const currentDoc = getDocInfo();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalCard}>
          {/* Sheet Handle Indicator */}
          <View style={styles.handleContainer}>
            <View style={styles.sheetHandle} />
          </View>

          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.headerBadge}>
                <ShieldCheck size={20} color="#059669" />
              </View>
              <View style={styles.headerTitleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {docs?.prenom || 'Locataire'} {docs?.nom || ''}
                </Text>
                <View style={styles.statusRow}>
                  <Text style={styles.subtitle}>Vérification AutoLoc</Text>
                  <View style={[styles.kycBadge, isVerified ? styles.kycSuccess : styles.kycPending]}>
                    <Text style={[styles.kycBadgeText, isVerified ? styles.kycSuccessText : styles.kycPendingText]}>
                      {isVerified ? 'Profil Vérifié' : 'En attente'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            <TouchableOpacity onPress={onClose} style={styles.closeBtn} accessibilityLabel="Fermer">
              <X size={18} color="#64748B" />
            </TouchableOpacity>
          </View>

          {/* Icon Tabs Navigation Scroll */}
          <View style={styles.tabsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsScrollContent}
            >
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setActiveTab('KYC_ID');
                  setSide('RECTO');
                }}
                style={[styles.tabPill, activeTab === 'KYC_ID' && styles.tabPillActive]}
              >
                <CreditCard size={14} color={activeTab === 'KYC_ID' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === 'KYC_ID' && styles.tabTextActive]}>
                  Pièce d'identité
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('SELFIE')}
                style={[styles.tabPill, activeTab === 'SELFIE' && styles.tabPillActive]}
              >
                <Camera size={14} color={activeTab === 'SELFIE' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === 'SELFIE' && styles.tabTextActive]}>
                  Selfie KYC
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setActiveTab('PERMIS')}
                style={[styles.tabPill, activeTab === 'PERMIS' && styles.tabPillActive]}
              >
                <FileBadge size={14} color={activeTab === 'PERMIS' ? '#FFFFFF' : '#64748B'} />
                <Text style={[styles.tabText, activeTab === 'PERMIS' && styles.tabTextActive]}>
                  Permis de conduire
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* Main Content Body */}
          <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
            {/* Recto / Verso Segment Control Bar for KYC ID */}
            {activeTab === 'KYC_ID' && (
              <View style={styles.sideSegmentContainer}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSide('RECTO')}
                  style={[styles.sideSegmentBtn, side === 'RECTO' && styles.sideSegmentBtnActive]}
                >
                  <Text style={[styles.sideSegmentText, side === 'RECTO' && styles.sideSegmentTextActive]}>
                    Face Avant (Recto)
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSide('VERSO')}
                  style={[styles.sideSegmentBtn, side === 'VERSO' && styles.sideSegmentBtnActive]}
                >
                  <Text style={[styles.sideSegmentText, side === 'VERSO' && styles.sideSegmentTextActive]}>
                    Face Arrière (Verso)
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Document Label Banner */}
            <View style={styles.docMetaBanner}>
              <View style={styles.docMetaLeft}>
                <FileText size={16} color="#059669" />
                <View style={{ flex: 1 }}>
                  <Text style={styles.docMetaTitle}>{currentDoc.title}</Text>
                  <Text style={styles.docMetaSubtitle}>{currentDoc.subtitle}</Text>
                </View>
              </View>
            </View>

            {/* Document Viewer */}
            {currentDoc.url ? (
              <View style={styles.imageCard}>
                <Image
                  source={{ uri: currentDoc.url }}
                  contentFit="contain"
                  style={styles.docImage}
                  transition={200}
                />
                <View style={styles.imageOverlayHint}>
                  <Eye size={12} color="#FFFFFF" />
                  <Text style={styles.imageOverlayText}>Agrandissement automatique</Text>
                </View>
              </View>
            ) : (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconCircle}>
                  <Lock size={28} color="#94A3B8" />
                </View>
                <Text style={styles.emptyTitle}>Document non disponible</Text>
                <Text style={styles.emptySubtitle}>
                  Le locataire n’a pas téléversé {activeTab === 'KYC_ID' && side === 'VERSO' ? 'la face arrière (verso) de sa pièce d’identité' : 'ce justificatif'} dans son dossier KYC.
                </Text>
              </View>
            )}

            {/* Confidentiality Notice Box */}
            <View style={styles.securityNotice}>
              <View style={styles.securityIconBox}>
                <Lock size={14} color="#047857" />
              </View>
              <Text style={styles.securityText}>
                🔒 Documents confidentiels réservés uniquement à la vérification d’identité pour le contrat AutoLoc.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Action */}
          <View style={styles.footer}>
            <TouchableOpacity activeOpacity={0.85} onPress={onClose} style={styles.closeModalBtn}>
              <Text style={styles.closeModalBtnText}>Fermer la vue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(4, 25, 18, 0.72)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '88%',
    paddingBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  handleContainer: {
    alignItems: 'center',
    paddingTop: 10,
    paddingBottom: 4,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E2E8F0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 12,
  },
  headerBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleContainer: {
    flex: 1,
  },
  title: {
    fontFamily: theme.typography.fontFamily.displayBold,
    fontSize: 16,
    color: '#072A20',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#64748B',
  },
  kycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  kycSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  kycPending: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  kycBadgeText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 10.5,
  },
  kycSuccessText: {
    color: '#047857',
  },
  kycPendingText: {
    color: '#B45309',
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Horizontal Tabs */
  tabsContainer: {
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#F8FAFC',
  },
  tabsScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  tabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabPillActive: {
    backgroundColor: '#072A20',
    borderColor: '#072A20',
  },
  tabText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#475569',
  },
  tabTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },

  /* Body */
  body: {
    padding: 16,
    gap: 14,
  },
  docMetaBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  docMetaLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    marginRight: 8,
  },
  docMetaTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 12.5,
    color: '#072A20',
  },
  docMetaSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#059669',
    marginTop: 1,
  },
  sideSegmentContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    padding: 3,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  sideSegmentBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
  },
  sideSegmentBtnActive: {
    backgroundColor: '#072A20',
    shadowColor: '#072A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  sideSegmentText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 12,
    color: '#64748B',
  },
  sideSegmentTextActive: {
    fontFamily: theme.typography.fontFamily.bold,
    color: '#FFFFFF',
  },

  /* Dark Image Viewer */
  imageCard: {
    width: '100%',
    height: 280,
    borderRadius: 20,
    backgroundColor: '#0F172A',
    borderWidth: 1,
    borderColor: '#1E293B',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  docImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  imageOverlayText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: 10,
    color: '#CBD5E1',
  },

  emptyState: {
    padding: 32,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  emptyIconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 15,
    color: '#072A20',
  },
  emptySubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },

  /* Confidential Notice */
  securityNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  securityIconBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityText: {
    flex: 1,
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
  },

  /* Footer Button */
  footer: {
    paddingHorizontal: 16,
    paddingTop: 4,
  },
  closeModalBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: '#072A20',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#072A20',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  closeModalBtnText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: 13.5,
    color: '#FFFFFF',
  },
});

