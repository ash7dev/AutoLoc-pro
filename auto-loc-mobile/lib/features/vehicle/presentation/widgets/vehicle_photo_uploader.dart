import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/services/image_picker_service.dart';
import '../../domain/entities/vehicle.dart';

/// **VehiclePhotoUploader**
/// Grille de photos véhicule. Aligné sur premium_glass : glass sobre
/// (blur 10) pour la tuile d'ajout, EmeraldIconChip pour l'icône,
/// kEmerald/kEmeraldDeep partout. Les photos elles-mêmes restent en
/// image plate (le blur n'a pas de sens sur un thumbnail rempli).
class VehiclePhotoUploader extends StatelessWidget {
  final List<PhotoVehicule> photos;
  final bool isUploading;
  final double uploadProgress;
  final ValueChanged<String> onUploadPhoto;
  final ValueChanged<String> onDeletePhoto;
  final ValueChanged<String> onSetMainPhoto;

  const VehiclePhotoUploader({
    super.key,
    required this.photos,
    required this.isUploading,
    required this.uploadProgress,
    required this.onUploadPhoto,
    required this.onDeletePhoto,
    required this.onSetMainPhoto,
  });

  Future<void> _pickImage(BuildContext context) async {
    try {
      // Utiliser le nouveau service avec galerie intégrée (pas de sortie de l'app!)
      final paths = await ImagePickerService.showImageSourcePicker(
        context,
        maxAssets: 1, // Une seule photo à la fois
      );

      if (paths != null && paths.isNotEmpty) {
        onUploadPhoto(paths.first);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la sélection de l\'image: $e'),
            backgroundColor: DSColors.red500,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    const maxPhotos = 8;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 1.33,
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
          ),
          itemCount: photos.length + (photos.length < maxPhotos ? 1 : 0),
          itemBuilder: (context, index) {
            if (index == photos.length) {
              return InkWell(
                onTap: isUploading ? null : () => _pickImage(context),
                borderRadius: BorderRadius.circular(PremiumRadius.card),
                child: PremiumGlassCard(
                  radius: PremiumRadius.card,
                  blur: 10,
                  padding: EdgeInsets.zero,
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      EmeraldIconChip(icon: Icons.add_photo_alternate_outlined, size: 40, iconSize: 20, glow: false),
                      const SizedBox(height: DSSpacing.xs),
                      Text(
                        'Ajouter une photo',
                        style: DSTypography.labelSmall.copyWith(
                          color: DSColors.darkTextSecondary,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        '${photos.length}/$maxPhotos',
                        style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary),
                      ),
                    ],
                  ),
                ),
              );
            }

            final photo = photos[index];
            final isMain = photo.estPrincipale;

            return Stack(
              children: [
                Positioned.fill(
                  child: Container(
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(PremiumRadius.card),
                      border: Border.all(
                        color: isMain ? kEmerald : Colors.transparent,
                        width: isMain ? 2 : 0,
                      ),
                      boxShadow: isMain
                          ? [BoxShadow(color: kEmerald.withOpacity(0.25), blurRadius: 14, offset: const Offset(0, 4))]
                          : null,
                    ),
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(PremiumRadius.card - 2),
                      child: CachedNetworkImage(
                        imageUrl: photo.url,
                        fit: BoxFit.cover,
                        placeholder: (context, url) => Container(
                          color: Colors.white.withOpacity(0.05),
                          child: const Center(
                            child: SizedBox(
                              width: 22,
                              height: 22,
                              child: CircularProgressIndicator(strokeWidth: 2, color: kEmerald),
                            ),
                          ),
                        ),
                        errorWidget: (context, url, error) => Container(
                          color: Colors.white.withOpacity(0.05),
                          child: const Icon(Icons.broken_image_outlined, color: DSColors.red500),
                        ),
                      ),
                    ),
                  ),
                ),

                // Badge photo principale
                if (isMain)
                  Positioned(
                    top: 8,
                    left: 8,
                    child: Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [kEmerald, kEmeraldDeep]),
                        borderRadius: BorderRadius.circular(8),
                        boxShadow: [BoxShadow(color: kEmerald.withOpacity(0.4), blurRadius: 8, offset: const Offset(0, 2))],
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(Icons.star_rounded, size: 11, color: Colors.black),
                          SizedBox(width: 4),
                          Text(
                            'PRINCIPALE',
                            style: TextStyle(fontSize: 9, fontWeight: FontWeight.w900, color: Colors.black, letterSpacing: 0.4),
                          ),
                        ],
                      ),
                    ),
                  ),

                // Définir comme principale
                if (!isMain)
                  Positioned(
                    bottom: 8,
                    left: 8,
                    child: GestureDetector(
                      onTap: () => onSetMainPhoto(photo.id),
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
                        decoration: BoxDecoration(
                          color: Colors.black.withOpacity(0.55),
                          borderRadius: BorderRadius.circular(8),
                          border: Border.all(color: Colors.white.withOpacity(0.15)),
                        ),
                        child: const Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(Icons.star_outline_rounded, size: 13, color: Colors.white),
                            SizedBox(width: 4),
                            Text('Principale', style: TextStyle(fontSize: 10, fontWeight: FontWeight.w700, color: Colors.white)),
                          ],
                        ),
                      ),
                    ),
                  ),

                // Supprimer
                Positioned(
                  top: 8,
                  right: 8,
                  child: GestureDetector(
                    onTap: () => onDeletePhoto(photo.id),
                    child: Container(
                      width: 26,
                      height: 26,
                      decoration: BoxDecoration(
                        color: DSColors.red500.withOpacity(0.92),
                        shape: BoxShape.circle,
                        boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 4, offset: const Offset(0, 2))],
                      ),
                      child: const Icon(Icons.close_rounded, size: 15, color: Colors.white),
                    ),
                  ),
                ),
              ],
            );
          },
        ),
        if (isUploading) ...[
          const SizedBox(height: DSSpacing.md),
          PremiumGlassCard(
            radius: PremiumRadius.chip,
            blur: 10,
            accent: true,
            padding: const EdgeInsets.all(DSSpacing.sm + 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Téléversement en cours...',
                      style: DSTypography.labelSmall.copyWith(color: kEmerald, fontWeight: FontWeight.w800),
                    ),
                    Text(
                      '${(uploadProgress * 100).toStringAsFixed(0)}%',
                      style: DSTypography.labelSmall.copyWith(color: kEmerald, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                ClipRRect(
                  borderRadius: BorderRadius.circular(3),
                  child: LinearProgressIndicator(
                    value: uploadProgress,
                    backgroundColor: Colors.white.withOpacity(0.08),
                    valueColor: const AlwaysStoppedAnimation<Color>(kEmerald),
                    minHeight: 6,
                  ),
                ),
              ],
            ),
          ),
        ],
      ],
    );
  }
}