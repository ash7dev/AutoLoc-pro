import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'filter_bottom_sheet.dart';
import 'filter_provider.dart';

/// Filter Button
///
/// Bouton compact pour ouvrir le bottom sheet de filtres
/// Affiche un badge avec le nombre de filtres actifs
///
/// **Usage :**
/// ```dart
/// FilterButton()
/// ```
class FilterButton extends ConsumerWidget {
  const FilterButton({super.key});

  static const Color _emerald = Color(0xFF34D399);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(activeFilterCountProvider);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          showFilterBottomSheet(context);
        },
        borderRadius: BorderRadius.circular(12),
        splashColor: _emerald.withOpacity(0.12),
        highlightColor: _emerald.withOpacity(0.06),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: count > 0
                ? _emerald.withOpacity(0.14)
                : Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: count > 0
                  ? _emerald.withOpacity(0.35)
                  : Colors.white.withOpacity(0.10),
              width: 1,
            ),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Center(
                child: Icon(
                  Icons.tune_rounded,
                  color: count > 0 ? _emerald : Colors.white.withOpacity(0.85),
                  size: 20,
                ),
              ),

              // Badge de compteur
              if (count > 0)
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: _emerald,
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(
                        color: const Color(0xFF0D0D0D),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: _emerald.withOpacity(0.5),
                          blurRadius: 6,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        count > 9 ? '9+' : '$count',
                        style: const TextStyle(
                          color: Color(0xFF0D0D0D),
                          fontSize: 10,
                          fontWeight: FontWeight.w900,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}