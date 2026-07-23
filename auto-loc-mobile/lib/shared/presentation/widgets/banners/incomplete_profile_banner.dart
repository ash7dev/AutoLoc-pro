import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';

/// **IncompleteProfileBanner**
///
/// Bannière réutilisable affichée aux utilisateurs dont le profil est incomplet.
/// Offre un message contextuel et un bouton CTA pour ouvrir le gate de complétion
/// de profil.
///
/// Usage :
/// ```dart
/// IncompleteProfileBanner(
///   onCompleteProfile: () => _showGateBottomSheet(),
/// )
/// ```
///
/// Peut être placé sur n'importe quelle page : Mes Réservations, Profil,
/// Accueil, etc.
class IncompleteProfileBanner extends StatefulWidget {
  const IncompleteProfileBanner({
    super.key,
    required this.onCompleteProfile,
    this.title = 'Profil incomplet',
    this.message =
        'Complétez votre profil pour accéder à toutes les fonctionnalités et pouvoir réserver un véhicule.',
    this.ctaLabel = 'Compléter mon profil',
    this.icon = Icons.person_outline_rounded,
    this.dismissible = true,
    this.compact = false,
  });

  /// Callback déclenché quand l'utilisateur appuie sur le bouton CTA.
  /// Typiquement : ouvrir le ReservationGateBottomSheet ou naviguer vers le profil.
  final VoidCallback onCompleteProfile;

  /// Titre de la bannière
  final String title;

  /// Message explicatif
  final String message;

  /// Libellé du bouton d'action
  final String ctaLabel;

  /// Icône affichée dans le cercle
  final IconData icon;

  /// Si `true`, la bannière peut être fermée (cachée pour la session courante)
  final bool dismissible;

  /// Si `true`, affiche une version compacte (sans icône circulaire)
  final bool compact;

  @override
  State<IncompleteProfileBanner> createState() =>
      _IncompleteProfileBannerState();
}

class _IncompleteProfileBannerState extends State<IncompleteProfileBanner> {
  bool _dismissed = false;

  @override
  Widget build(BuildContext context) {
    if (_dismissed) return const SizedBox.shrink();

    return widget.compact ? _buildCompact() : _buildFull();
  }

  /// Version compacte — bandeau horizontal simple
  Widget _buildCompact() {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: DSSpacing.md,
        vertical: DSSpacing.sm,
      ),
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            DSColors.amber500.withOpacity(0.12),
            DSColors.amber600.withOpacity(0.06),
          ],
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: DSColors.amber500.withOpacity(0.25),
          width: 1,
        ),
      ),
      child: Row(
        children: [
          Container(
            width: 36,
            height: 36,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: DSColors.amber500.withOpacity(0.15),
            ),
            child: Icon(
              widget.icon,
              color: DSColors.amber400,
              size: 18,
            ),
          ),
          const SizedBox(width: DSSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  widget.title,
                  style: DSTypography.labelMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  widget.message,
                  style: DSTypography.bodySmall.copyWith(
                    color: DSColors.darkTextSecondary,
                    height: 1.3,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          const SizedBox(width: DSSpacing.sm),
          _buildCompactCta(),
        ],
      ),
    );
  }

  Widget _buildCompactCta() {
    return Material(
      color: Colors.transparent,
      borderRadius: BorderRadius.circular(10),
      child: InkWell(
        onTap: widget.onCompleteProfile,
        borderRadius: BorderRadius.circular(10),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            gradient: const LinearGradient(
              colors: [DSColors.amber500, DSColors.amber600],
            ),
            borderRadius: BorderRadius.circular(10),
          ),
          child: const Text(
            'Compléter',
            style: TextStyle(
              color: Colors.white,
              fontSize: 12,
              fontWeight: FontWeight.w700,
            ),
          ),
        ),
      ),
    );
  }

  /// Version complète — carte glassmorphism
  Widget _buildFull() {
    return Container(
      margin: const EdgeInsets.symmetric(
        horizontal: DSSpacing.md,
        vertical: DSSpacing.sm,
      ),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(24),
        border: Border.all(
          color: DSColors.amber500.withOpacity(0.2),
          width: 1.2,
        ),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(24),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Colors.white.withOpacity(0.08),
                  Colors.white.withOpacity(0.03),
                ],
              ),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Padding(
                  padding: const EdgeInsets.all(DSSpacing.lg),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Header avec icône + titre + dismiss
                      Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Icône circulaire
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [
                                  DSColors.amber500.withOpacity(0.2),
                                  DSColors.amber600.withOpacity(0.1),
                                ],
                              ),
                            ),
                            child: Icon(
                              widget.icon,
                              color: DSColors.amber400,
                              size: 24,
                            ),
                          ),
                          const SizedBox(width: DSSpacing.md),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Badge
                                Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 8,
                                    vertical: 3,
                                  ),
                                  decoration: BoxDecoration(
                                    color: DSColors.amber500.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(100),
                                    border: Border.all(
                                      color:
                                          DSColors.amber500.withOpacity(0.25),
                                    ),
                                  ),
                                  child: Text(
                                    'Action requise',
                                    style: TextStyle(
                                      fontSize: 10,
                                      fontWeight: FontWeight.w700,
                                      color: DSColors.amber400,
                                      letterSpacing: 0.5,
                                    ),
                                  ),
                                ),
                                const SizedBox(height: DSSpacing.xs),
                                Text(
                                  widget.title,
                                  style: DSTypography.h5.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          if (widget.dismissible)
                            GestureDetector(
                              onTap: () => setState(() => _dismissed = true),
                              child: Container(
                                width: 32,
                                height: 32,
                                decoration: BoxDecoration(
                                  shape: BoxShape.circle,
                                  color: Colors.white.withOpacity(0.06),
                                ),
                                child: const Icon(
                                  Icons.close_rounded,
                                  color: DSColors.darkTextTertiary,
                                  size: 16,
                                ),
                              ),
                            ),
                        ],
                      ),

                      const SizedBox(height: DSSpacing.md),

                      // Message
                      Text(
                        widget.message,
                        style: DSTypography.bodyMedium.copyWith(
                          color: DSColors.darkTextSecondary,
                          height: 1.5,
                        ),
                      ),

                      const SizedBox(height: DSSpacing.md),

                      // Indicateurs rapides — ce qu'il faut compléter
                      Wrap(
                        spacing: DSSpacing.xs,
                        runSpacing: DSSpacing.xs,
                        children: [
                          _buildChip(Icons.person_rounded, 'Identité'),
                          _buildChip(Icons.phone_android_rounded, 'Téléphone'),
                          _buildChip(Icons.calendar_today_rounded, 'Naissance'),
                        ],
                      ),

                      const SizedBox(height: DSSpacing.lg),

                      // CTA Button
                      PrimaryButton(
                        label: widget.ctaLabel,
                        fullWidth: true,
                        onPressed: widget.onCompleteProfile,
                        icon: Icons.arrow_forward_rounded,
                        iconPosition: IconPosition.right,
                      ),
                    ],
                  ),
                ),
          ),
        ),
      ),
    );
  }

  Widget _buildChip(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: Colors.white.withOpacity(0.08),
        ),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 14, color: DSColors.darkTextTertiary),
          const SizedBox(width: 5),
          Text(
            label,
            style: DSTypography.bodySmall.copyWith(
              color: DSColors.darkTextSecondary,
              fontWeight: FontWeight.w600,
              fontSize: 11,
            ),
          ),
        ],
      ),
    );
  }
}
