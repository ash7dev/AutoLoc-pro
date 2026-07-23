import 'package:flutter/material.dart';
import 'dart:ui';
import 'dart:math' as math;

/// Widget animé montrant un trajet GPS
///
/// Features:
/// - Deux points (départ/arrivée)
/// - Ligne pointillée qui se dessine
/// - Marqueurs avec pulse animation
/// - Checkmark à la fin
class AnimatedRoutePath extends StatefulWidget {
  final bool animate;

  const AnimatedRoutePath({
    super.key,
    this.animate = true,
  });

  @override
  State<AnimatedRoutePath> createState() => _AnimatedRoutePathState();
}

class _AnimatedRoutePathState extends State<AnimatedRoutePath>
    with TickerProviderStateMixin {
  late AnimationController _cardController;
  late AnimationController _pathController;
  late AnimationController _checkController;
  late AnimationController _pulseController;

  late Animation<double> _cardAnimation;
  late Animation<double> _pathAnimation;
  late Animation<double> _checkAnimation;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();

    // Card appearance
    _cardController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    _cardAnimation = CurvedAnimation(
      parent: _cardController,
      curve: Curves.easeOut,
    );

    // Path drawing
    _pathController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    _pathAnimation = CurvedAnimation(
      parent: _pathController,
      curve: Curves.easeInOut,
    );

    // Checkmark appearance
    _checkController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _checkAnimation = CurvedAnimation(
      parent: _checkController,
      curve: Curves.elasticOut,
    );

    // Pulse animation (continuous)
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 1.0, end: 1.15).animate(
      CurvedAnimation(
        parent: _pulseController,
        curve: Curves.easeInOut,
      ),
    );

    if (widget.animate) {
      _startAnimationSequence();
    } else {
      _cardController.value = 1.0;
      _pathController.value = 1.0;
      _checkController.value = 1.0;
    }
  }

  Future<void> _startAnimationSequence() async {
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;

    await _cardController.forward();
    await Future.delayed(const Duration(milliseconds: 200));
    if (!mounted) return;

    await _pathController.forward();
    await Future.delayed(const Duration(milliseconds: 300));
    if (!mounted) return;

    await _checkController.forward();
  }

  @override
  void dispose() {
    _cardController.dispose();
    _pathController.dispose();
    _checkController.dispose();
    _pulseController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: Listenable.merge([
        _cardAnimation,
        _pathAnimation,
        _checkAnimation,
        _pulseAnimation,
      ]),
      builder: (context, child) {
        return FadeTransition(
          opacity: _cardAnimation,
          child: ScaleTransition(
            scale: _cardAnimation,
            child: Container(
              width: 320,
              height: 360,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: Colors.white.withOpacity(0.15),
                border: Border.all(
                  color: Colors.white.withOpacity(0.3),
                  width: 1.5,
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 30,
                    offset: const Offset(0, 10),
                  ),
                ],
              ),
              child: ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: CustomPaint(
                    painter: _RoutePathPainter(
                      pathProgress: _pathAnimation.value,
                      pulseScale: _pulseAnimation.value,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // Point de départ
                        _buildLocationPoint(
                          'Point de départ',
                          Icons.location_on_rounded,
                          isStart: true,
                        ),

                        // Espace pour la ligne (dessinée par CustomPaint)
                        const SizedBox(height: 120),

                        // Point d'arrivée
                        _buildLocationPoint(
                          'Destination',
                          Icons.location_on_rounded,
                          isStart: false,
                        ),

                        const SizedBox(height: 16),

                        // Checkmark de confirmation
                        if (_checkAnimation.value > 0)
                          ScaleTransition(
                            scale: _checkAnimation,
                            child: Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: const Color(0xFF10B981),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: const Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.check_circle_rounded,
                                    color: Colors.white,
                                    size: 20,
                                  ),
                                  SizedBox(width: 8),
                                  Text(
                                    'Réservation validée',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ),
                      ],
                    ),
                  ),
                ),
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _buildLocationPoint(String label, IconData icon, {required bool isStart}) {
    return Row(
      children: [
        Transform.scale(
          scale: isStart ? _pulseAnimation.value : 1.0,
          child: Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.25),
              shape: BoxShape.circle,
            ),
            child: Icon(
              icon,
              color: Colors.white,
              size: 24,
            ),
          ),
        ),
        const SizedBox(width: 12),
        Text(
          label,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 15,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }
}

/// Custom painter pour dessiner le chemin animé
class _RoutePathPainter extends CustomPainter {
  final double pathProgress;
  final double pulseScale;

  _RoutePathPainter({
    required this.pathProgress,
    required this.pulseScale,
  });

  @override
  void paint(Canvas canvas, Size size) {
    // Ligne pointillée verticale
    final paint = Paint()
      ..color = Colors.white.withOpacity(0.6)
      ..strokeWidth = 2.5
      ..style = PaintingStyle.stroke;

    const startY = 60.0;
    const endY = 210.0;
    const x = 20.0;

    final totalHeight = endY - startY;
    final currentHeight = totalHeight * pathProgress;

    // Dessiner les pointillés
    const dashHeight = 8.0;
    const dashSpace = 6.0;
    double currentDashY = startY;

    while (currentDashY < startY + currentHeight) {
      final dashEndY = math.min(
        currentDashY + dashHeight,
        startY + currentHeight,
      );

      canvas.drawLine(
        Offset(x, currentDashY),
        Offset(x, dashEndY),
        paint,
      );

      currentDashY += dashHeight + dashSpace;
    }
  }

  @override
  bool shouldRepaint(_RoutePathPainter oldDelegate) {
    return pathProgress != oldDelegate.pathProgress ||
        pulseScale != oldDelegate.pulseScale;
  }
}
