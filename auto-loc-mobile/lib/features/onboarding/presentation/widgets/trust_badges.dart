import 'package:flutter/material.dart';
import 'dart:ui';

/// Widget affichant les 3 badges de confiance
///
/// Features:
/// - 3 badges: Paiement, Contrat, Véhicules vérifiés
/// - Animation en cascade (stagger)
/// - Glassmorphism effect
/// - Icônes + texte
class TrustBadges extends StatefulWidget {
  final bool animate;

  const TrustBadges({
    super.key,
    this.animate = true,
  });

  @override
  State<TrustBadges> createState() => _TrustBadgesState();
}

class _TrustBadgesState extends State<TrustBadges>
    with TickerProviderStateMixin {
  late List<AnimationController> _controllers;
  late List<Animation<double>> _animations;

  @override
  void initState() {
    super.initState();

    // 3 controllers pour animation en cascade
    _controllers = List.generate(
      3,
      (index) => AnimationController(
        duration: const Duration(milliseconds: 600),
        vsync: this,
      ),
    );

    _animations = _controllers.map((controller) {
      return CurvedAnimation(
        parent: controller,
        curve: Curves.elasticOut,
      );
    }).toList();

    if (widget.animate) {
      _startStaggeredAnimation();
    } else {
      for (var controller in _controllers) {
        controller.value = 1.0;
      }
    }
  }

  Future<void> _startStaggeredAnimation() async {
    await Future.delayed(const Duration(milliseconds: 300));

    for (int i = 0; i < _controllers.length; i++) {
      if (!mounted) return;
      _controllers[i].forward();
      await Future.delayed(const Duration(milliseconds: 150));
    }
  }

  @override
  void dispose() {
    for (var controller in _controllers) {
      controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Badge 1 - Paiement sécurisé
        _buildAnimatedBadge(
          index: 0,
          icon: Icons.payment_rounded,
          title: 'Paiement',
          subtitle: 'sécurisé',
          color: const Color(0xFF10B981),
        ),

        const SizedBox(height: 16),

        // Badge 2 - Contrat automatique
        _buildAnimatedBadge(
          index: 1,
          icon: Icons.description_rounded,
          title: 'Contrat',
          subtitle: 'automatique',
          color: const Color(0xFF3B82F6),
        ),

        const SizedBox(height: 16),

        // Badge 3 - Véhicules vérifiés
        _buildAnimatedBadge(
          index: 2,
          icon: Icons.verified_rounded,
          title: 'Véhicules',
          subtitle: 'vérifiés',
          color: const Color(0xFF8B5CF6),
        ),
      ],
    );
  }

  Widget _buildAnimatedBadge({
    required int index,
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
  }) {
    return ScaleTransition(
      scale: _animations[index],
      child: FadeTransition(
        opacity: _animations[index],
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(20),
            color: Colors.white.withOpacity(0.15),
            border: Border.all(
              color: Colors.white.withOpacity(0.3),
              width: 1.5,
            ),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.1),
                blurRadius: 20,
                offset: const Offset(0, 8),
              ),
            ],
          ),
          child: ClipRRect(
            borderRadius: BorderRadius.circular(20),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Row(
                children: [
                  // Icône
                  Container(
                    width: 56,
                    height: 56,
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.2),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Icon(
                      icon,
                      color: Colors.white,
                      size: 28,
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
                          style: const TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: Colors.white,
                            letterSpacing: 0.3,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          subtitle,
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w500,
                            color: Colors.white.withOpacity(0.85),
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Checkmark
                  Icon(
                    Icons.check_circle_rounded,
                    color: color,
                    size: 24,
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
