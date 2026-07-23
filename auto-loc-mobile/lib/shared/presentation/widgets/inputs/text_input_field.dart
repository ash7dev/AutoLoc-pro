import 'package:flutter/material.dart';

/// TextInputField
///
/// Champ de saisie texte générique avec label et validation.
class TextInputField extends StatefulWidget {
  final String label;
  final String hint;
  final String initialValue;
  final ValueChanged<String> onChanged;
  final bool enabled;
  final TextInputType keyboardType;
  final TextCapitalization textCapitalization;
  final int? maxLength;
  final bool obscureText;
  final Widget? suffixIcon;

  const TextInputField({
    super.key,
    required this.label,
    this.hint = '',
    this.initialValue = '',
    required this.onChanged,
    this.enabled = true,
    this.keyboardType = TextInputType.text,
    this.textCapitalization = TextCapitalization.none,
    this.maxLength,
    this.obscureText = false,
    this.suffixIcon,
  });

  @override
  State<TextInputField> createState() => _TextInputFieldState();
}

class _TextInputFieldState extends State<TextInputField> {
  late TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : const Color(0xFF0D0D0D),
          ),
        ),
        const SizedBox(height: 8),
        TextField(
          controller: _controller,
          enabled: widget.enabled,
          keyboardType: widget.keyboardType,
          textCapitalization: widget.textCapitalization,
          maxLength: widget.maxLength,
          obscureText: widget.obscureText,
          style: TextStyle(
            fontSize: 16,
            color: isDark ? Colors.white : const Color(0xFF0D0D0D),
          ),
          decoration: InputDecoration(
            hintText: widget.hint,
            hintStyle: const TextStyle(
              color: Color(0xFF94A3B8),
            ),
            suffixIcon: widget.suffixIcon,
            counterText: '',
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: _controller.text.isNotEmpty
                    ? const Color(0xFF10B981)
                    : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
                width: 1.5,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: const BorderSide(
                color: Color(0xFF10B981),
                width: 2,
              ),
            ),
            disabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(16),
              borderSide: BorderSide(
                color: isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0),
                width: 1.5,
              ),
            ),
            contentPadding: const EdgeInsets.symmetric(
              horizontal: 16,
              vertical: 16,
            ),
          ),
          onChanged: widget.onChanged,
        ),
      ],
    );
  }
}
