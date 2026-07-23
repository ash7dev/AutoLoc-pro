import 'package:flutter/material.dart';

import '../../../../../design_system/components/premium_glass.dart';
import '../../../../../design_system/tokens/ds_typography.dart';

/// Owner Stats Cards
///
/// Widget purement présentationnel affichant les statistiques clés du
/// propriétaire. Suit le principe hero/sobre du reste de l'app : les
/// cartes "Véhicules" et "Réservations" restent compactes et neutres,
/// tandis que le "Taux d'occupation" devient la carte hero de la
/// section — seule métrique visualisée avec une barre de progression,
/// car c'est la seule dont la valeur n'a de sens que relativement
/// (0-100%), contrairement à un simple compteur.
///
/// **Animations** :
/// - Les compteurs (véhicules, réservations) s'incrémentent de 0 à N.
/// - Le taux d'occupation a un compteur animé + une barre qui se remplit.
class OwnerStatsCards extends StatelessWidget {
  final int totalVehicles;
  final int activeReservations;
  final double occupancyRate;

  const OwnerStatsCards({
    super.key,
    required this.totalVehicles,
    required this.activeReservations,
    required this.occupancyRate,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _AnimatedStatCard(
                  icon: Icons.directions_car_rounded,
                  label: 'Véhicules',
                  targetValue: totalVehicles,
                  accentColor: kEmerald,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _AnimatedStatCard(
                  icon: Icons.calendar_month_rounded,
                  label: 'Réservations actives',
                  targetValue: activeReservations,
                  accentColor: const Color(0xFF60A5FA),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _AnimatedOccupancyHeroCard(occupancyRate: occupancyRate),
        ],
      ),
    );
  }
}

// =============================================================================
// ANIMATED STAT CARD — compteur animé de 0 à N
// =============================================================================

class _AnimatedStatCard extends StatefulWidget {
  final IconData icon;
  final String label;
  final int targetValue;
  final Color accentColor;

  const _AnimatedStatCard({
    required this.icon,
    required this.label,
    required this.targetValue,
    required this.accentColor,
  });

  @override
  State<_AnimatedStatCard> createState() => _AnimatedStatCardState();
}

class _AnimatedStatCardState extends State<_AnimatedStatCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late final Animation<int> _countAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    );
    _countAnimation = IntTween(
      begin: 0,
      end: widget.targetValue,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
    _controller.forward();
  }

  @override
  void didUpdateWidget(_AnimatedStatCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.targetValue != widget.targetValue) {
      _countAnimation = IntTween(
        begin: 0,
        end: widget.targetValue,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      ));
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _StatIconBadge(icon: widget.icon, color: widget.accentColor),
          const SizedBox(height: 14),
          Text(
            widget.label,
            style: DSTypography.bodySmall.copyWith(
              color: Colors.grey.shade500,
              fontWeight: FontWeight.w600,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 4),
          AnimatedBuilder(
            animation: _countAnimation,
            builder: (context, _) {
              return Text(
                '${_countAnimation.value}',
                style: DSTypography.h3.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              );
            },
          ),
        ],
      ),
    );
  }
}

/// Badge icône générique
class _StatIconBadge extends StatelessWidget {
  const _StatIconBadge({required this.icon, required this.color});
  final IconData icon;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 40,
      height: 40,
      decoration: BoxDecoration(
        color: color.withOpacity(0.12),
        borderRadius: BorderRadius.circular(PremiumRadius.icon),
        border: Border.all(color: color.withOpacity(0.22), width: 1.2),
      ),
      child: Icon(icon, color: color, size: 20),
    );
  }
}

// =============================================================================
// ANIMATED OCCUPANCY HERO CARD — compteur + barre de progression animés
// =============================================================================

class _AnimatedOccupancyHeroCard extends StatefulWidget {
  const _AnimatedOccupancyHeroCard({required this.occupancyRate});
  final double occupancyRate;

  @override
  State<_AnimatedOccupancyHeroCard> createState() =>
      _AnimatedOccupancyHeroCardState();
}

class _AnimatedOccupancyHeroCardState
    extends State<_AnimatedOccupancyHeroCard>
    with SingleTickerProviderStateMixin {
  late final AnimationController _controller;
  late Animation<double> _rateAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    );
    _rateAnimation = Tween<double>(
      begin: 0,
      end: widget.occupancyRate,
    ).animate(CurvedAnimation(
      parent: _controller,
      curve: Curves.easeOutCubic,
    ));
    _controller.forward();
  }

  @override
  void didUpdateWidget(_AnimatedOccupancyHeroCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.occupancyRate != widget.occupancyRate) {
      _rateAnimation = Tween<double>(
        begin: 0,
        end: widget.occupancyRate,
      ).animate(CurvedAnimation(
        parent: _controller,
        curve: Curves.easeOutCubic,
      ));
      _controller.forward(from: 0);
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  ({String label, Color color}) _qualifier(double rate) {
    if (rate >= 70) return (label: 'Excellent', color: kEmerald);
    if (rate >= 40) return (label: 'Bon niveau', color: const Color(0xFFFBBF24));
    return (label: 'À optimiser', color: const Color(0xFFF87171));
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _rateAnimation,
      builder: (context, _) {
        final animatedRate = _rateAnimation.value;
        final q = _qualifier(widget.occupancyRate);
        final double pct = animatedRate.clamp(0, 100) / 100;

        return PremiumGlassCard(
          radius: PremiumRadius.hero,
          blur: 10,
          accent: true,
          padding: const EdgeInsets.all(18),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const _StatIconBadge(
                      icon: Icons.pie_chart_rounded, color: kEmerald),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'TAUX D\'OCCUPATION',
                          style: DSTypography.labelSmall.copyWith(
                            color: Colors.grey.shade500,
                            fontWeight: FontWeight.w800,
                            letterSpacing: 0.8,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          'Sur l\'ensemble de votre flotte',
                          style: DSTypography.labelSmall
                              .copyWith(color: Colors.grey.shade600),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding:
                        const EdgeInsets.symmetric(horizontal: 9, vertical: 4),
                    decoration: BoxDecoration(
                      color: q.color.withOpacity(0.14),
                      borderRadius: BorderRadius.circular(100),
                      border: Border.all(color: q.color.withOpacity(0.3)),
                    ),
                    child: Text(
                      q.label,
                      style: DSTypography.labelSmall.copyWith(
                        color: q.color,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 18),

              Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  ShaderMask(
                    shaderCallback: (bounds) => const LinearGradient(
                      colors: [kEmeraldDeep, kEmerald],
                    ).createShader(bounds),
                    child: Text(
                      animatedRate.toStringAsFixed(1),
                      style: DSTypography.displaySmall.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w900,
                        letterSpacing: -1,
                        height: 1.0,
                      ),
                    ),
                  ),
                  Padding(
                    padding: const EdgeInsets.only(left: 4, bottom: 4),
                    child: Text(
                      '%',
                      style: DSTypography.bodyLarge.copyWith(
                        color: Colors.grey.shade500,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 12),

              // Barre de progression animée
              ClipRRect(
                borderRadius: BorderRadius.circular(100),
                child: Container(
                  height: 8,
                  color: Colors.white.withOpacity(0.06),
                  child: FractionallySizedBox(
                    widthFactor: pct,
                    alignment: Alignment.centerLeft,
                    child: Container(
                      decoration: const BoxDecoration(
                        gradient:
                            LinearGradient(colors: [kEmeraldDeep, kEmerald]),
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}