import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../components/premium_glass.dart';

/// App Bottom Navigation
/// Navigation flottante arrondie, glassmorphism premium
/// 4 tabs: Accueil, Explorer, Réservations, Paramètres
///
/// Comportement "morphing pill" :
/// - Chaque item a une largeur EXPLICITE et animée (pas un simple Expanded
///   à parts égales), donc le pill actif s'élargit vraiment pendant que les
///   3 autres se resserrent — comme une segmented control iOS.
/// - Le contenu est protégé par un FittedBox : même si un label est long
///   ("Réservations"), il ne peut jamais déborder (fini le RenderFlex
///   overflow).
class AppBottomNavigation extends StatelessWidget {
  const AppBottomNavigation({
    super.key,
    required this.currentIndex,
    required this.onTap,
  });

  final int currentIndex;
  final ValueChanged<int> onTap;

  static const List<_NavItemData> _items = [
    _NavItemData(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: 'Accueil',
    ),
    _NavItemData(
      icon: Icons.search_outlined,
      activeIcon: Icons.search_rounded,
      label: 'Explorer',
    ),
    _NavItemData(
      icon: Icons.receipt_long_outlined,
      activeIcon: Icons.receipt_long_rounded,
      label: 'Réservations',
    ),
    _NavItemData(
      icon: Icons.settings_outlined,
      activeIcon: Icons.settings_rounded,
      label: 'Paramètres',
    ),
  ];

  // Largeur du pill actif ; les 3 autres items se partagent le reste
  // à parts égales. Calculée dynamiquement via LayoutBuilder pour
  // s'adapter à n'importe quelle taille d'écran.
  static const double _activeWidth = 138;

  void _handleTap(int index) {
    if (index != currentIndex) {
      HapticFeedback.selectionClick();
    }
    onTap(index);
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      top: false,
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: BackdropFilter(
            filter: ImageFilter.compose(
              outer: ImageFilter.blur(sigmaX: 26, sigmaY: 26),
              inner: const ColorFilter.matrix(<double>[
                1.236, -0.215, -0.022, 0, 0,
                -0.064, 1.086, -0.022, 0, 0,
                -0.064, -0.215, 1.278, 0, 0,
                0, 0, 0, 1, 0,
              ]),
            ),
            child: Container(
              height: 64,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(32),
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.white.withOpacity(0.14),
                    Colors.white.withOpacity(0.05),
                  ],
                ),
                border: Border.all(
                  color: Colors.white.withOpacity(0.22),
                  width: 1,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.35),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              padding: const EdgeInsets.all(6),
              child: LayoutBuilder(
                builder: (context, constraints) {
                  final totalWidth = constraints.maxWidth;
                  final inactiveWidth =
                      (totalWidth - _activeWidth) / (_items.length - 1);

                  return Row(
                    children: List.generate(_items.length, (index) {
                      final item = _items[index];
                      final isActive = currentIndex == index;
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 320),
                        curve: Curves.easeOutCubic,
                        width: isActive ? _activeWidth : inactiveWidth,
                        clipBehavior: Clip.hardEdge,
                        decoration: const BoxDecoration(),
                        child: _NavItem(
                          data: item,
                          isActive: isActive,
                          onTap: () => _handleTap(index),
                        ),
                      );
                    }),
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItemData {
  const _NavItemData({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });

  final IconData icon;
  final IconData activeIcon;
  final String label;
}

class _NavItem extends StatelessWidget {
  const _NavItem({
    required this.data,
    required this.isActive,
    required this.onTap,
  });

  final _NavItemData data;
  final bool isActive;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        splashColor: Colors.transparent,
        highlightColor: Colors.transparent,
        borderRadius: BorderRadius.circular(24),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 2, vertical: 2),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 260),
            curve: Curves.easeOut,
            decoration: BoxDecoration(
              color: isActive ? Colors.white : Colors.transparent,
              borderRadius: BorderRadius.circular(24),
              boxShadow: isActive
                  ? [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.12),
                        blurRadius: 12,
                        offset: const Offset(0, 4),
                      ),
                      BoxShadow(
                        color: kEmerald.withOpacity(0.18),
                        blurRadius: 16,
                        spreadRadius: -2,
                      ),
                    ]
                  : null,
            ),
            child: Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 10),
                child: FittedBox(
                  fit: BoxFit.scaleDown,
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        isActive ? data.activeIcon : data.icon,
                        size: isActive ? 20 : 22,
                        color: isActive
                            ? kEmerald
                            : Colors.white.withOpacity(0.82),
                      ),
                      if (isActive) ...[
                        const SizedBox(width: 6),
                        Text(
                          data.label,
                          style: DSTypography.labelSmall.copyWith(
                            color: kEmerald,
                            fontWeight: FontWeight.w800,
                            fontSize: 15,
                            letterSpacing: 0.2,
                          ),
                          maxLines: 1,
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}