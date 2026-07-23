import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Explore Search Bar
///
/// Barre de recherche pour l'écran Explore
/// Design premium : glass noir, bordure qui réagit au focus en émeraude
///
/// **Usage :**
/// ```dart
/// ExploreSearchBar(
///   onChanged: (query) => print('Recherche: $query'),
/// )
/// ```
class ExploreSearchBar extends StatefulWidget {
  const ExploreSearchBar({
    super.key,
    this.onChanged,
    this.onSubmitted,
  });

  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;

  @override
  State<ExploreSearchBar> createState() => _ExploreSearchBarState();
}

class _ExploreSearchBarState extends State<ExploreSearchBar> {
  static const Color _emerald = Color(0xFF34D399);

  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      setState(() => _isFocused = _focusNode.hasFocus);
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedContainer(
      duration: const Duration(milliseconds: 200),
      curve: Curves.easeOut,
      height: 46,
      decoration: BoxDecoration(
        color: Colors.black.withOpacity(0.55),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: _isFocused
              ? _emerald.withOpacity(0.55)
              : Colors.white.withOpacity(0.10),
          width: 1,
        ),
        boxShadow: _isFocused
            ? [
                BoxShadow(
                  color: _emerald.withOpacity(0.18),
                  blurRadius: 16,
                  spreadRadius: 0,
                ),
              ]
            : null,
      ),
      child: TextField(
        controller: _controller,
        focusNode: _focusNode,
        cursorColor: _emerald,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w500,
        ),
        decoration: InputDecoration(
          hintText: 'Rechercher...',
          hintStyle: TextStyle(
            color: Colors.white.withOpacity(0.38),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          prefixIcon: Icon(
            Icons.search_rounded,
            color: _isFocused ? _emerald : Colors.white.withOpacity(0.55),
            size: 21,
          ),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: Icon(
                    Icons.close_rounded,
                    color: Colors.white.withOpacity(0.55),
                    size: 19,
                  ),
                  onPressed: () {
                    HapticFeedback.selectionClick();
                    _controller.clear();
                    widget.onChanged?.call('');
                    setState(() {});
                  },
                )
              : null,
          border: InputBorder.none,
          contentPadding: const EdgeInsets.symmetric(
            horizontal: 14,
            vertical: 12,
          ),
        ),
        onChanged: (value) {
          setState(() {}); // Pour afficher/cacher le bouton clear
          widget.onChanged?.call(value);
        },
        onSubmitted: widget.onSubmitted,
      ),
    );
  }
}