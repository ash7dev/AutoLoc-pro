import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'currency_provider.dart';

/// Currency Selector Button
///
/// Affiche la devise actuelle en compact (ex: 🇸🇳 XOF ▼) et ouvre un menu
/// détaillé (flag + libellé + code + check) au tap.
///
/// **Pourquoi PopupMenuButton et pas DropdownButton :**
/// DropdownButton calque la largeur de son menu sur la largeur du bouton
/// fermé. Avec un déclencheur compact et un contenu de menu riche, ça
/// provoque un overflow horizontal impossible à corriger proprement.
/// PopupMenuButton découple les deux via `constraints`, donc le menu peut
/// être plus large que le bouton sans jamais déborder.
class CurrencySelectorButton extends ConsumerWidget {
  const CurrencySelectorButton({super.key});

  static const Color _emerald = Color(0xFF34D399);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currency = ref.watch(currencyProvider);

    return PopupMenuButton<Currency>(
      color: const Color(0xFF0D0D0D),
      elevation: 8,
      offset: const Offset(0, 8),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: Colors.white.withOpacity(0.08)),
      ),
      // Largeur du menu totalement indépendante du bouton compact.
      constraints: const BoxConstraints(minWidth: 230, maxWidth: 280),
      padding: EdgeInsets.zero,
      onSelected: (newCurrency) {
        HapticFeedback.selectionClick();
        ref.read(currencyProvider.notifier).setCurrency(newCurrency);
      },
      itemBuilder: (context) {
        return kCurrencies.map((curr) {
          final isSelected = curr.code == currency.code;
          return PopupMenuItem<Currency>(
            value: curr,
            padding: EdgeInsets.zero,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
              decoration: BoxDecoration(
                border: Border(
                  bottom: BorderSide(
                    color: Colors.white.withOpacity(0.05),
                    width: 1,
                  ),
                ),
              ),
              child: Row(
                children: [
                  // Flag
                  Container(
                    width: 32,
                    height: 32,
                    decoration: BoxDecoration(
                      color: isSelected
                          ? _emerald.withOpacity(0.15)
                          : Colors.white.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(
                        color: isSelected
                            ? _emerald.withOpacity(0.3)
                            : Colors.white.withOpacity(0.08),
                      ),
                    ),
                    child: Center(
                      child: Text(
                        curr.flag,
                        style: const TextStyle(fontSize: 18),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),

                  // Label + Code — Expanded : s'adapte à la largeur du
                  // menu (fixée par `constraints` ci-dessus) au lieu de
                  // dépendre de la largeur du bouton fermé.
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          curr.label,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: isSelected ? _emerald : Colors.white,
                            fontSize: 14,
                            fontWeight: isSelected
                                ? FontWeight.w700
                                : FontWeight.w500,
                          ),
                        ),
                        Text(
                          curr.code,
                          style: TextStyle(
                            color: isSelected
                                ? _emerald.withOpacity(0.7)
                                : Colors.white.withOpacity(0.5),
                            fontSize: 12,
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(width: 8),

                  // Check icon
                  if (isSelected)
                    Icon(
                      Icons.check_circle_rounded,
                      color: _emerald,
                      size: 20,
                    ),
                ],
              ),
            ),
          );
        }).toList();
      },

      // Bouton fermé : compact, taille fixe, indépendant du menu.
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: Colors.white.withOpacity(0.10),
            width: 1,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              currency.flag,
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(width: 6),
            Text(
              currency.code,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 12,
                fontWeight: FontWeight.w700,
                letterSpacing: 0.3,
              ),
            ),
            const SizedBox(width: 2),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              color: Colors.white.withOpacity(0.7),
              size: 16,
            ),
          ],
        ),
      ),
    );
  }
}