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

      {/* Bouton Voir le profil */}
      {handlePress && (
        <Pressable
          style={({ pressed }) => [
            styles.contactButton,
            pressed && styles.contactButtonPressed,
          ]}
          onPress={handlePress}
        >
          <User size={15} color="#16A34A" />
          <Text style={styles.contactButtonText}>Voir le profil</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E4EBDB',
    marginVertical: 10,
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
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#16A34A',
  },
  avatarInitial: {
    color: '#0B3D2E',
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
    color: '#22271F',
    fontSize: 16,
    fontWeight: '700',
  },
  ownerSubtitle: {
    color: '#5F6B59',
    fontSize: 12,
    marginTop: 2,
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
    color: '#22271F',
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
    backgroundColor: '#ECFDF5',
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  contactButtonPressed: {
    backgroundColor: '#DCFCE7',
  },
  contactButtonText: {
    color: '#16A34A',
    fontSize: 13,
    fontWeight: '700',
  },
});
