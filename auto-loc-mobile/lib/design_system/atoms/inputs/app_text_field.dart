import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens/ds_colors.dart';
import '../../tokens/ds_typography.dart';
import '../../tokens/ds_spacing.dart';
import '../../tokens/ds_radius.dart';
import '../../tokens/ds_duration.dart';

/// App Text Field
/// Input field avec glassmorphism style
/// Supporte label, hint, error, prefix/suffix icons, validation
class AppTextField extends StatefulWidget {
  const AppTextField({
    super.key,
    this.controller,
    this.initialValue,
    this.label,
    this.hint,
    this.helperText,
    this.errorText,
    this.prefixIcon,
    this.suffixIcon,
    this.obscureText = false,
    this.enabled = true,
    this.readOnly = false,
    this.maxLines = 1,
    this.minLines,
    this.maxLength,
    this.keyboardType,
    this.textInputAction,
    this.textCapitalization = TextCapitalization.none,
    this.inputFormatters,
    this.validator,
    this.onChanged,
    this.onSubmitted,
    this.onTap,
    this.autofocus = false,
    this.focusNode,
  });

  final TextEditingController? controller;
  final String? initialValue;
  final String? label;
  final String? hint;
  final String? helperText;
  final String? errorText;
  final Widget? prefixIcon;
  final Widget? suffixIcon;
  final bool obscureText;
  final bool enabled;
  final bool readOnly;
  final int? maxLines;
  final int? minLines;
  final int? maxLength;
  final TextInputType? keyboardType;
  final TextInputAction? textInputAction;
  final TextCapitalization textCapitalization;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onSubmitted;
  final VoidCallback? onTap;
  final bool autofocus;
  final FocusNode? focusNode;

  @override
  State<AppTextField> createState() => _AppTextFieldState();
}

class _AppTextFieldState extends State<AppTextField> {
  late FocusNode _focusNode;
  bool _isFocused = false;

  @override
  void initState() {
    super.initState();
    _focusNode = widget.focusNode ?? FocusNode();
    _focusNode.addListener(_onFocusChange);
  }

  @override
  void dispose() {
    if (widget.focusNode == null) {
      _focusNode.dispose();
    } else {
      _focusNode.removeListener(_onFocusChange);
    }
    super.dispose();
  }

  void _onFocusChange() {
    setState(() {
      _isFocused = _focusNode.hasFocus;
    });
  }

  @override
  Widget build(BuildContext context) {
    final bool hasError = widget.errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: DSTypography.labelMedium.copyWith(
              color: hasError
                  ? DSColors.red600
                  : _isFocused
                      ? DSColors.emerald600
                      : DSColors.darkTextSecondary,
            ),
          ),
          const SizedBox(height: DSSpacing.xs),
        ],
        AnimatedContainer(
          duration: DSDuration.fastDuration,
          decoration: BoxDecoration(
            borderRadius: DSRadius.borderRadiusInput,
            border: Border.all(
              color: hasError
                  ? DSColors.red600
                  : _isFocused
                      ? DSColors.emerald600
                      : DSColors.darkBorderGlass,
              width: _isFocused ? 2 : 1,
            ),
            color: DSColors.darkSurfaceGlass,
          ),
          child: TextFormField(
            controller: widget.controller,
            initialValue: widget.initialValue,
            focusNode: _focusNode,
            enabled: widget.enabled,
            readOnly: widget.readOnly,
            obscureText: widget.obscureText,
            maxLines: widget.obscureText ? 1 : widget.maxLines,
            minLines: widget.minLines,
            maxLength: widget.maxLength,
            keyboardType: widget.keyboardType,
            textInputAction: widget.textInputAction,
            textCapitalization: widget.textCapitalization,
            inputFormatters: widget.inputFormatters,
            validator: widget.validator,
            onChanged: widget.onChanged,
            onFieldSubmitted: widget.onSubmitted,
            onTap: widget.onTap,
            autofocus: widget.autofocus,
            style: DSTypography.bodyMedium.copyWith(
              color: widget.enabled
                  ? DSColors.darkTextPrimary
                  : DSColors.darkTextDisabled,
            ),
            decoration: InputDecoration(
              hintText: widget.hint,
              hintStyle: DSTypography.bodyMedium.copyWith(
                color: DSColors.darkTextTertiary,
              ),
              prefixIcon: widget.prefixIcon,
              suffixIcon: widget.suffixIcon,
              contentPadding: DSSpacing.inputPadding,
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
              errorBorder: InputBorder.none,
              focusedErrorBorder: InputBorder.none,
              counterText: '',
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: DSSpacing.xs),
          Row(
            children: [
              const Icon(
                Icons.error_outline,
                size: 14,
                color: DSColors.red600,
              ),
              const SizedBox(width: DSSpacing.xxs),
              Expanded(
                child: Text(
                  widget.errorText!,
                  style: DSTypography.caption.copyWith(
                    color: DSColors.red600,
                  ),
                ),
              ),
            ],
          ),
        ] else if (widget.helperText != null) ...[
          const SizedBox(height: DSSpacing.xs),
          Text(
            widget.helperText!,
            style: DSTypography.caption.copyWith(
              color: DSColors.darkTextSecondary,
            ),
          ),
        ],
      ],
    );
  }
}
