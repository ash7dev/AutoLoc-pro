import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import {
  Banknote,
  TrendingDown,
  Sparkles,
  Plus,
  Trash2,
  Info,
  ChevronDown,
  ChevronUp,
} from 'lucide-react-native';
import { theme } from '../../../../core/theme';

if (
  Platform.OS === 'android' &&
  UIManager.setLayoutAnimationEnabledExperimental
) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

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

const PRESET_PRICES = [30000, 35000, 50000, 60000, 75000, 100000];

export const WizardStep5Pricing: React.FC<WizardStep5PricingProps> = ({
  data,
  onChange,
}) => {
  const prixParJour = data.prixParJour || 0;
  const tiers = data.tiers || [];

  const [discountsExpanded, setDiscountsExpanded] = useState(tiers.length > 0);

  const toggleDiscounts = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setDiscountsExpanded((prev) => !prev);
  };

  const handlePriceChange = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    onChange({ prixParJour: num });
  };

  const addCustomTier = () => {
    const lastMin = tiers.length > 0 ? tiers[tiers.length - 1].joursMin : 1;
    const newTier: PriceTier = {
      joursMin: lastMin + 3,
      prix: prixParJour > 0 ? Math.round(prixParJour * 0.95) : 20000,
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

  const getDiscountPercent = (tierPrice: number) => {
    if (!prixParJour || prixParJour <= 0 || tierPrice >= prixParJour) return 0;
    return Math.round(((prixParJour - tierPrice) / prixParJour) * 100);
  };

  return (
    <View style={styles.container}>
      {/* Hero Header d'étape Centré Luxury */}
      <View style={styles.centeredHeroHeader}>
        <View style={styles.centeredIconBadge}>
          <Banknote size={22} color="#4ADE80" strokeWidth={2.2} />
        </View>
        <Text style={styles.centeredHeroTitle} numberOfLines={1} adjustsFontSizeToFit>
          Tarification & Revenus
        </Text>
        <Text style={styles.centeredHeroSubtitle}>
          Fixez votre prix par jour et optimisez vos revenus avec des remises
        </Text>
      </View>

      {/* SECTION 1: PRIX PAR JOUR */}
      <View style={styles.sectionCard}>
        <View style={styles.labelWithIcon}>
          <Banknote size={16} color="#059669" strokeWidth={2.2} />
          <Text style={styles.sectionTitle}>Prix de base par jour *</Text>
        </View>

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

      {/* SECTION 2: ACCORDÉON RÉDUCTIONS LONGUE DURÉE */}
      <View style={styles.sectionCard}>
        <TouchableOpacity
          style={styles.accordionHeader}
          onPress={toggleDiscounts}
          activeOpacity={0.7}
        >
          <View style={styles.accordionHeaderLeft}>
            <TrendingDown size={16} color="#059669" strokeWidth={2.2} />
            <Text style={styles.sectionTitle} numberOfLines={1}>
              Réductions Longue Durée
            </Text>
          </View>
          <View style={styles.accordionHeaderRight}>
            {tiers.length > 0 && !discountsExpanded && (
              <View style={styles.activeTiersBadge}>
                <Text style={styles.activeTiersBadgeText}>
                  {tiers.length} palier{tiers.length > 1 ? 's' : ''}
                </Text>
              </View>
            )}
            {discountsExpanded ? (
              <ChevronUp size={18} color="#059669" />
            ) : (
              <ChevronDown size={18} color="#64748B" />
            )}
          </View>
        </TouchableOpacity>

        {discountsExpanded && (
          <View style={styles.accordionBody}>
            {/* Tiers List */}
            <View style={styles.tiersHeaderRow}>
              <Text style={styles.tiersTitle}>Paliers configurés</Text>
              <TouchableOpacity
                style={styles.addTierBtn}
                onPress={addCustomTier}
                activeOpacity={0.7}
              >
                <Plus size={14} color="#059669" />
                <Text style={styles.addTierBtnText}>Ajouter un palier</Text>
              </TouchableOpacity>
            </View>

            {tiers.length > 0 ? (
              <View style={styles.tiersList}>
                {tiers.map((tier, index) => {
                  const pct = getDiscountPercent(tier.prix);
                  return (
                    <View key={index} style={styles.tierCard}>
                      <View style={styles.tierTopRow}>
                        <View style={styles.tierTopLeft}>
                          <Text style={styles.tierIndexText}>Palier {index + 1}</Text>
                          {pct > 0 && (
                            <View style={styles.discountPctBadge}>
                              <Text style={styles.discountPctBadgeText}>-{pct}%</Text>
                            </View>
                          )}
                        </View>
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
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptyTiersBox}>
                <Info size={16} color="#64748B" />
                <Text style={styles.emptyTiersText}>
                  Aucun palier configuré. Cliquez sur « + Ajouter un palier » pour définir une réduction (ex: dès 3 ou 5 jours).
                </Text>
              </View>
            )}
          </View>
        )}
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

  labelWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  // Cards
  sectionCard: {
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
  sectionTitle: {
    fontSize: 15.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    letterSpacing: -0.3,
  },

  // Accordion Header
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    flex: 1,
    flexShrink: 1,
  },
  accordionHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  recommendedBadge: {
    backgroundColor: '#041912',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  recommendedBadgeText: {
    fontSize: 10,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#4ADE80',
  },
  activeTiersBadge: {
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  activeTiersBadgeText: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },

  accordionBody: {
    marginTop: 4,
    gap: 12,
  },

  // Big Price Input
  bigInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  bigInput: {
    flex: 1,
    fontSize: 22,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
  },
  currencyBadge: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
  },

  // Preset Chips
  presetChipsTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    marginTop: 4,
  },
  presetChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priceChip: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 7.5,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  priceChipActive: {
    backgroundColor: '#041912',
    borderColor: '#041912',
  },
  priceChipText: {
    fontSize: 12.5,
    fontFamily: theme.typography.fontFamily.medium,
    color: '#475569',
  },
  priceChipTextActive: {
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#4ADE80',
  },

  // Presets Box
  presetsBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  presetsBoxTitle: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
    marginBottom: 8,
  },
  presetsButtonsRow: {
    gap: 8,
  },
  presetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  presetActionIconBg: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetActionIconBgBlue: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  presetActionTextCol: {
    flex: 1,
  },
  presetActionTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
  },
  presetActionSub: {
    fontSize: 11,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    marginTop: 1,
  },

  // Tiers List
  tiersHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  tiersTitle: {
    fontSize: 13,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#041912',
  },
  addTierBtn: {
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
  addTierBtnText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#047857',
  },
  tiersList: {
    gap: 8,
  },
  tierCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  tierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  tierTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tierIndexText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#059669',
  },
  discountPctBadge: {
    backgroundColor: '#041912',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountPctBadgeText: {
    fontSize: 10.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#4ADE80',
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
    fontFamily: theme.typography.fontFamily.medium,
    color: '#64748B',
    marginBottom: 4,
  },
  tierInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === 'ios' ? 8 : 4,
    fontSize: 13.5,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    color: '#0F172A',
  },
  emptyTiersBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  emptyTiersText: {
    flex: 1,
    fontSize: 12,
    fontFamily: theme.typography.fontFamily.regular,
    color: '#64748B',
    lineHeight: 16,
  },
});
