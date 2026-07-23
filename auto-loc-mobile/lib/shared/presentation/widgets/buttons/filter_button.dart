import 'package:flutter/material.dart';

const Color _emerald = Color(0xFF34D399);

/// FilterButton avec badge de compteur
///
/// Bouton pour ouvrir le bottom sheet de filtres avec un badge
/// indiquant le nombre de filtres actifs.
class FilterButton extends StatelessWidget {
  final VoidCallback onPressed;
  final int activeFiltersCount;

  const FilterButton({
    super.key,
    required this.onPressed,
    this.activeFiltersCount = 0,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 48,
        height: 48,
        decoration: BoxDecoration(
          color: activeFiltersCount > 0
              ? _emerald.withOpacity(0.15)
              : Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(
            color: activeFiltersCount > 0
                ? _emerald.withOpacity(0.3)
                : Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Stack(
          children: [
            Center(
              child: Icon(
                Icons.tune_rounded,
                color: activeFiltersCount > 0
                    ? _emerald
                    : Colors.white.withOpacity(0.7),
                size: 22,
              ),
            ),
            if (activeFiltersCount > 0)
              Positioned(
                top: 8,
                right: 8,
                child: Container(
                  padding: const EdgeInsets.all(4),
                  decoration: const BoxDecoration(
                    color: _emerald,
                    shape: BoxShape.circle,
                  ),
                  constraints: const BoxConstraints(
                    minWidth: 18,
                    minHeight: 18,
                  ),
                  child: Center(
                    child: Text(
                      '$activeFiltersCount',
                      style: const TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w700,
                        color: Colors.black,
                      ),
                    ),
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }
}
