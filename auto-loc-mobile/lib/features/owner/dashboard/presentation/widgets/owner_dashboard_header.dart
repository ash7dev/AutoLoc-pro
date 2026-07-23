import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../../design_system/components/premium_glass.dart';
import '../../../../../../design_system/tokens/ds_typography.dart';
import '../../../../../../shared/providers/session_providers.dart';

/// Owner Dashboard Header
///
/// **Widget purement présentationnel** - respecte les règles MVVM.
/// Reçoit toutes les données en props, n'accède à aucun provider sauf session.
///
/// Version premium — light theme dédié (le reste de l'app est en dark,
/// mais le dashboard propriétaire garde son fond clair). La card revenus
/// est le seul élément "hero" : dégradé émeraude, ombre colorée, badge
/// icône. Le reste (logo, notif, avatar) reste sobre pour ne pas
/// concurrencer visuellement le chiffre principal.
///
/// **Animations** :
/// - Les montants revenus s'animent avec un compteur de 0 → N.
/// - Le séparateur dégradé apparaît en fade-in.
class OwnerDashboardHeader extends ConsumerStatefulWidget {
  final double monthlyRevenue;
  final double cumulativeRevenue;
  final int notificationCount;
  final VoidCallback? onNotificationTap;
  final VoidCallback? onProfileTap;

  const OwnerDashboardHeader({
    super.key,
    required this.monthlyRevenue,
    required this.cumulativeRevenue,
    this.notificationCount = 0,
    this.onNotificationTap,
    this.onProfileTap,
  });

  @override
  ConsumerState<OwnerDashboardHeader> createState() =>
      _OwnerDashboardHeaderState();
}

class _OwnerDashboardHeaderState extends ConsumerState<OwnerDashboardHeader>
    with SingleTickerProviderStateMixin {
  late final AnimationController _revenueController;
  late Animation<double> _monthlyAnim;
  late Animation<double> _cumulativeAnim;

  @override
  void initState() {
    super.initState();
    _revenueController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    );
    _monthlyAnim = Tween<double>(begin: 0, end: widget.monthlyRevenue)
        .animate(CurvedAnimation(
      parent: _revenueController,
      curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
    ));
    _cumulativeAnim = Tween<double>(begin: 0, end: widget.cumulativeRevenue)
        .animate(CurvedAnimation(
      parent: _revenueController,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic),
    ));
    _revenueController.forward();
  }

  @override
  void didUpdateWidget(OwnerDashboardHeader oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.monthlyRevenue != widget.monthlyRevenue ||
        oldWidget.cumulativeRevenue != widget.cumulativeRevenue) {
      _monthlyAnim = Tween<double>(begin: 0, end: widget.monthlyRevenue)
          .animate(CurvedAnimation(
        parent: _revenueController,
        curve: const Interval(0.0, 0.7, curve: Curves.easeOutCubic),
      ));
      _cumulativeAnim = Tween<double>(begin: 0, end: widget.cumulativeRevenue)
          .animate(CurvedAnimation(
        parent: _revenueController,
        curve: const Interval(0.3, 1.0, curve: Curves.easeOutCubic),
      ));
      _revenueController.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _revenueController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final session = ref.watch(currentSessionProvider);
    final prenom = session?.prenom;
    final nom = session?.nom;
    final avatarUrl = session?.avatarUrl;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.06),
            blurRadius: 24,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius: const BorderRadius.vertical(bottom: Radius.circular(32)),
        child: Padding(
          padding: const EdgeInsets.fromLTRB(18, 16, 18, 26),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeaderRow(context, avatarUrl, prenom, nom),
              const SizedBox(height: 20),
              _buildGreeting(prenom, nom),
              const SizedBox(height: 22),
              _buildRevenueCard(),
            ],
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // HEADER ROW — logo + notification + avatar
  // ===========================================================================

  Widget _buildHeaderRow(
    BuildContext context,
    String? avatarUrl,
    String? prenom,
    String? nom,
  ) {
    return Row(
      children: [
        Image.asset(
          'assets/images/logosansfond.png',
          height: 42,
          fit: BoxFit.contain,
        ),
        const Spacer(),

        // Notification — bulle douce plutôt qu'icône nue
        Stack(
          clipBehavior: Clip.none,
          children: [
            GestureDetector(
              onTap: widget.onNotificationTap,
              child: Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: const Color(0xFFF3F4F6),
                  shape: BoxShape.circle,
                ),
                child: Icon(
                  Icons.notifications_outlined,
                  color: Colors.grey.shade700,
                  size: 21,
                ),
              ),
            ),
            if (widget.notificationCount > 0)
              Positioned(
                right: 0,
                top: 0,
                child: Container(
                  width: 19,
                  height: 19,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEF4444),
                    shape: BoxShape.circle,
                    border: Border.all(color: Colors.white, width: 2),
                    boxShadow: [
                      BoxShadow(
                        color: const Color(0xFFEF4444).withOpacity(0.4),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Center(
                    child: Text(
                      widget.notificationCount > 9 ? '9+' : '${widget.notificationCount}',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 9,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),

        const SizedBox(width: 10),

        // Avatar
        GestureDetector(
          onTap: widget.onProfileTap,
          child: Container(
            width: 46,
            height: 46,
            padding: const EdgeInsets.all(2.2),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: const LinearGradient(
                colors: [kEmerald, kEmeraldDeep],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              boxShadow: [
                BoxShadow(
                  color: kEmerald.withOpacity(0.35),
                  blurRadius: 12,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Container(
              padding: const EdgeInsets.all(1.5),
              decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.white),
              child: ClipOval(
                child: avatarUrl != null && avatarUrl.isNotEmpty
                    ? Image.network(
                        avatarUrl,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => _buildAvatarFallback(prenom, nom),
                      )
                    : _buildAvatarFallback(prenom, nom),
              ),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildAvatarFallback(String? prenom, String? nom) {
    return Container(
      color: kEmerald.withOpacity(0.12),
      child: Center(
        child: Text(
          _getInitials(prenom, nom),
          style: const TextStyle(
            color: kEmeraldDeep,
            fontSize: 16,
            fontWeight: FontWeight.w800,
          ),
        ),
      ),
    );
  }

  // ===========================================================================
  // GREETING
  // ===========================================================================

  Widget _buildGreeting(String? prenom, String? nom) {
    final greeting = _getGreeting();
    final name = _getUserName(prenom, nom);
    final today = _getFormattedDate();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              greeting,
              style: DSTypography.labelMedium.copyWith(
                color: Colors.grey.shade600,
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(width: 6),
            Container(width: 3, height: 3, decoration: BoxDecoration(color: Colors.grey.shade400, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text(
              today,
              style: DSTypography.labelMedium.copyWith(
                color: Colors.grey.shade400,
                fontWeight: FontWeight.w500,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          name,
          style: DSTypography.h2.copyWith(
            color: Colors.black87,
            fontWeight: FontWeight.w900,
            letterSpacing: -0.5,
          ),
        ),
      ],
    );
  }

  // ===========================================================================
  // REVENUE CARD — pièce maîtresse de l'écran, avec compteurs animés
  // ===========================================================================

  Widget _buildRevenueCard() {
    final currentMonth = _getCurrentMonth();

    return AnimatedBuilder(
      animation: _revenueController,
      builder: (context, _) {
        final animatedMonthly = _monthlyAnim.value;
        final animatedCumulative = _cumulativeAnim.value;
        final monthlyFormatted = _formatAmount(animatedMonthly);
        final cumulativeFormatted = _formatAmount(animatedCumulative);
        final hasMonthlyData = monthlyFormatted != '—';

        return Container(
          decoration: BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                kEmerald.withOpacity(0.10),
                kEmeraldDeep.withOpacity(0.04),
              ],
            ),
            borderRadius: BorderRadius.circular(26),
            border: Border.all(color: kEmerald.withOpacity(0.16), width: 1.2),
            boxShadow: [
              BoxShadow(
                color: kEmerald.withOpacity(0.14),
                blurRadius: 28,
                offset: const Offset(0, 12),
                spreadRadius: -8,
              ),
            ],
          ),
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Eyebrow + badge devise
                Row(
                  children: [
                    Container(
                      width: 34,
                      height: 34,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(
                          colors: [kEmerald, kEmeraldDeep],
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                        ),
                        borderRadius: BorderRadius.circular(11),
                        boxShadow: [
                          BoxShadow(
                            color: kEmerald.withOpacity(0.35),
                            blurRadius: 10,
                            offset: const Offset(0, 3),
                          ),
                        ],
                      ),
                      child: const Icon(Icons.account_balance_wallet_rounded, color: Colors.white, size: 17),
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'REVENUS · ${currentMonth.toUpperCase()}',
                        style: DSTypography.labelSmall.copyWith(
                          color: Colors.grey.shade600,
                          fontWeight: FontWeight.w800,
                          letterSpacing: 0.8,
                        ),
                      ),
                    ),
                    Icon(Icons.visibility_outlined, color: Colors.grey.shade400, size: 18),
                  ],
                ),

                const SizedBox(height: 18),

                // Montant principal — hero du hero
                Row(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    ShaderMask(
                      shaderCallback: (bounds) => const LinearGradient(
                        colors: [kEmeraldDeep, kEmerald],
                      ).createShader(bounds),
                      child: Text(
                        monthlyFormatted,
                        style: DSTypography.displayMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          letterSpacing: -1,
                          height: 1.0,
                        ),
                      ),
                    ),
                    if (hasMonthlyData) ...[
                      const SizedBox(width: 8),
                      Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Text(
                          'FCFA',
                          style: DSTypography.bodyMedium.copyWith(
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ),
                    ],
                  ],
                ),

                const SizedBox(height: 18),

                Container(
                  height: 1,
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      colors: [
                        kEmerald.withOpacity(0.25),
                        kEmerald.withOpacity(0.0),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                // Total cumulé
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Container(
                          width: 26,
                          height: 26,
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(9),
                            border: Border.all(color: kEmerald.withOpacity(0.2)),
                          ),
                          child: Icon(Icons.trending_up_rounded, color: kEmeraldDeep, size: 15),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          'Total cumulé',
                          style: DSTypography.labelSmall.copyWith(
                            color: Colors.grey.shade600,
                            fontWeight: FontWeight.w700,
                          ),
                        ),
                      ],
                    ),
                    Text(
                      cumulativeFormatted == '—' ? '—' : '$cumulativeFormatted FCFA',
                      style: DSTypography.h5.copyWith(
                        color: kEmeraldDeep,
                        fontWeight: FontWeight.w800,
                        letterSpacing: -0.3,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }

  // =========================================================================
  // HELPER FUNCTIONS
  // =========================================================================

  String _formatAmount(double? amount) {
    if (amount == null || amount == 0) return '—';
    final intAmount = amount.toInt();
    return intAmount.toString().replaceAllMapped(
          RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
          (Match m) => '${m[1]} ',
        );
  }

  String _getInitials(String? prenom, String? nom) {
    if (prenom == null && nom == null) return 'P';
    final p = prenom?.isNotEmpty == true ? prenom![0].toUpperCase() : '';
    final n = nom?.isNotEmpty == true ? nom![0].toUpperCase() : '';
    final initials = '$p$n';
    return initials.isNotEmpty ? initials : 'P';
  }

  String _getUserName(String? prenom, String? nom) {
    if (prenom != null && prenom.isNotEmpty) return prenom;
    if (nom != null && nom.isNotEmpty) return nom;
    return 'Propriétaire';
  }

  String _getGreeting() {
    final hour = DateTime.now().hour;
    if (hour < 12) return 'Bonjour 👋';
    if (hour < 18) return 'Bon après-midi 👋';
    return 'Bonsoir 👋';
  }

  String _getCurrentMonth() {
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
    ];
    return months[DateTime.now().month - 1];
  }

  String _getFormattedDate() {
    const jours = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
    final now = DateTime.now();
    return '${jours[now.weekday - 1]} ${now.day}';
  }
}