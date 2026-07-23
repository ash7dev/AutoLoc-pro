import 'dart:async';
import 'dart:ui';

import 'package:cached_network_image/cached_network_image.dart';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:intl/intl.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../core/services/session_service.dart' as session_service;
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/presentation/base/effect_handler.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../shared/presentation/widgets/app_bars/tenant_app_bar.dart';
import '../../../../shared/presentation/widgets/auth_required_placeholder.dart';
import '../../../../shared/presentation/widgets/banners/incomplete_profile_banner.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../../user/di/user_injection.dart';
import '../../../vehicle/presentation/widgets/gates/create_profile_gate_view.dart';
import '../providers/profile_providers.dart';
import '../widgets/profile_screen_shimmer.dart';

/// **ProfileScreen**
///
/// Écran des paramètres de profil utilisateur (Tenant / Locataire).
/// Suit le même langage visuel que l'écran détail véhicule :
/// glass sobre (blur 10) partout, une seule zone d'accent lumineux
/// (l'avatar, qui joue le rôle de "hero" de cet écran comme le prix
/// sur la fiche véhicule).
class ProfileScreen extends ConsumerStatefulWidget {
  const ProfileScreen({super.key});

  @override
  ConsumerState<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends ConsumerState<ProfileScreen> with EffectHandler {
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    listenToEffects(profileEffectsProvider);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (ref.read(isAuthenticatedProvider)) {
        ref.read(profileViewModelProvider.notifier).loadProfile();
      }
    });
  }

  Future<void> _showCompleteProfileSheet() async {
    final getProfile = ref.read(getProfileProvider);
    final result = await getProfile();

    result.fold(
      (failure) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('Erreur : ${failure.message}'),
              backgroundColor: DSColors.red500,
            ),
          );
        }
      },
      (user) {
        if (!mounted) return;
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (ctx) {
            return DraggableScrollableSheet(
              initialChildSize: 0.7,
              minChildSize: 0.4,
              maxChildSize: 0.9,
              builder: (ctx, scrollController) {
                return Container(
                  decoration: const BoxDecoration(
                    color: Colors.black,
                    borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
                  ),
                  padding: const EdgeInsets.symmetric(
                    horizontal: DSSpacing.md,
                    vertical: DSSpacing.lg,
                  ),
                  child: SingleChildScrollView(
                    controller: scrollController,
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Center(
                          child: Container(
                            width: 40,
                            height: 4,
                            margin: const EdgeInsets.only(bottom: DSSpacing.md),
                            decoration: BoxDecoration(
                              color: Colors.white24,
                              borderRadius: BorderRadius.circular(2),
                            ),
                          ),
                        ),
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              'Compléter mon profil',
                              style: DSTypography.h5.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w900,
                              ),
                            ),
                            IconButton(
                              icon: const Icon(Icons.close_rounded, color: Colors.white54),
                              onPressed: () => Navigator.pop(ctx),
                            ),
                          ],
                        ),
                        const SizedBox(height: DSSpacing.xs),
                        Text(
                          'Renseignez vos informations pour débloquer la réservation.',
                          style: DSTypography.bodySmall.copyWith(
                            color: DSColors.darkTextSecondary,
                          ),
                        ),
                        const SizedBox(height: DSSpacing.lg),
                        CreateProfileGateView(
                          user: user,
                          onComplete: (otpSent) {
                            Navigator.pop(ctx);
                            ref.read(profileViewModelProvider.notifier).loadProfile();
                          },
                        ),
                      ],
                    ),
                  ),
                );
              },
            );
          },
        );
      },
    );
  }

  int _calculateCompletionPercent(session_service.UserSession? session) {
    if (session == null) return 0;
    int score = 0;
    const int total = 6;

    if (session.prenom != null && session.prenom!.trim().isNotEmpty) score++;
    if (session.nom != null && session.nom!.trim().isNotEmpty) score++;
    if (session.dateNaissance != null) score++;
    if (session.phone != null && session.phone!.trim().isNotEmpty) score++;
    if (session.phoneVerified) score++;
    if (session.kycStatus == session_service.KycStatus.verified) score++;

    return ((score / total) * 100).round();
  }

  List<String> _getMissingFields(session_service.UserSession? session) {
    if (session == null) return [];
    final List<String> missing = [];

    if (session.prenom == null || session.prenom!.trim().isEmpty) missing.add('Prénom');
    if (session.nom == null || session.nom!.trim().isEmpty) missing.add('Nom');
    if (session.dateNaissance == null) missing.add('Date de naissance');
    if (session.phone == null || session.phone!.trim().isEmpty) missing.add('Téléphone');
    if (!session.phoneVerified) missing.add('Téléphone vérifié');
    if (session.kycStatus != session_service.KycStatus.verified) missing.add('Identité vérifiée');

    return missing;
  }

  Future<void> _handleAvatarUpload() async {
    try {
      final XFile? image = await _picker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 500,
        maxHeight: 500,
        imageQuality: 85,
      );

      if (image != null) {
        if (!mounted) return;
        await ref.read(profileViewModelProvider.notifier).uploadAvatar(image.path);
      }
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erreur lors de la sélection de l\'image: $e'),
          backgroundColor: DSColors.red500,
        ),
      );
    }
  }

  Future<void> _handleAvatarDelete() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: DSColors.zinc900,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: const Text('Supprimer la photo ?', style: TextStyle(color: Colors.white)),
        content: const Text(
          'Voulez-vous vraiment supprimer votre photo de profil ?',
          style: TextStyle(color: DSColors.zinc400),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: const Text('Annuler', style: TextStyle(color: DSColors.zinc500)),
          ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(true),
            child: const Text('Supprimer', style: TextStyle(color: DSColors.red500, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );

    if (confirmed == true && mounted) {
      await ref.read(profileViewModelProvider.notifier).deleteAvatar();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAuthenticated = ref.watch(isAuthenticatedProvider);

    if (!isAuthenticated) {
      return Scaffold(
        backgroundColor: Colors.black,
        extendBodyBehindAppBar: true,
        appBar: const TenantAppBar(
          mode: TenantAppBarMode.settings,
          title: 'Mon profil',
        ),
        body: SafeArea(
          child: AuthRequiredPlaceholder(
            icon: Icons.settings_rounded,
            heading: 'Gérez votre profil',
            subtitle: 'Accédez à vos informations et personnalisez votre compte',
            features: const [
              PlaceholderFeature(icon: Icons.person_outline_rounded, label: 'Informations personnelles'),
              PlaceholderFeature(icon: Icons.verified_user_outlined, label: 'Vérification KYC'),
              PlaceholderFeature(icon: Icons.edit_outlined, label: 'Modifier le profil'),
              PlaceholderFeature(icon: Icons.tune_rounded, label: 'Paramètres du compte'),
            ],
          ),
        ),
      );
    }

    final profileState = ref.watch(profileViewModelProvider);
    final session = profileState.dataOrNull;

    Widget bodyWidget;
    if (profileState.isInitial || (profileState.isLoading && session == null)) {
      bodyWidget = const ProfileScreenShimmer();
    } else if (profileState.isFailure && session == null) {
      bodyWidget = Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              profileState.errorMessageOrNull ?? 'Une erreur est survenue',
              style: const TextStyle(color: Colors.white),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => ref.read(profileViewModelProvider.notifier).loadProfile(),
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    } else if (profileState.isEmpty && session == null) {
      bodyWidget = Center(
        child: Text(
          profileState.emptyMessageOrNull ?? 'Profil introuvable',
          style: const TextStyle(color: Colors.white),
        ),
      );
    } else {
      bodyWidget = RefreshIndicator(
        color: kEmerald,
        backgroundColor: DSColors.zinc900,
        onRefresh: () => ref.read(profileViewModelProvider.notifier).loadProfile(),
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          padding: const EdgeInsets.all(DSSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (session != null && !session.profileCompleted)
                Padding(
                  padding: const EdgeInsets.only(bottom: DSSpacing.sm),
                  child: IncompleteProfileBanner(onCompleteProfile: _showCompleteProfileSheet),
                ),

              // 1. Card Avatar & complétude — seule zone "hero" de l'écran
              _buildHeaderCard(session),
              const SizedBox(height: DSSpacing.md),

              // 2. Identité
              _Section(
                title: 'Identité',
                subtitle: 'Ces informations sont visibles par les propriétaires.',
                children: [
                  _EditableRow(
                    label: 'Prénom',
                    value: session?.prenom ?? '',
                    placeholder: 'Votre prénom',
                    icon: Icons.person_outline_rounded,
                    onSave: (val) async {
                      await ref.read(profileViewModelProvider.notifier).updateIdentity(prenom: val);
                    },
                  ),
                  _EditableRow(
                    label: 'Nom',
                    value: session?.nom ?? '',
                    placeholder: 'Votre nom',
                    icon: Icons.person_outline_rounded,
                    onSave: (val) async {
                      await ref.read(profileViewModelProvider.notifier).updateIdentity(nom: val);
                    },
                  ),
                  _EditableRow(
                    label: 'Date de naissance',
                    value: session?.dateNaissance != null
                        ? DateFormat('yyyy-MM-dd').format(session!.dateNaissance!)
                        : '',
                    displayValue: session?.dateNaissance != null
                        ? DateFormat('d MMMM yyyy', 'fr_FR').format(session!.dateNaissance!)
                        : 'Non renseignée',
                    isDate: true,
                    placeholder: 'JJ/MM/AAAA',
                    icon: Icons.calendar_today_rounded,
                    onSave: (val) async {
                      if (val.isNotEmpty) {
                        final parsedDate = DateTime.tryParse(val);
                        if (parsedDate != null) {
                          await ref.read(profileViewModelProvider.notifier).updateIdentity(dateNaissance: parsedDate);
                        }
                      }
                    },
                  ),
                ],
              ),
              const SizedBox(height: DSSpacing.md),

              // 3. Contact
              _Section(
                title: 'Contact',
                subtitle: 'Vos coordonnées de contact.',
                children: [
                  _InfoRow(
                    label: 'Adresse email',
                    value: session?.email ?? '',
                    icon: Icons.mail_outline_rounded,
                    action: _buildSupportButton(),
                  ),
                  _InfoRow(
                    label: 'Numéro de téléphone',
                    value: session?.phone ?? '',
                    icon: Icons.phone_android_rounded,
                    badge: _buildPhoneBadge(session?.phoneVerified ?? false),
                    action: _buildPhoneAction(session),
                  ),
                ],
              ),
              const SizedBox(height: DSSpacing.md),

              // 4. Identité & Sécurité
              _Section(
                title: 'Identité & Sécurité',
                children: [
                  _buildKycRow(session),
                  _InfoRow(
                    label: 'Mot de passe',
                    value: 'Géré via votre fournisseur de connexion',
                    icon: Icons.lock_outline_rounded,
                    badge: _buildPill(
                      label: 'SSO',
                      color: kEmerald,
                      icon: Icons.flash_on_rounded,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: DSSpacing.md),

              // 5. Compte
              _Section(
                title: 'Compte',
                children: [
                  _InfoRow(
                    label: 'Rôle',
                    value: session?.role == session_service.UserRole.owner
                        ? 'Propriétaire'
                        : session?.role == session_service.UserRole.admin
                            ? 'Administrateur'
                            : 'Locataire',
                    icon: Icons.verified_user_outlined,
                    action: _buildRoleSwitchButton(session),
                  ),
                  _InfoRow(
                    label: 'Membre depuis',
                    value: session?.userId != null
                        ? 'Rejoint en ${DateFormat('MMMM yyyy', 'fr_FR').format(DateTime.now())}'
                        : '—',
                    icon: Icons.calendar_month_outlined,
                  ),
                  _buildLogoutRow(),
                ],
              ),
              const SizedBox(height: DSSpacing.lg),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: const TenantAppBar(
        mode: TenantAppBarMode.settings,
        title: 'Mon profil',
      ),
      body: Stack(
        children: [
          // Glow d'ambiance en fond — décor, pas un composant de contenu,
          // donc en dehors du système PremiumGlassCard.
          Positioned(
            top: -60,
            right: -60,
            child: ImageFiltered(
              imageFilter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
              child: Container(
                width: 200,
                height: 200,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: kEmerald.withOpacity(0.08),
                ),
              ),
            ),
          ),

          SafeArea(child: bodyWidget),
        ],
      ),
    );
  }

  // ===========================================================================
  // SUB WIDGET BUILDERS
  // ===========================================================================

  /// Card avatar + complétude. C'est le seul bloc "accent" de l'écran :
  /// glow réservé à l'avatar lui-même (comme le prix sur la fiche véhicule),
  /// le reste de la card reste en glass sobre.
  Widget _buildHeaderCard(session_service.UserSession? session) {
    final completion = _calculateCompletionPercent(session);
    final missing = _getMissingFields(session);
    final String initials = session?.initials ?? 'U';

    return PremiumGlassCard(
      radius: PremiumRadius.hero,
      blur: 10,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        children: [
          Row(
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  Container(
                    width: 72,
                    height: 72,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(20),
                      gradient: const LinearGradient(
                        colors: [kEmerald, kEmeraldDeep],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: kEmerald.withOpacity(0.35),
                          blurRadius: 20,
                          spreadRadius: -2,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    clipBehavior: Clip.antiAlias,
                    child: session?.avatarUrl != null
                        ? CachedNetworkImage(
                            imageUrl: session!.avatarUrl!,
                            fit: BoxFit.cover,
                            placeholder: (context, url) => const Center(
                              child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                            ),
                            errorWidget: (context, url, err) => Center(
                              child: Text(
                                initials,
                                style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w900),
                              ),
                            ),
                          )
                        : Center(
                            child: Text(
                              initials,
                              style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w900),
                            ),
                          ),
                  ),
                  Positioned(
                    bottom: -6,
                    right: -6,
                    child: GestureDetector(
                      onTap: _handleAvatarUpload,
                      child: Container(
                        padding: const EdgeInsets.all(6),
                        decoration: BoxDecoration(
                          color: Colors.white,
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 5, offset: const Offset(0, 2)),
                          ],
                        ),
                        child: const Icon(Icons.camera_alt_rounded, size: 12, color: Colors.black54),
                      ),
                    ),
                  ),
                  if (session?.avatarUrl != null)
                    Positioned(
                      bottom: -6,
                      left: -6,
                      child: GestureDetector(
                        onTap: _handleAvatarDelete,
                        child: Container(
                          padding: const EdgeInsets.all(6),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            shape: BoxShape.circle,
                            border: Border.all(color: Colors.red.shade100, width: 1),
                            boxShadow: [
                              BoxShadow(color: Colors.black.withOpacity(0.3), blurRadius: 5, offset: const Offset(0, 2)),
                            ],
                          ),
                          child: const Icon(Icons.delete_outline_rounded, size: 12, color: DSColors.red500),
                        ),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: DSSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      session?.fullName ?? 'Votre Profil',
                      style: DSTypography.bodyLarge.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -0.2,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 3),
                    Text(
                      session?.email ?? '',
                      style: DSTypography.labelSmall.copyWith(
                        color: DSColors.darkTextSecondary,
                        fontWeight: FontWeight.w500,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: DSSpacing.md),

          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Text(
                    'PROFIL COMPLÉTÉ',
                    style: DSTypography.labelSmall.copyWith(
                      color: DSColors.darkTextTertiary,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  Text(
                    '$completion%',
                    style: DSTypography.bodySmall.copyWith(
                      color: completion == 100
                          ? kEmerald
                          : completion >= 70
                              ? Colors.amber
                              : DSColors.darkTextTertiary,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 6),
              ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: Container(
                  height: 6,
                  color: Colors.white.withOpacity(0.08),
                  child: FractionallySizedBox(
                    widthFactor: completion / 100,
                    alignment: Alignment.centerLeft,
                    child: Container(
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: completion == 100
                              ? [kEmerald, kEmeraldDeep]
                              : completion >= 70
                                  ? [Colors.amber.shade300, Colors.amber]
                                  : [Colors.grey.shade400, Colors.grey],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
              if (missing.isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(
                  'Champs manquants : ${missing.take(3).join(", ")}${missing.length > 3 ? " +${missing.length - 3}" : ""}',
                  style: DSTypography.labelSmall.copyWith(
                    color: Colors.white.withOpacity(0.35),
                    fontStyle: FontStyle.italic,
                  ),
                ),
              ],
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSupportButton() {
    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.white.withOpacity(0.1)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.mail_outline_rounded, size: 12, color: Colors.white70),
            const SizedBox(width: 4),
            Text(
              'Support',
              style: DSTypography.bodySmall.copyWith(color: Colors.white70, fontWeight: FontWeight.w700),
            ),
          ],
        ),
      ),
    );
  }

  /// Pill générique — remplace les Container ad hoc dispersés (SSO,
  /// vérifié, non vérifié...) par une seule implémentation cohérente.
  Widget _buildPill({required String label, required Color color, IconData? icon}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withOpacity(0.14),
        borderRadius: BorderRadius.circular(100),
        border: Border.all(color: color.withOpacity(0.3), width: 1),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          if (icon != null) ...[
            Icon(icon, size: 10, color: color),
            const SizedBox(width: 4),
          ],
          Text(
            label,
            style: DSTypography.labelSmall.copyWith(color: color, fontWeight: FontWeight.w800),
          ),
        ],
      ),
    );
  }

  Widget _buildPhoneBadge(bool verified) {
    return verified
        ? _buildPill(label: 'Vérifié', color: kEmerald)
        : _buildPill(label: 'Non vérifié', color: Colors.amber);
  }

  Widget _buildPhoneAction(session_service.UserSession? session) {
    final verified = session?.phoneVerified ?? false;
    if (verified) return const SizedBox.shrink();

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.amber.withOpacity(0.14),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: Colors.amber.withOpacity(0.3)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              'Vérifier',
              style: DSTypography.bodySmall.copyWith(color: Colors.amber.shade200, fontWeight: FontWeight.w800),
            ),
            const Icon(Icons.chevron_right_rounded, size: 14, color: Colors.amber),
          ],
        ),
      ),
    );
  }

  Widget _buildKycRow(session_service.UserSession? session) {
    final status = session?.kycStatus ?? session_service.KycStatus.notVerified;

    if (status == session_service.KycStatus.verified) {
      return _InfoRow(
        label: 'Vérification d\'identité',
        value: 'Identité confirmée — compte certifié',
        icon: Icons.verified_rounded,
        badge: _buildPill(label: 'Vérifié', color: kEmerald),
      );
    }

    final isPending = status == session_service.KycStatus.pending;
    final Color statusColor = isPending ? Colors.amber : Colors.white54;

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          EmeraldIconChip(
            icon: isPending ? Icons.pending_actions_rounded : Icons.shield_outlined,
            size: 34,
            iconSize: 17,
            glow: false,
          ),
          const SizedBox(width: DSSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      'Vérification d\'identité',
                      style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                    ),
                    _buildPill(label: isPending ? 'En attente' : 'Non vérifié', color: statusColor),
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  isPending
                      ? 'Votre dossier est en cours d\'examen.'
                      : 'Vérifiez votre identité pour débloquer toutes les fonctionnalités.',
                  style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextSecondary, height: 1.3),
                ),
              ],
            ),
          ),
          const SizedBox(width: DSSpacing.sm),
          GestureDetector(
            onTap: () => context.push(Routes.kycStatus),
            child: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: (isPending ? Colors.amber : kEmerald).withOpacity(0.15),
                shape: BoxShape.circle,
              ),
              child: Icon(
                Icons.chevron_right_rounded,
                size: 18,
                color: isPending ? Colors.amber.shade200 : kEmerald,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRoleSwitchButton(session_service.UserSession? session) {
    if (session == null) return const SizedBox.shrink();

    final isOwner = session.role == session_service.UserRole.owner;
    final targetRole = isOwner ? session_service.UserRole.tenant : session_service.UserRole.owner;
    final Color accent = isOwner ? Colors.white70 : kEmerald;

    return GestureDetector(
      onTap: () {
        HapticFeedback.selectionClick();
        ref.read(profileViewModelProvider.notifier).switchWorkspace(targetRole);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
        decoration: BoxDecoration(
          color: accent.withOpacity(0.12),
          borderRadius: BorderRadius.circular(10),
          border: Border.all(color: accent.withOpacity(0.25)),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              isOwner ? Icons.person_outline_rounded : Icons.business_center_outlined,
              size: 12,
              color: accent,
            ),
            const SizedBox(width: 4),
            Text(
              isOwner ? 'Mode locataire' : 'Propriétaire',
              style: DSTypography.bodySmall.copyWith(color: accent, fontWeight: FontWeight.w800),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildLogoutRow() {
    return GestureDetector(
      onTap: () async {
        final confirmed = await showDialog<bool>(
          context: context,
          builder: (context) => AlertDialog(
            backgroundColor: DSColors.zinc900,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: const Text('Se déconnecter ?', style: TextStyle(color: Colors.white)),
            content: const Text(
              'Voulez-vous vraiment vous déconnecter de votre compte ?',
              style: TextStyle(color: DSColors.zinc400),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.of(context).pop(false),
                child: const Text('Annuler', style: TextStyle(color: DSColors.zinc500)),
              ),
              TextButton(
                onPressed: () => Navigator.of(context).pop(true),
                child: const Text('Déconnecter', style: TextStyle(color: DSColors.red500, fontWeight: FontWeight.bold)),
              ),
            ],
          ),
        );

        if (confirmed == true && mounted) {
          final sessionService = ref.read(sessionServiceProvider);
          await sessionService.endSession();
          if (mounted) {
            context.go(Routes.login);
          }
        }
      },
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: DSColors.red500.withOpacity(0.12),
                borderRadius: BorderRadius.circular(PremiumRadius.icon),
                border: Border.all(color: DSColors.red500.withOpacity(0.25)),
              ),
              child: const Icon(Icons.logout_rounded, color: DSColors.red500, size: 17),
            ),
            const SizedBox(width: DSSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Déconnexion',
                    style: DSTypography.bodyMedium.copyWith(color: DSColors.red500, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    'Se déconnecter de votre compte',
                    style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right_rounded, color: DSColors.darkTextTertiary),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// SUB-COMPONENT: _Section
// Même structure que VehicleDetailSpecs : eyebrow + séparateur dégradé,
// puis PremiumGlassCard sobre (blur 10) contenant les rows.
// =============================================================================

class _Section extends StatelessWidget {
  const _Section({
    required this.title,
    this.subtitle,
    required this.children,
  });

  final String title;
  final String? subtitle;
  final List<Widget> children;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 8),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title.toUpperCase(),
                      style: DSTypography.labelSmall.copyWith(
                        color: DSColors.darkTextTertiary,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 1.1,
                      ),
                    ),
                    if (subtitle != null) ...[
                      const SizedBox(height: 3),
                      Text(
                        subtitle!,
                        style: DSTypography.labelSmall.copyWith(
                          color: Colors.white.withOpacity(0.35),
                          height: 1.3,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
            ],
          ),
        ),
        PremiumGlassCard(
          radius: PremiumRadius.card,
          blur: 10,
          padding: EdgeInsets.zero,
          child: ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: children.length,
            separatorBuilder: (context, index) => Divider(
              height: 1,
              color: Colors.white.withOpacity(0.06),
            ),
            itemBuilder: (context, index) => children[index],
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// SUB-COMPONENT: _InfoRow (non éditable)
// Icône via EmeraldIconChip sobre — cohérent avec _SpecRow de
// VehicleDetailSpecs.
// =============================================================================

class _InfoRow extends StatelessWidget {
  const _InfoRow({
    required this.label,
    required this.value,
    required this.icon,
    this.badge,
    this.action,
  });

  final String label;
  final String value;
  final IconData icon;
  final Widget? badge;
  final Widget? action;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      child: Row(
        children: [
          EmeraldIconChip(icon: icon, size: 34, iconSize: 17, glow: false),
          const SizedBox(width: DSSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Flexible(
                      child: Text(
                        label,
                        style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    if (badge != null) ...[
                      const SizedBox(width: 8),
                      badge!,
                    ],
                  ],
                ),
                const SizedBox(height: 2),
                Text(
                  value,
                  style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ),
          ),
          if (action != null) ...[
            const SizedBox(width: 8),
            action!,
          ],
        ],
      ),
    );
  }
}

// =============================================================================
// SUB-COMPONENT: _EditableRow (édition inline)
// =============================================================================

class _EditableRow extends StatefulWidget {
  const _EditableRow({
    required this.label,
    required this.value,
    required this.placeholder,
    required this.icon,
    required this.onSave,
    this.displayValue,
    this.isDate = false,
  });

  final String label;
  final String value;
  final String placeholder;
  final IconData icon;
  final Future<void> Function(String) onSave;
  final String? displayValue;
  final bool isDate;

  @override
  State<_EditableRow> createState() => _EditableRowState();
}

class _EditableRowState extends State<_EditableRow> {
  bool _isEditing = false;
  bool _isSaving = false;
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.value);
  }

  @override
  void didUpdateWidget(covariant _EditableRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.value != oldWidget.value) {
      _controller.text = widget.value;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Future<void> _handleSave() async {
    final value = _controller.text.trim();
    if (value == widget.value) {
      setState(() => _isEditing = false);
      return;
    }

    setState(() => _isSaving = true);
    try {
      await widget.onSave(value);
      setState(() {
        _isEditing = false;
        _isSaving = false;
      });
    } catch (_) {
      setState(() => _isSaving = false);
    }
  }

  Future<void> _selectDate(BuildContext context) async {
    final DateTime? initialDate =
        widget.value.isNotEmpty ? DateTime.tryParse(widget.value) ?? DateTime.now() : DateTime.now();

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: initialDate!,
      firstDate: DateTime(1900),
      lastDate: DateTime.now(),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: kEmerald,
              onPrimary: Colors.black,
              surface: DSColors.zinc900,
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: Colors.black,
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      final formatted = DateFormat('yyyy-MM-dd').format(picked);
      _controller.text = formatted;
      await _handleSave();
    }
  }

  @override
  Widget build(BuildContext context) {
    final displayVal = widget.displayValue ?? (widget.value.isNotEmpty ? widget.value : 'Non renseigné');

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          EmeraldIconChip(icon: widget.icon, size: 34, iconSize: 17, glow: false),
          const SizedBox(width: DSSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.label,
                  style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                ),
                const SizedBox(height: 4),
                if (_isEditing && !widget.isDate)
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _controller,
                          autofocus: true,
                          style: DSTypography.bodyMedium.copyWith(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: widget.placeholder,
                            hintStyle: const TextStyle(color: Colors.white24),
                            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                            enabledBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: BorderSide(color: Colors.white.withOpacity(0.12)),
                            ),
                            focusedBorder: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(12),
                              borderSide: const BorderSide(color: kEmerald),
                            ),
                            filled: true,
                            fillColor: Colors.white.withOpacity(0.03),
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      GestureDetector(
                        onTap: _isSaving ? null : _handleSave,
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: kEmerald,
                            borderRadius: BorderRadius.circular(12),
                            boxShadow: [
                              BoxShadow(color: kEmerald.withOpacity(0.3), blurRadius: 10, offset: const Offset(0, 4)),
                            ],
                          ),
                          child: _isSaving
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black),
                                )
                              : const Icon(Icons.check_rounded, size: 14, color: Colors.black),
                        ),
                      ),
                      const SizedBox(width: 6),
                      GestureDetector(
                        onTap: () {
                          _controller.text = widget.value;
                          setState(() => _isEditing = false);
                        },
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.06),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: const Icon(Icons.close_rounded, size: 14, color: Colors.white70),
                        ),
                      ),
                    ],
                  )
                else
                  Text(
                    displayVal,
                    style: DSTypography.bodySmall.copyWith(
                      color: widget.value.isNotEmpty ? DSColors.darkTextSecondary : DSColors.darkTextTertiary,
                      fontStyle: widget.value.isEmpty ? FontStyle.italic : FontStyle.normal,
                    ),
                  ),
              ],
            ),
          ),
          if (!_isEditing)
            GestureDetector(
              onTap: () {
                HapticFeedback.selectionClick();
                if (widget.isDate) {
                  _selectDate(context);
                } else {
                  setState(() => _isEditing = true);
                }
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.06),
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.white.withOpacity(0.08)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Icon(Icons.edit_rounded, size: 12, color: Colors.white54),
                    const SizedBox(width: 4),
                    Text(
                      'Modifier',
                      style: DSTypography.labelSmall.copyWith(color: Colors.white54, fontWeight: FontWeight.w700),
                    ),
                  ],
                ),
              ),
            ),
        ],
      ),
    );
  }
}