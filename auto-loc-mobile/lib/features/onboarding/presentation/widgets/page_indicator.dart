import 'package:flutter/material.dart';

/// Indicateur de page pour l'onboarding (• • ○)
///
/// Affiche des points pour indiquer la page actuelle
/// Animation smooth lors du changement de page
class PageIndicator extends StatelessWidget {
  final int currentPage;
  final int totalPages;
  final Color activeColor;
  final Color inactiveColor;

  const PageIndicator({
    super.key,
    required this.currentPage,
    required this.totalPages,
    this.activeColor = Colors.white,
    this.inactiveColor = const Color(0x66FFFFFF),
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(
        totalPages,
        (index) => _buildDot(index),
      ),
    );
  }

  Widget _buildDot(int index) {
    final isActive = index == currentPage;

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeInOut,
      width: isActive ? 24 : 8,
      height: 8,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: isActive ? activeColor : inactiveColor,
        borderRadius: BorderRadius.circular(4),
      ),
    );
  }
}
