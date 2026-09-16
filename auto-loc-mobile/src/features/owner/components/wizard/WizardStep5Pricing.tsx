import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import {
  Banknote,
  TrendingDown,
  Sparkles,
  Percent,
  Plus,
  Trash2,
  Coins,
  Calculator,
  Info,
  CheckCircle2,
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

export interface PriceTier {
  joursMin: number;
  joursMax?: number;
  prix: number;
}

export interface Step5Data {
  prixParJour: number;
  tiers: PriceTier[];
}

interface WizardStep5PricingProps {
  data: Step5Data;
  onChange: (updated: Partial<Step5Data>) => void;
}

const PRESET_PRICES = [15000, 25000, 35000, 50000, 75000, 100000];

export const WizardStep5Pricing: React.FC<WizardStep5PricingProps> = ({
  data,
  onChange,
}) => {
  const [frauncesLoaded] = useFraunces({ Fraunces_600SemiBold });
  const [interLoaded] = useInter({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const prixParJour = data.prixParJour || 0;
  const tiers = data.tiers || [];

  const handlePriceChange = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    onChange({ prixParJour: num });
  };

  const applyPresetTiers = (type: 'standard' | 'aggressive') => {
    if (!prixParJour || prixParJour < 1000) return;

    if (type === 'standard') {
      onChange({
        tiers: [
          { joursMin: 3, joursMax: 6, prix: Math.round(prixParJour * 0.9) },
          { joursMin: 7, joursMax: 29, prix: Math.round(prixParJour * 0.85) },
          { joursMin: 30, prix: Math.round(prixParJour * 0.75) },
        ],
      });
    } else {
      onChange({
        tiers: [
          { joursMin: 3, joursMax: 6, prix: Math.round(prixParJour * 0.85) },
          { joursMin: 7, joursMax: 14, prix: Math.round(prixParJour * 0.75) },
          { joursMin: 15, prix: Math.round(prixParJour * 0.65) },
        ],
      });
    }
  };

  const addCustomTier = () => {
    const lastMin = tiers.length > 0 ? tiers[tiers.length - 1].joursMin : 1;
    const newTier: PriceTier = {
      joursMin: lastMin + 3,
      prix: prixParJour > 0 ? Math.round(prixParJour * 0.9) : 20000,
    };
    onChange({ tiers: [...tiers, newTier] });
  };

  const removeTier = (index: number) => {
    const updated = tiers.filter((_, i) => i !== index);
    onChange({ tiers: updated });
  };

  const updateTierField = (index: number, field: keyof PriceTier, val: number) => {
    const updated = [...tiers];
    updated[index] = { ...updated[index], [field]: val };
    onChange({ tiers: updated });
  };

  // Estimations de revenus
  const netDaily = Math.round(prixParJour * 0.85);
  const est10Days = netDaily * 10;
  const est20Days = netDaily * 20;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {/* Editorial Hero Header */}
      <View style={styles.heroHeader}>
        <View style={styles.heroBadgeRow}>
          <View style={styles.heroBadgeDot} />
          <Text style={styles.heroBadgeText}>TARIFICATION & REVENUS</Text>
        </View>
        <Text
          style={[
            styles.heroTitle,
            frauncesLoaded && { fontFamily: 'Fraunces_600SemiBold' },
          ]}
        >
          Fixez votre tarif journalier
        </Text>
        <Text style={styles.heroSubtitle}>
          Définissez votre prix de base et proposez des réductions pour encourager les séjours longue durée.
        </Text>
      </View>

      {/* SECTION 1: PRIX PAR JOUR */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <Banknote size={18} color="#059669" />
          <Text style={styles.sectionTitleWithIcon}>Prix de base par jour *</Text>
        </View>
        <Text style={styles.sectionDesc}>
          Tarif journalier appliqué pour une location standard.
        </Text>

        {/* Big Input Container */}
        <View style={styles.bigInputContainer}>
          <TextInput
            style={styles.bigInput}
            keyboardType="numeric"
            value={prixParJour > 0 ? String(prixParJour) : ''}
            onChangeText={handlePriceChange}
            placeholder="25 000"
            placeholderTextColor="#94A3B8"
          />
          <Text style={styles.currencyBadge}>FCFA / jour</Text>
        </View>

        {/* Preset Chips */}
        <Text style={styles.presetChipsTitle}>Raccourcis prix fréquents :</Text>
        <View style={styles.presetChipsRow}>
          {PRESET_PRICES.map((price) => {
            const isSelected = prixParJour === price;
            return (
              <TouchableOpacity
                key={price}
                style={[
                  styles.priceChip,
                  isSelected && styles.priceChipActive,
                ]}
                onPress={() => onChange({ prixParJour: price })}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.priceChipText,
                    isSelected && styles.priceChipTextActive,
                  ]}
                >
                  {price.toLocaleString('fr-FR')} F
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* SECTION 2: ESTIMATEUR DE REVENUS */}
      {prixParJour >= 1000 && (
        <View style={styles.simulatorCard}>
          <View style={styles.simulatorHeader}>
            <View style={styles.simulatorIconBg}>
              <Calculator size={18} color="#059669" />
            </View>
            <View style={styles.simulatorHeaderCol}>
              <Text style={styles.simulatorTitle}>Estimation de vos revenus</Text>
              <Text style={styles.simulatorSub}>Basé sur un prix de {prixParJour.toLocaleString('fr-FR')} FCFA/j</Text>
            </View>
          </View>

          <View style={styles.simulatorGrid}>
            <View style={styles.simulatorBox}>
              <Text style={styles.simulatorBoxLabel}>10 jours / mois</Text>
              <Text style={styles.simulatorBoxValue}>
                ~ {est10Days.toLocaleString('fr-FR')} F
              </Text>
              <Text style={styles.simulatorBoxSub}>Revenu net hôte</Text>
            </View>

            <View style={styles.simulatorBoxHighlight}>
              <Text style={styles.simulatorBoxLabelHighlight}>20 jours / mois</Text>
              <Text style={styles.simulatorBoxValueHighlight}>
                ~ {est20Days.toLocaleString('fr-FR')} F
              </Text>
              <Text style={styles.simulatorBoxSubHighlight}>Revenu net hôte</Text>
            </View>
          </View>

          <View style={styles.simulatorFooter}>
            <Info size={14} color="#047857" />
            <Text style={styles.simulatorFooterText}>
              Vous percevez environ 85% du tarif total. AutoLoc gère la gestion des paiements et la visibilité.
            </Text>
          </View>
        </View>
      )}

      {/* SECTION 3: TARIFS DÉGRESSIFS (TIERS) */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <TrendingDown size={18} color="#0284C7" />
          <Text style={styles.sectionTitleWithIcon}>Réductions Longue Durée</Text>
          <View style={styles.recommendedBadge}>
            <Text style={styles.recommendedBadgeText}>RECOMMANDÉ</Text>
          </View>
        </View>
        <Text style={styles.sectionDesc}>
          Attirez les locataires qui réservent plusieurs jours d’affilée en leur offrant un tarif dégressif.
        </Text>

        {/* Preset Discount Action Buttons */}
        <View style={styles.presetsBox}>
          <Text style={styles.presetsBoxTitle}>Appliquer un profil de remise en 1 clic :</Text>
          <View style={styles.presetsButtonsRow}>
            <TouchableOpacity
              style={styles.presetActionBtn}
              onPress={() => applyPresetTiers('standard')}
              disabled={!prixParJour || prixParJour < 1000}
              activeOpacity={0.8}
            >
              <Sparkles size={16} color="#059669" />
              <View style={styles.presetActionTextCol}>
                <Text style={styles.presetActionTitle}>Réduction Standard</Text>
                <Text style={styles.presetActionSub}>-10% dès 3j · -15% dès 7j · -25% dès 30j</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.presetActionBtn}
              onPress={() => applyPresetTiers('aggressive')}
              disabled={!prixParJour || prixParJour < 1000}
              activeOpacity={0.8}
            >
              <TrendingDown size={16} color="#0284C7" />
              <View style={styles.presetActionTextCol}>
                <Text style={styles.presetActionTitle}>Réduction Long Séjour</Text>
                <Text style={styles.presetActionSub}>-15% dès 3j · -25% dès 7j · -35% dès 15j</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tiers List */}
        <View style={styles.tiersHeaderRow}>
          <Text style={styles.tiersTitle}>Paliers de réduction configurés</Text>
          <TouchableOpacity
            style={styles.addTierBtn}
            onPress={addCustomTier}
            activeOpacity={0.7}
          >
            <Plus size={14} color="#059669" />
            <Text style={styles.addTierBtnText}>Ajouter</Text>
          </TouchableOpacity>
        </View>

        {tiers.length > 0 ? (
          <View style={styles.tiersList}>
            {tiers.map((tier, index) => (
              <View key={index} style={styles.tierCard}>
                <View style={styles.tierTopRow}>
                  <Text style={styles.tierIndexText}>Palier {index + 1}</Text>
                  <TouchableOpacity
                    onPress={() => removeTier(index)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Trash2 size={16} color="#EF4444" />
                  </TouchableOpacity>
                </View>

                <View style={styles.tierInputsRow}>
                  <View style={styles.tierInputCol}>
                    <Text style={styles.tierInputLabel}>Dès (jours)</Text>
                    <TextInput
                      style={styles.tierInput}
                      keyboardType="numeric"
                      value={String(tier.joursMin)}
                      onChangeText={(val) => {
                        const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 1;
                        updateTierField(index, 'joursMin', num);
                      }}
                    />
                  </View>

                  <View style={styles.tierInputCol}>
                    <Text style={styles.tierInputLabel}>Prix révisé (FCFA/j)</Text>
                    <TextInput
                      style={styles.tierInput}
                      keyboardType="numeric"
                      value={String(tier.prix)}
                      onChangeText={(val) => {
                        const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
                        updateTierField(index, 'prix', num);
                      }}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyTiersBox}>
            <Info size={16} color="#64748B" />
            <Text style={styles.emptyTiersText}>
              Aucun palier configuré. Cliquez sur l’un des boutons ci-dessus pour appliquer une remise recommandée.
            </Text>
          </View>
        )}
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

  // Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  sectionTitleWithIcon: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    flex: 1,
  },
  sectionDesc: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    marginBottom: 12,
  },

  recommendedBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },

  // Big Price Input
  bigInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    marginBottom: 12,
  },
  bigInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  currencyBadge: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
  },

  // Preset Chips
  presetChipsTitle: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748B',
    marginBottom: 8,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  priceChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  priceChipText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    color: '#475569',
  },
  priceChipTextActive: {
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },

  // Simulator Card
  simulatorCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#A7F3D0',
    gap: 12,
  },
  simulatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  simulatorIconBg: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  simulatorHeaderCol: {
    flex: 1,
  },
  simulatorTitle: {
    fontSize: 15,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  simulatorSub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#065F46',
  },
  simulatorGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  simulatorBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  simulatorBoxLabel: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748B',
  },
  simulatorBoxValue: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
    marginVertical: 2,
  },
  simulatorBoxSub: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#94A3B8',
  },

  simulatorBoxHighlight: {
    flex: 1,
    backgroundColor: '#047857',
    borderRadius: 12,
    padding: 12,
  },
  simulatorBoxLabelHighlight: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#D1FAE5',
  },
  simulatorBoxValueHighlight: {
    fontSize: 16,
    fontFamily: 'Inter_700Bold',
    color: '#FFFFFF',
    marginVertical: 2,
  },
  simulatorBoxSubHighlight: {
    fontSize: 10,
    fontFamily: 'Inter_500Medium',
    color: '#A7F3D0',
  },
  simulatorFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 4,
  },
  simulatorFooterText: {
    flex: 1,
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
    color: '#065F46',
    lineHeight: 16,
  },

  // Presets Box
  presetsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  presetsBoxTitle: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
    marginBottom: 10,
  },
  presetsButtonsRow: {
    gap: 8,
  },
  presetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  presetActionTextCol: {
    flex: 1,
  },
  presetActionTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  presetActionSub: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    marginTop: 1,
  },

  // Tiers List
  tiersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tiersTitle: {
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    color: '#1E293B',
  },
  addTierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  addTierBtnText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#047857',
  },
  tiersList: {
    gap: 10,
  },
  tierCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierIndexText: {
    fontSize: 12,
    fontFamily: 'Inter_700Bold',
    color: '#059669',
  },
  tierInputsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  tierInputCol: {
    flex: 1,
  },
  tierInputLabel: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    color: '#64748B',
    marginBottom: 4,
  },
  tierInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    color: '#0F172A',
  },
  emptyTiersBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTiersText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    color: '#64748B',
    lineHeight: 16,
  },
});
