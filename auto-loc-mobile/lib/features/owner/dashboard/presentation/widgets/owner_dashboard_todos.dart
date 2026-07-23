import 'package:flutter/material.dart';

import '../../../../../design_system/components/premium_glass.dart';
import '../../../../../design_system/tokens/ds_typography.dart';

// Couleurs sémantiques de statut — distinctes de kEmerald/kEmeraldDeep
// (couleurs de marque). Chaque couleur ici encode un type d'action,
// pas une identité visuelle : c'est une exception délibérée au même
// titre que le bleu des "Réservations actives" dans OwnerStatsCards.
const kOrange = Color(0xFFF59E0B);
const kRed = Color(0xFFEF4444);
const kBlue = Color(0xFF3B82F6);

/// Owner Dashboard Todos
///
/// Widget purement présentationnel affichant les actions urgentes du
/// propriétaire. Aligné sur le système premium_glass : blur 10,
/// badges d'icône cohérents avec EmeraldIconChip (mais multi-couleur
/// ici, car chaque item a une urgence/nature différente), pas de
/// glow — la card entière reste sobre pour ne pas rivaliser avec la
/// card revenus qui est le vrai hero du dashboard.
///
/// **Important** : Ce widget ne s'affiche que s'il y a au moins une
/// action urgente.
class OwnerDashboardTodos extends StatelessWidget {
  final int pendingConfirmations;
  final int upcomingCheckins;
  final int upcomingCheckouts;
  final int openDisputes;
  final VoidCallback? onTodoTap;

  const OwnerDashboardTodos({
    super.key,
    required this.pendingConfirmations,
    required this.upcomingCheckins,
    required this.upcomingCheckouts,
    required this.openDisputes,
    this.onTodoTap,
  });

  bool get hasTodos {
    return pendingConfirmations > 0 ||
        upcomingCheckins > 0 ||
        upcomingCheckouts > 0 ||
        openDisputes > 0;
  }

  int get _totalTodos {
    return pendingConfirmations + upcomingCheckins + upcomingCheckouts + openDisputes;
  }

  @override
  Widget build(BuildContext context) {
    if (!hasTodos) {
      return const SizedBox.shrink();
    }

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: PremiumGlassCard(
        radius: PremiumRadius.hero,
        blur: 10,
        accent: true,
        borderWidth: 1.3,
        padding: EdgeInsets.zero,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(16),
              child: Row(
                children: [
                  _AccentIconBadge(icon: Icons.notification_important_rounded, color: kOrange),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Actions urgentes',
                          style: DSTypography.h5.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.w800,
                            letterSpacing: -0.3,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '$_totalTodos action${_totalTodos > 1 ? 's' : ''} en attente',
                          style: DSTypography.bodySmall.copyWith(
                            color: kOrange,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.all(6),
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.05),
                      shape: BoxShape.circle,
                    ),
                    child: Icon(
                      Icons.chevron_right_rounded,
                      color: Colors.grey.shade400,
                      size: 18,
                    ),
                  ),
                ],
              ),
            ),

            Divider(height: 1, thickness: 1, color: Colors.white.withOpacity(0.06)),

            // Liste des todos
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  if (pendingConfirmations > 0)
                    _TodoItem(
                      icon: Icons.pending_actions_rounded,
                      color: kBlue,
                      title: 'Réservations à confirmer',
                      count: pendingConfirmations,
                      onTap: onTodoTap,
                    ),
                  if (pendingConfirmations > 0 &&
                      (upcomingCheckins > 0 || upcomingCheckouts > 0 || openDisputes > 0))
                    const SizedBox(height: 10),

                  if (upcomingCheckins > 0)
                    _TodoItem(
                      icon: Icons.login_rounded,
                      color: kEmerald,
                      title: 'Check-in dans les 48h',
                      count: upcomingCheckins,
                      onTap: onTodoTap,
                    ),
                  if (upcomingCheckins > 0 && (upcomingCheckouts > 0 || openDisputes > 0))
                    const SizedBox(height: 10),

                  if (upcomingCheckouts > 0)
                    _TodoItem(
                      icon: Icons.logout_rounded,
                      color: kOrange,
                      title: 'Check-out dans les 24h',
                      count: upcomingCheckouts,
                      onTap: onTodoTap,
                    ),
                  if (upcomingCheckouts > 0 && openDisputes > 0) const SizedBox(height: 10),

                  if (openDisputes > 0)
                    _TodoItem(
                      icon: Icons.warning_rounded,
                      color: kRed,
                      title: 'Litiges ouverts',
                      count: openDisputes,
                      onTap: onTodoTap,
                      urgent: true,
                    ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// SUB-COMPONENT: badge icône coloré — même grammaire qu'EmeraldIconChip
// mais paramétrable en couleur (statuts multiples).
// =============================================================================

class _AccentIconBadge extends StatelessWidget {
  const _AccentIconBadge({required this.icon, required this.color, this.size = 38});
  final IconData icon;
  final Color color;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [color.withOpacity(0.22), color.withOpacity(0.10)],
        ),
        borderRadius: BorderRadius.circular(PremiumRadius.icon),
        border: Border.all(color: color.withOpacity(0.35), width: 1.2),
      ),
      child: Icon(icon, color: color, size: 19),
    );
  }
}

// =============================================================================
// SUB-COMPONENT: item de todo — glass sobre imbriqué, sans double blur
// coûteux (fond opaque + teinte, cohérent visuellement sans empiler
// deux BackdropFilter).
// =============================================================================

class _TodoItem extends StatelessWidget {
  final IconData icon;
  final Color color;
  final String title;
  final int count;
  final VoidCallback? onTap;
  final bool urgent;

  const _TodoItem({
    required this.icon,
    required this.color,
    required this.title,
    required this.count,
    this.onTap,
    this.urgent = false,
  });

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(PremiumRadius.chip),
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(PremiumRadius.chip),
          border: Border.all(color: color.withOpacity(0.22), width: 1),
        ),
        child: Row(
          children: [
            _AccentIconBadge(icon: icon, color: color, size: 34),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: DSTypography.bodyMedium.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
              decoration: BoxDecoration(
                color: color.withOpacity(0.16),
                borderRadius: BorderRadius.circular(100),
                border: Border.all(color: color.withOpacity(0.32)),
              ),
              child: Text(
                count.toString(),
                style: DSTypography.bodySmall.copyWith(
                  color: color,
                  fontWeight: FontWeight.w900,
                ),
              ),
            ),
            if (urgent) ...[
              const SizedBox(width: 8),
              Icon(Icons.chevron_right_rounded, color: color.withOpacity(0.6), size: 16),
            ],
          ],
        ),
      ),
    );
  }
}