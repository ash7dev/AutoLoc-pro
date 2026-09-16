import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import {
  Car,
  MapPin,
  Shield,
  Banknote,
  Images,
  Edit3,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Compass,
  Truck,
  Fuel,
  Coins,
  FileCheck2,
  ShieldCheck,
} from 'lucide-react-native';
import {
  useFonts as useFraunces,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  useFonts as useInter,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
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
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const coverPhoto =
    step6.photos.length > 0
      ? step6.photos[0].uri
      : 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Editorial Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadgeDot} />
          <Text style={styles.heroBadgeText}>PRÉVISUALISATION & SOUMISSION</Text>
        </View>
        <Text
          style={[
            styles.heroTitle,
            frauncesLoaded && { fontFamily: 'Fraunces_600SemiBold' },
          ]}
        >
          Aperçu de votre annonce
        </Text>
        <Text style={styles.heroSubtitle}>
          Vérifiez l’apparence de votre véhicule telle qu’elle sera affichée aux locataires sur AutoLoc.
        </Text>
      </View>

      {/* LIVE VEHICLE CARD PREVIEW (Airbnb/Turo Style) */}
      <View style={styles.previewCard}>
        <View style={styles.previewImageContainer}>
          <Image source={{ uri: coverPhoto }} style={styles.previewImage} />
          <View style={styles.newBadge}>
            <Sparkles size={12} color="#FFFFFF" />
            <Text style={styles.newBadgeText}>NOUVEAU SUR AUTOLOC</Text>
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
              <Text style={styles.previewTitle}>
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
            {step1.immatriculation.length > 0 && (
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
            <Text style={styles.previewSpecTag}>{step1.transmission || 'Auto'}</Text>
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
            <Car size={18} color="#059669" />
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
            <Text style={styles.recapValue}>{step1.immatriculation}</Text>
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
              {step2.nombrePlaces} places · {step2.equipements.length} équipements
            </Text>
          </View>
        </View>
      </View>

      {/* 2. LOCALISATION & LOGISTIQUE */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <MapPin size={18} color="#059669" />
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
            <Text style={styles.recapValue}>{step3.adresse || 'Communiquee au locataire'}</Text>
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

      {/* 3. ASSURANCE & CONDITIONS */}
      <View style={styles.recapCard}>
        <View style={styles.recapHeaderRow}>
          <View style={styles.recapTitleGroup}>
            <Shield size={18} color="#0284C7" />
            <Text style={styles.recapTitle}>3. Protection & Consignes</Text>
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
            <Banknote size={18} color="#7C3AED" />
            <Text style={styles.recapTitle}>4. Tarification & Remises</Text>
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
                    • Dès {t.joursMin} jours {t.joursMax ? `jusqu'à ${t.joursMax}j` : ''} : {t.prix.toLocaleString('fr-FR')} FCFA / jour
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
            <Images size={18} color="#059669" />
            <Text style={styles.recapTitle}>5. Photos & Papiers</Text>
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
            <Text style={styles.recapLabel}>Photos ajoutées</Text>
            <Text style={styles.recapValue}>
              {step6.photos.length} photo{step6.photos.length > 1 ? 's' : ''} (Couverture prête)
            </Text>
          </View>

          <View style={styles.recapItem}>
            <Text style={styles.recapLabel}>Carte Grise & Assurance</Text>
            <Text style={styles.recapValue}>
              {step6.carteGrise ? '✅ Carte Grise' : '📌 Carte Grise non jointe'} ·{' '}
              {step6.assuranceDoc ? '✅ Assurance' : '📌 Assurance non jointe'}
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroHeader: {
    marginBottom: 4,
    gap: 6,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  heroBadgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#059669',
  },
  heroBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#051B14',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 20,
  },

  // Live Vehicle Preview Card
  previewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 4,
  },
  previewImageContainer: {
    width: '100%',
    height: 180,
    position: 'relative',
    backgroundColor: '#E2E8F0',
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
    gap: 4,
    backgroundColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  photosCountBadge: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  photosCountBadgeText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
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
    fontSize: 17,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  previewLocationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  previewLocationText: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  miniPlatePill: {
    backgroundColor: '#FEF08A',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAB308',
  },
  miniPlateText: {
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    color: '#854D0E',
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
    fontFamily: 'Inter_500Medium',
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
    fontSize: 20,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
  },
  previewPriceSub: {
    fontSize: 13,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },

  // Recap Section Cards
  recapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  recapHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  recapTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  recapTitle: {
    fontSize: 14.5,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  editBtnText: {
    fontSize: 11.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  recapGrid: {
    gap: 8,
  },
  recapItem: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
  },
  recapLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
  },
  recapValue: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#0F172A',
    marginTop: 2,
  },
  recapValueHighlight: {
    fontSize: 12.5,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
});
