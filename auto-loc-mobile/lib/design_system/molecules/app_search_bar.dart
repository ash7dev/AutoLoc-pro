import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../tokens/ds_radius.dart';
import '../tokens/ds_duration.dart';
import '../theme/glassmorphism.dart';

/// App Search Bar
/// Barre de recherche avec effet glassmorphism
/// Utilisée dans le feed, l'exploration, etc.
class AppSearchBar extends StatefulWidget {
  const AppSearchBar({
    super.key,
    this.controller,
    this.hint = 'Rechercher...',
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.readOnly = false,
    this.autofocus = false,
    this.showFilter = false,
    this.onFilterTap,
  });

  final TextEditingController? controller;
  final String hint;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final bool readOnly;
  final bool autofocus;
  final bool showFilter;
  final VoidCallback? onFilterTap;

  @override
  State<AppSearchBar> createState() => _AppSearchBarState();
}

class _AppSearchBarState extends State<AppSearchBar> {
  late TextEditingController _controller;
  late FocusNode _focusNode;
  bool _isFocused = false;
  bool _hasText = false;

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? TextEditingController();
    _focusNode = FocusNode();
    _focusNode.addListener(_onFocusChange);
    _controller.addListener(_onTextChange);
    _hasText = _controller.text.isNotEmpty;
  }

  @override
  void dispose() {
    if (widget.controller == null) {
      _controller.dispose();
    }
    _focusNode.dispose();
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  void _onTextChange() {
    final hasText = _controller.text.isNotEmpty;
    if (hasText != _hasText) {
      setState(() {
        _hasText = hasText;
      });
    }
  }

  void _clear() {
    _controller.clear();
    widget.onChanged?.call('');
  }

  @override
  Widget build(BuildContext context) {
    return Glassmorphism.glassContainer(
      borderRadius: DSRadius.borderRadiusFull,
      backgroundColor: DSColors.darkSurfaceGlass,
      borderColor: _isFocused ? DSColors.emerald600 : DSColors.darkBorderGlass,
      borderWidth: _isFocused ? 2 : 1,
      child: Row(
        children: [
          // Search icon
          Padding(
            padding: const EdgeInsets.only(
              left: DSSpacing.md,
              right: DSSpacing.xs,
            ),
            child: Icon(
              Icons.search,
              size: 20,
              color: _isFocused
                  ? DSColors.emerald600
                  : DSColors.darkTextSecondary,
            ),
          ),

          // Text field
          Expanded(
            child: TextField(
              controller: _controller,
              focusNode: _focusNode,
              readOnly: widget.readOnly,
              autofocus: widget.autofocus,
              onChanged: widget.onChanged,
              onSubmitted: widget.onSubmitted,
              onTap: widget.onTap,
              style: DSTypography.bodyMedium.copyWith(
                color: DSColors.darkTextPrimary,
              ),
              decoration: InputDecoration(
                hintText: widget.hint,
                hintStyle: DSTypography.bodyMedium.copyWith(
                  color: DSColors.darkTextTertiary,
                ),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.symmetric(
                  horizontal: DSSpacing.xs,
                  vertical: DSSpacing.sm,
                ),
              ),
            ),
          ),

          // Clear button
          if (_hasText)
            AnimatedOpacity(
              duration: DSDuration.fastDuration,
              opacity: _hasText ? 1 : 0,
              child: IconButton(
                icon: const Icon(
                  Icons.close,
                  size: 18,
                ),
                color: DSColors.darkTextSecondary,
                onPressed: _clear,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
              ),
            ),

          // Filter button
          if (widget.showFilter)
            Padding(
              padding: const EdgeInsets.only(
                left: DSSpacing.xs,
                right: DSSpacing.sm,
              ),
              child: IconButton(
                icon: const Icon(
                  Icons.tune,
                  size: 20,
                ),
                color: DSColors.emerald600,
                onPressed: widget.onFilterTap,
                padding: EdgeInsets.zero,
                constraints: const BoxConstraints(
                  minWidth: 32,
                  minHeight: 32,
                ),
              ),
            ),
        ],
      ),
    );
  }
}
