import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';
import {
  Car,
  MapPin,
  Shield,
  Banknote,
  Images,
  Edit3,
  Sparkles,
  FileCheck2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Fuel,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';
import { Step1Data } from './WizardStep1Model';
import { Step2Data } from './WizardStep2Specs';
import { Step3Data } from './WizardStep3Location';
import { Step4Data } from './WizardStep4Conditions';
import { Step5Data } from './WizardStep5Pricing';
import { Step6Data } from './WizardStep6Photos';

interface WizardStep7ReviewProps {
  step1: Step1Data;
  step2: Step2Data;
  step3: Step3Data;
  step4: Step4Data;
  step5: Step5Data;
  step6: Step6Data;
  onJumpToStep: (step: number) => void;
  onSubmit: () => void;
  submitting: boolean;
}

export const WizardStep7Review: React.FC<WizardStep7ReviewProps> = ({
  step1,
  step2,
  step3,
  step4,
  step5,
  step6,
  onJumpToStep,
  onSubmit,
  submitting,
}) => {
  const coverPhoto =
    step6.photos.length > 0
      ? step6.photos[0].uri
      : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

  return (
    <View style={styles.container}>
      {/* Hero Header d'étape Centré Luxury */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <FileCheck2 size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle} numberOfLines={1} adjustsFontSizeToFit>
          Récapitulatif & Validation
        </Text>
        <Text style={styles.centeredHeroSubtitle}>
          Vérifiez l’apparence de votre annonce avant la mise en ligne.
        </Text>
      </View>

      {/* LIVE VEHICLE CARD PREVIEW */}
      <View style={styles.previewCard}>
        <View style={styles.previewImageContainer}>
          <Image source={{ uri: coverPhoto }} style={styles.previewImage} />
          <View style={styles.newBadge}>
            <Sparkles size={11} color="#4ADE80" />
            <Text style={styles.newBadgeText}>APERÇU DE L'ANNONCE</Text>
          </View>
          <View style={styles.photosCountBadge}>
            <Images size={12} color="#FFFFFF" />
            <Text style={styles.photosCountBadgeText}>
              {step6.photos.length} photo{step6.photos.length > 1 ? 's' : ''}
            </Text>
          </View>
        </View>

        <View style={styles.previewCardBody}>
          <View style={styles.previewTopRow}>
            <View style={styles.previewTitleCol}>
              <Text style={styles.previewTitle} numberOfLines={1}>
                {step1.marque || 'Marque'} {step1.modele || 'Modèle'} ({step1.annee || 2024})
              </Text>
              <View style={styles.previewLocationRow}>
                <MapPin size={13} color="#059669" />
                <Text style={styles.previewLocationText}>
                  {step3.ville || 'Dakar'} · Sénégal
                </Text>
              </View>
            </View>

            {/* License Plate Pill */}
            {Boolean(step1.immatriculation) && (
              <View style={styles.miniPlatePill}>
                <Text style={styles.miniPlateText}>
                  {step1.immatriculation.toUpperCase()}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.previewDivider} />

          {/* Specs Bar */}
          <View style={styles.previewSpecsRow}>
            <Text style={styles.previewSpecTag}>{step2.nombrePlaces} places</Text>
            <Text style={styles.previewSpecDot}>•</Text>
            <Text style={styles.previewSpecTag}>{step1.transmission || 'Automatique'}</Text>
            <Text style={styles.previewSpecDot}>•</Text>
            <Text style={styles.previewSpecTag}>{step1.carburant || 'Essence'}</Text>
          </View>

          {/* Price Bar */}
          <View style={styles.previewPriceRow}>
            <Text style={styles.previewPriceValue}>
              {(step5.prixParJour || 25000).toLocaleString('fr-FR')} FCFA
            </Text>
            <Text style={styles.previewPriceSub}> / jour</Text>
          </View>
        </View>
      </View>

      {/* RECAP SECTIONS WITH QUICK JUMP EDIT BUTTONS */}

      {/* 1. VÉHICULE & SPÉCIFICATIONS */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <Car size={17} color="#059669" strokeWidth={2.2} />
            <Text style={styles.recapTitle}>1. Véhicule & Caractéristiques</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onJumpToStep(1)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color="#059669" />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recapGrid}>
          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Marque & Modèle</Text>
            <Text style={styles.recapValue}>
              {step1.marque} {step1.modele} ({step1.annee})
            </Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Immatriculation</Text>
            <Text style={styles.recapValue}>{step1.immatriculation || 'Non renseignée'}</Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Transmission & Moteur</Text>
            <Text style={styles.recapValue}>
              {step1.transmission} · {step1.carburant}
            </Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Capacité & Équipements</Text>
            <Text style={styles.recapValue}>
              {step2.nombrePlaces} places · {step2.equipements.length} équipement(s)
            </Text>
          </View>
        </View>
      </View>

      {/* 2. LOCALISATION & LOGISTIQUE */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <MapPin size={17} color="#059669" strokeWidth={2.2} />
            <Text style={styles.recapTitle}>2. Localisation & Logistique</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onJumpToStep(3)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color="#059669" />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recapGrid}>
          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Ville principale</Text>
            <Text style={styles.recapValue}>{step3.ville || 'Dakar'}</Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Adresse exacte</Text>
            <Text style={styles.recapValue}>{step3.adresse || 'Communiquée après réservation'}</Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Voyages Hors Dakar</Text>
            <Text style={styles.recapValue}>
              {step3.autoriseHorsDakar
                ? `Autorisé (+${step3.supplementHorsDakarParJour?.toLocaleString('fr-FR')} F/j)`
                : 'Dakar uniquement'}
            </Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Frais de Livraison</Text>
            <Text style={styles.recapValue}>
              {step3.fraisLivraison && step3.fraisLivraison > 0
                ? `${step3.fraisLivraison.toLocaleString('fr-FR')} FCFA`
                : 'Sur place (Gratuit)'}
            </Text>
          </View>
        </View>
      </View>

      {/* 3. PROTECTION & CONSIGNES */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <Shield size={17} color="#059669" strokeWidth={2.2} />
            <Text style={styles.recapTitle}>3. Protection & Conditions</Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onJumpToStep(4)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color="#059669" />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recapGrid}>
          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Formule d'Assurance</Text>
            <Text style={styles.recapValue}>{step4.assurance}</Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Politique Carburant</Text>
            <Text style={styles.recapValue}>{step4.carburantCondition}</Text>
          </View>
        </View>
      </View>

      {/* 4. TARIFICATION & REMISES */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <Banknote size={17} color="#059669" strokeWidth={2.2} />
            <Text style={styles.recapTitle}>
              4. Tarification &{'\n'}Remises
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onJumpToStep(5)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color="#059669" />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recapGrid}>
          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Tarif journalier de base</Text>
            <Text style={styles.recapValue}>
              {step5.prixParJour.toLocaleString('fr-FR')} FCFA / jour
            </Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Paliers dégressifs activés</Text>
            {step5.tiers.length > 0 ? (
              <View style={{ marginTop: 4, gap: 4 }}>
                {step5.tiers.map((t, idx) => (
                  <Text key={idx} style={styles.recapValueHighlight}>
                    • Dès {t.joursMin} jours {t.joursMax ? `jusqu'à ${t.joursMax}j` : ''} : {t.prix.toLocaleString('fr-FR')} FCFA / j
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.recapValue}>Aucun (tarif fixe)</Text>
            )}
          </View>
        </View>
      </View>

      {/* 5. PHOTOS & DOCUMENTS */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <Images size={17} color="#059669" strokeWidth={2.2} />
            <Text style={styles.recapTitle}>
              5. Photos &{'\n'}Documents
            </Text>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => onJumpToStep(6)}
            activeOpacity={0.7}
          >
            <Edit3 size={13} color="#059669" />
            <Text style={styles.editBtnText}>Modifier</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recapGrid}>
          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Galerie photos</Text>
            <Text style={styles.recapValue}>
              {step6.photos.length} photo{step6.photos.length > 1 ? 's' : ''} (1ère en couverture)
            </Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Justificatifs administratifs</Text>
            <Text style={styles.recapValue}>
              {step6.carteGrise ? '✅ Carte Grise' : '📌 Carte Grise non jointe'} ·{' '}
              {step6.assuranceDoc ? '✅ Assurance' : '📌 Assurance non jointe'}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    gap: 16,
  },

  centeredHeroHeader: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    paddingHorizontal: 8,
  },
  centeredIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#041912',
    borderWidth: 1.5,
    borderColor: 'rgba(74, 222, 128, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 4,
  },
  centeredHeroTitle: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    fontSize: 21.5,
    lineHeight: 28,
    color: '#041912',
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  centeredHeroSubtitle: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 300,
  },

  // Live Vehicle Preview Card
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  previewImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#F1F5F9',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  newBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#041912',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(74, 222, 128, 0.4)',
  },
  newBadgeText: {
    fontSize: 9.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#4ADE80',
    letterSpacing: 0.6,
  },
  photosCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 8,
  },
  photosCountBadgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#FFFFFF',
  },
  previewCardBody: {
    padding: 16,
  },
  previewTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  previewTitleCol: {
    flex: 1,
  },
  previewTitle: {
    fontSize: 16.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
  },
  previewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  previewLocationText: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },
  miniPlatePill: {
    backgroundColor: '#FEF9C3',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FDE047',
  },
  miniPlateText: {
    fontSize: 10.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#854D0E',
    letterSpacing: 0.5,
  },
  previewDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  previewSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  previewSpecTag: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#475569',
  },
  previewSpecDot: {
    fontSize: 12,
    color: '#CBD5E1',
  },
  previewPriceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  previewPriceValue: {
    fontSize: 19,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
  },
  previewPriceSub: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },

  // Recap Section Cards
  recapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  recapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  recapTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  recapTitle: {
    fontSize: 14.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  editBtnText: {
    fontSize: 11.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
  recapGrid: {
    gap: 8,
  },
  recapItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recapLabel: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
  },
  recapValue: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#0F172A',
    marginTop: 2,
  },
  recapValueHighlight: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
});
