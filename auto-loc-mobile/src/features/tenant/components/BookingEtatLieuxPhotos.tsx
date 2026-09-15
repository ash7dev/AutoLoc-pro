import React, { useMemo } from 'react';
import { Image } from 'expo-image';
import { Camera } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { theme } from '../../../core/theme';

type Photo = { id: string; url: string; type: 'CHECKIN' | 'CHECKOUT'; categorie?: string };
const labels: Record<string, string> = { AVANT: 'Avant', ARRIERE: 'Arrière', COTE_GAUCHE: 'Côté gauche', COTE_DROIT: 'Côté droit', COMPTEUR_KM: 'Compteur', CARBURANT: 'Carburant' };

export const BookingEtatLieuxPhotos: React.FC<{ photos?: Photo[]; onPress?: () => void }> = ({ photos = [], onPress }) => {
  const [checkin, checkout] = useMemo(() => [photos.filter((photo) => photo.type === 'CHECKIN'), photos.filter((photo) => photo.type === 'CHECKOUT')], [photos]);
  if (!photos.length) return null;
  return <TouchableOpacity activeOpacity={onPress ? 0.82 : 1} disabled={!onPress} onPress={onPress} style={styles.card}><View style={styles.header}><View style={styles.icon}><Camera size={17} color={theme.colors.brand.main} /></View><Text style={styles.title}>État des lieux</Text></View><PhotoGroup title="Prise en charge" photos={checkin} /><PhotoGroup title="Restitution" photos={checkout} /></TouchableOpacity>;
};
const PhotoGroup = ({ title, photos }: { title: string; photos: Photo[] }) => !photos.length ? null : <View style={styles.group}><Text style={styles.groupTitle}>{title} · {photos.length} photo{photos.length > 1 ? 's' : ''}</Text><View style={styles.grid}>{photos.map((photo) => <View style={styles.photo} key={photo.id}><Image source={{ uri: photo.url }} style={styles.image} contentFit="cover" /><Text style={styles.caption}>{labels[photo.categorie || ''] || photo.categorie || 'Photo'}</Text></View>)}</View></View>;
const styles = StyleSheet.create({ card: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 18, padding: 16, gap: 15 }, header: { flexDirection: 'row', gap: 9, alignItems: 'center' }, icon: { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ECFDF5' }, title: { color: '#072A20', fontFamily: theme.typography.fontFamily.displaySemiBold, fontSize: 16 }, group: { gap: 8 }, groupTitle: { color: '#64748B', fontFamily: theme.typography.fontFamily.bold, fontSize: 10, letterSpacing: .7, textTransform: 'uppercase' }, grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, photo: { width: '31%', aspectRatio: .9, overflow: 'hidden', borderRadius: 10, backgroundColor: '#F1F5F9' }, image: { width: '100%', height: '100%' }, caption: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 5, backgroundColor: 'rgba(0,0,0,.52)', color: '#FFFFFF', fontFamily: theme.typography.fontFamily.semiBold, fontSize: 9 } });
