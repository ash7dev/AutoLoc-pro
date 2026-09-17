import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  Pressable,
} from 'react-native';
import {
  ShieldCheck,
  Award,
  User,
  Clock,
  CheckCircle2,
  Star,
  Sparkles,
} from 'lucide-react-native';
import { theme } from '../../../core/theme';

interface ProprietaireData {
  prenom?: string;
  nom?: string;
  avatarUrl?: string | null;
  noteProprietaire?: number | string | null;
  totalAvis?: number | null;
}

interface VehicleOwnerCardProps {
  proprietaire?: ProprietaireData | null;
  onViewProfile?: () => void;
  onContactHost?: () => void;
}

export const VehicleOwnerCard: React.FC<VehicleOwnerCardProps> = ({
  proprietaire,
  onViewProfile,
  onContactHost,
}) => {
  const prenom = proprietaire?.prenom || 'Hôte';
  const nom = proprietaire?.nom || 'Partenaire';
  const fullName = `${prenom} ${nom}`.trim();
  const avatarUri = proprietaire?.avatarUrl;
  const initial = (prenom[0] || 'A').toUpperCase();
  const totalAvis = proprietaire?.totalAvis || 0;
  const noteNum = proprietaire?.noteProprietaire ? Number(proprietaire.noteProprietaire) : 0;
  const noteFormatted = noteNum > 0 ? noteNum.toFixed(1) : null;

  const handlePress = onViewProfile || onContactHost;

  return (
    <View style={styles.cardContainer}>
      <View style={styles.topRow}>
        {/* Avatar avec anneau lumineux */}
        <View style={styles.avatarWrapper}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitial}>{initial}</Text>
            </View>
          )}
          <View style={styles.onlineBadge}>
            <CheckCircle2 size={12} color="#FFFFFF" fill="#10B981" />
          </View>
        </View>

        {/* Détails du Propriétaire */}
        <View style={styles.metaContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.ownerName} numberOfLines={1}>{fullName}</Text>
            <Award size={16} color="#16A34A" />
          </View>

          <Text style={styles.ownerSubtitle}>Hôte Vérifié • AutoLoc Premium</Text>

          <View style={styles.statsInlineRow}>
            {totalAvis > 0 && noteFormatted ? (
              <View style={styles.statPill}>
                <Star size={12} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.statPillText}>{noteFormatted} ({totalAvis})</Text>
              </View>
            ) : (
              <View style={styles.statPill}>
                <Sparkles size={12} color="#16A34A" />
                <Text style={styles.statPillText}>Nouveau Hôte</Text>
              </View>
            )}
            <View style={styles.statDot} />
            <View style={styles.statPill}>
              <Clock size={12} color="#5F6B59" />
              <Text style={styles.statSubText}>Réponse &lt; 15 min</Text>
            </View>
          </View>
        </View>

        {/* Badge Sécurité droite */}
        <View style={styles.shieldBadge}>
          <ShieldCheck size={22} color="#16A34A" />
        </View>
      </View>

      {/* Bouton Voir le profil au style Dark Auth */}
      {handlePress && (
        <Pressable
          style={({ pressed }) => [
            styles.contactButton,
            pressed && styles.contactButtonPressed,
          ]}
          onPress={handlePress}
        >
          <User size={15} color="#4ADE80" />
          <Text style={styles.contactButtonText}>Voir le profil de l'hôte</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    marginVertical: 12,
    shadowColor: '#04150F',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 14,
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#10B981',
  },
  avatarInitial: {
    color: '#041912',
    fontSize: 20,
    fontWeight: '800',
  },
  onlineBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
  },
  metaContainer: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ownerName: {
    color: '#041912',
    fontSize: 17,
    fontFamily: theme.typography.fontFamily.displaySemiBold,
    letterSpacing: -0.2,
  },
  ownerSubtitle: {
    color: '#5F6B59',
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  statsInlineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statPillText: {
    color: '#041912',
    fontSize: 11,
    fontWeight: '700',
  },
  statSubText: {
    color: '#5F6B59',
    fontSize: 11,
  },
  statDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#D4DCD0',
  },
  shieldBadge: {
    paddingLeft: 10,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#041912',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: 'rgba(4, 25, 18, 0.90)',
    shadowColor: '#041912',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.20,
    shadowRadius: 8,
    elevation: 4,
  },
  contactButtonPressed: {
    backgroundColor: '#020B08',
    opacity: 0.9,
  },
  contactButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
