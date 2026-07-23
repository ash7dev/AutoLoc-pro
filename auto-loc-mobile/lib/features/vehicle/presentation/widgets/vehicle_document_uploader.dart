import 'package:flutter/material.dart';

import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/services/image_picker_service.dart';

/// **VehicleDocumentUploader**
/// Zone d'upload de document unique (carte grise, assurance...).
/// Aligné sur premium_glass : glass sobre (blur 10), accent activé
/// une fois le document téléversé — cohérent avec les _DocumentSlot
/// des gates KYC.
class VehicleDocumentUploader extends StatelessWidget {
  final String label;
  final String description;
  final String? docUrl;
  final bool isUploading;
  final double uploadProgress;
  final ValueChanged<String> onUpload;
  final VoidCallback onRemove;

  const VehicleDocumentUploader({
    super.key,
    required this.label,
    required this.description,
    required this.docUrl,
    required this.isUploading,
    required this.uploadProgress,
    required this.onUpload,
    required this.onRemove,
  });

  Future<void> _pickDocument(BuildContext context) async {
    try {
      // Utiliser le nouveau service avec galerie intégrée (pas de sortie de l'app!)
      final paths = await ImagePickerService.showImageSourcePicker(
        context,
        maxAssets: 1,
      );

      if (paths != null && paths.isNotEmpty) {
        onUpload(paths.first);
      }
    } catch (e) {
      if (context.mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur lors de la sélection du document: $e'),
            backgroundColor: DSColors.red500,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final isUploaded = docUrl != null && docUrl!.isNotEmpty;

    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      accent: isUploaded,
      borderWidth: isUploaded ? 1.4 : 1,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              EmeraldIconChip(
                icon: isUploaded ? Icons.file_present_rounded : Icons.file_copy_outlined,
                size: 40,
                iconSize: 19,
                glow: false,
              ),
              const SizedBox(width: DSSpacing.sm + 4),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      label,
                      style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      description,
                      style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary),
                    ),
                  ],
                ),
              ),
              if (isUploaded) const Icon(Icons.check_circle_rounded, color: kEmerald, size: 20),
            ],
          ),
          const SizedBox(height: DSSpacing.md),
          if (isUploading) ...[
            Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Téléversement en cours...',
                      style: DSTypography.labelSmall.copyWith(color: kEmerald, fontWeight: FontWeight.w700),
                    ),
                    Text(
                      '${(uploadProgress * 100).toStringAsFixed(0)}%',
                      style: DSTypography.labelSmall.copyWith(color: kEmerald, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                ClipRRect(
                  borderRadius: BorderRadius.circular(2),
                  child: LinearProgressIndicator(
                    value: uploadProgress,
                    backgroundColor: Colors.white.withOpacity(0.08),
                    valueColor: const AlwaysStoppedAnimation<Color>(kEmerald),
                    minHeight: 4,
                  ),
                ),
              ],
            ),
          ] else if (isUploaded) ...[
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Fichier enregistré avec succès',
                    style: DSTypography.bodySmall.copyWith(
                      color: DSColors.darkTextSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
                TextButton(
                  onPressed: onRemove,
                  style: TextButton.styleFrom(
                    foregroundColor: DSColors.red500,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                  ),
                  child: const Text('Supprimer', style: TextStyle(fontSize: 12, fontWeight: FontWeight.w800)),
                ),
              ],
            ),
          ] else ...[
            InkWell(
              onTap: () => _pickDocument(context),
              borderRadius: BorderRadius.circular(PremiumRadius.chip),
              child: Container(
                width: double.infinity,
                height: 48,
                decoration: BoxDecoration(
                  border: Border.all(color: kEmerald.withOpacity(0.5), width: 1.4),
                  borderRadius: BorderRadius.circular(PremiumRadius.chip),
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.upload_file_outlined, color: kEmerald, size: 18),
                    const SizedBox(width: 8),
                    Text(
                      'Téléverser le document',
                      style: DSTypography.bodySmall.copyWith(color: kEmerald, fontWeight: FontWeight.w800),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}