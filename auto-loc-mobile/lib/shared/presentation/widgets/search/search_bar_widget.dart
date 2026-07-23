import 'package:flutter/material.dart';

/// SearchBar avec design glassmorphism
///
/// Barre de recherche avec effet glass, icône de recherche et placeholder.
class SearchBarWidget extends StatelessWidget {
  final String placeholder;
  final VoidCallback? onTap;
  final ValueChanged<String>? onChanged;
  final TextEditingController? controller;
  final bool readOnly;

  const SearchBarWidget({
    super.key,
    this.placeholder = 'Rechercher un véhicule...',
    this.onTap,
    this.onChanged,
    this.controller,
    this.readOnly = false,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: readOnly ? onTap : null,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.06),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: Colors.white.withOpacity(0.1),
            width: 1,
          ),
        ),
        child: Row(
          children: [
            Icon(
              Icons.search_rounded,
              color: Colors.white.withOpacity(0.5),
              size: 22,
            ),
            const SizedBox(width: 12),
            Expanded(
              child: readOnly
                  ? Text(
                      placeholder,
                      style: TextStyle(
                        fontSize: 15,
                        color: Colors.white.withOpacity(0.5),
                        fontWeight: FontWeight.w400,
                      ),
                    )
                  : TextField(
                      controller: controller,
                      onChanged: onChanged,
                      style: const TextStyle(
                        fontSize: 15,
                        color: Colors.white,
                        fontWeight: FontWeight.w400,
                      ),
                      decoration: InputDecoration(
                        hintText: placeholder,
                        hintStyle: TextStyle(
                          color: Colors.white.withOpacity(0.5),
                        ),
                        border: InputBorder.none,
                        isDense: true,
                        contentPadding: EdgeInsets.zero,
                      ),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
