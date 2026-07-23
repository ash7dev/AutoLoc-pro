import 'dart:ui';

import 'package:flutter/material.dart';

import '../../../../../design_system/tokens/ds_typography.dart';

// Couleurs
const kEmerald = Color(0xFF34D399);

/// Owner Quick Actions
///
/// Widget purement présentationnel affichant les actions rapides du propriétaire.
///
/// **Animations** : chaque item apparaît avec un staggered slide-in + fade-in
/// en cascade de haut en bas, créant un effet de "révélation" fluide.
class OwnerQuickActions extends StatefulWidget {
  final VoidCallback? onPublishVehicle;
  final VoidCallback? onViewReservations;
  final VoidCallback? onViewWallet;
  final VoidCallback? onViewProfile;
  final VoidCallback? onViewVehicles;

  const OwnerQuickActions({
    super.key,
    this.onPublishVehicle,
    this.onViewReservations,
    this.onViewWallet,
    this.onViewProfile,
    this.onViewVehicles,
  });

  @override
  State<OwnerQuickActions> createState() => _OwnerQuickActionsState();
}

class _OwnerQuickActionsState extends State<OwnerQuickActions>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;

  // 5 items + titre = 6 éléments à animer
  static const _staggerSlice = 0.12;
  static const _itemDuration = 0.45;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  Widget _staggeredChild(int index, Widget child) {
    final start = (index * _staggerSlice).clamp(0.0, 1.0);
    final end = (start + _itemDuration).clamp(0.0, 1.0);
    final curve = Interval(start, end, curve: Curves.easeOutCubic);

    final opacity = CurvedAnimation(parent: _controller, curve: curve);
    final offset = Tween<Offset>(
      begin: const Offset(0.06, 0),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: curve));

    return FadeTransition(
      opacity: opacity,
      child: SlideTransition(position: offset, child: child),
    );
  }

  @override
  Widget build(BuildContext context) {
    final items = <_QuickActionData>[
      _QuickActionData(
        icon: Icons.add_circle_outline_rounded,
        title: 'Publier un véhicule',
        subtitle: 'Ajoutez un nouveau véhicule à la plateforme',
        onTap: widget.onPublishVehicle,
        isPrimary: true,
      ),
      _QuickActionData(
        icon: Icons.event_note_rounded,
        title: 'Voir mes réservations',
        subtitle: 'Consultez toutes vos réservations',
        onTap: widget.onViewReservations,
      ),
      _QuickActionData(
        icon: Icons.account_balance_wallet_rounded,
        title: 'Mon Wallet',
        subtitle: 'Solde, retraits, historique des versements',
        onTap: widget.onViewWallet,
      ),
      _QuickActionData(
        icon: Icons.directions_car_rounded,
        title: 'Mes véhicules',
        subtitle: 'Gérez votre flotte de véhicules',
        onTap: widget.onViewVehicles,
      ),
      _QuickActionData(
        icon: Icons.person_outline_rounded,
        title: 'Profil',
        subtitle: 'Paramètres et informations personnelles',
        onTap: widget.onViewProfile,
      ),
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Titre (index 0)
          _staggeredChild(
            0,
            Text(
              'Actions rapides',
              style: DSTypography.h4.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(height: 16),

          // Items (index 1..5)
          for (int i = 0; i < items.length; i++) ...[
            _staggeredChild(
              i + 1,
              _QuickActionItem(
                icon: items[i].icon,
                title: items[i].title,
                subtitle: items[i].subtitle,
                onTap: items[i].onTap,
                isPrimary: items[i].isPrimary,
              ),
            ),
            if (i < items.length - 1) const SizedBox(height: 12),
          ],
        ],
      ),
    );
  }
}

/// Data holder pour les action items (évite de répéter les constructeurs)
class _QuickActionData {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool isPrimary;

  const _QuickActionData({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.isPrimary = false,
  });
}

/// Item d'action rapide individuel
class _QuickActionItem extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback? onTap;
  final bool isPrimary;

  const _QuickActionItem({
    required this.icon,
    required this.title,
    required this.subtitle,
    this.onTap,
    this.isPrimary = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(16),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              // Si isPrimary, fond kEmerald, sinon fond gris foncé
              color: isPrimary
                  ? kEmerald.withOpacity(0.15)
                  : const Color(0xFF1F1F1F),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(
                color: isPrimary
                    ? kEmerald.withOpacity(0.3)
                    : Colors.white.withOpacity(0.05),
                width: 1,
              ),
            ),
            child: Row(
              children: [
                // Icône avec fond blanc ou kEmerald
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: isPrimary ? kEmerald : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Icon(
                    icon,
                    color: isPrimary ? Colors.white : kEmerald,
                    size: 24,
                  ),
                ),
                const SizedBox(width: 16),

                // Texte
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        title,
                        style: DSTypography.bodyLarge.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitle,
                        style: DSTypography.bodySmall.copyWith(
                          color: isPrimary
                              ? Colors.white.withOpacity(0.8)
                              : Colors.grey.shade500,
                        ),
                      ),
                    ],
                  ),
                ),

                // Chevron
                Icon(
                  Icons.chevron_right_rounded,
                  color: isPrimary ? Colors.white : Colors.grey.shade600,
                  size: 24,
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
