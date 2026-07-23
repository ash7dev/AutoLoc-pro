import 'package:flutter/material.dart';
import 'dart:math' as math;
import '../../../../design_system/tokens/ds_colors.dart';

/// Background animé avec fond noir et formes organiques
///
/// Features:
/// - Fond noir pur (dark mode comme frontend)
/// - Formes organiques blanches qui flottent (parallax)
/// - Animation infinie subtile
/// - Effet glassmorphism sur les cartes
class OnboardingBackground extends StatefulWidget {
  final Widget child;
  final int pageIndex; // Pour varier les positions selon la page

  const OnboardingBackground({
    super.key,
    required this.child,
    this.pageIndex = 0,
  });

  @override
  State<OnboardingBackground> createState() => _OnboardingBackgroundState();
}

class _OnboardingBackgroundState extends State<OnboardingBackground>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      duration: const Duration(seconds: 20),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0D0D0D), // Fond noir pur (dark mode comme frontend)
      ),
      child: Stack(
        children: [
          // Formes organiques animées
          ..._buildFloatingShapes(),

          // Contenu principal
          widget.child,
        ],
      ),
    );
  }

  List<Widget> _buildFloatingShapes() {
    return [
      // Shape 1 - Top Right
      _FloatingShape(
        controller: _controller,
        size: 280,
        startPosition: Offset(
          MediaQuery.of(context).size.width - 100,
          -80,
        ),
        movementRange: const Offset(15, 25),
        opacity: 0.08,
        delay: 0.0,
      ),

      // Shape 2 - Bottom Left
      _FloatingShape(
        controller: _controller,
        size: 350,
        startPosition: const Offset(-120, -50),
        movementRange: const Offset(-20, 30),
        opacity: 0.06,
        delay: 0.3,
      ),

      // Shape 3 - Center Right
      _FloatingShape(
        controller: _controller,
        size: 200,
        startPosition: Offset(
          MediaQuery.of(context).size.width - 50,
          MediaQuery.of(context).size.height * 0.4,
        ),
        movementRange: const Offset(10, -20),
        opacity: 0.05,
        delay: 0.6,
      ),

      // Shape 4 - Bottom Center (petite)
      _FloatingShape(
        controller: _controller,
        size: 150,
        startPosition: Offset(
          MediaQuery.of(context).size.width * 0.3,
          MediaQuery.of(context).size.height - 100,
        ),
        movementRange: const Offset(-15, -15),
        opacity: 0.04,
        delay: 0.9,
      ),
    ];
  }
}

/// Widget pour une forme qui flotte avec animation
class _FloatingShape extends StatelessWidget {
  final AnimationController controller;
  final double size;
  final Offset startPosition;
  final Offset movementRange;
  final double opacity;
  final double delay;

  const _FloatingShape({
    required this.controller,
    required this.size,
    required this.startPosition,
    required this.movementRange,
    required this.opacity,
    required this.delay,
  });

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: controller,
      builder: (context, child) {
        // Animation sinusoïdale pour mouvement fluide
        final animValue = (controller.value + delay) % 1.0;
        final offsetX = math.sin(animValue * 2 * math.pi) * movementRange.dx;
        final offsetY = math.cos(animValue * 2 * math.pi) * movementRange.dy;

        return Positioned(
          left: startPosition.dx + offsetX,
          top: startPosition.dy + offsetY,
          child: Container(
            width: size,
            height: size,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              gradient: RadialGradient(
                colors: [
                  Colors.white.withOpacity(opacity),
                  Colors.white.withOpacity(0.0),
                ],
              ),
            ),
          ),
        );
      },
    );
  }
}
