import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens/ds_colors.dart';
import '../../tokens/ds_typography.dart';
import '../../tokens/ds_spacing.dart';
import '../../tokens/ds_radius.dart';
import '../../tokens/ds_duration.dart';

/// OTP Field
/// Champ pour saisir un code OTP (6 digits)
/// Affiche 6 cases individuelles avec focus automatique
class OtpField extends StatefulWidget {
  const OtpField({
    super.key,
    required this.onCompleted,
    this.onChanged,
    this.length = 6,
    this.hasError = false,
  });

  final ValueChanged<String> onCompleted;
  final ValueChanged<String>? onChanged;
  final int length;
  final bool hasError;

  @override
  State<OtpField> createState() => _OtpFieldState();
}

class _OtpFieldState extends State<OtpField> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  String _otpValue = '';

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(
      widget.length,
      (_) => TextEditingController(),
    );
    _focusNodes = List.generate(
      widget.length,
      (_) => FocusNode(),
    );
  }

  @override
  void dispose() {
    for (final controller in _controllers) {
      controller.dispose();
    }
    for (final node in _focusNodes) {
      node.dispose();
    }
    super.dispose();
  }

  void _onChanged(int index, String value) {
    // Si une valeur est saisie
    if (value.isNotEmpty) {
      // Passer au champ suivant
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        // Dernier champ, on retire le focus
        _focusNodes[index].unfocus();
      }
    }

    // Construire la valeur OTP complète
    _otpValue = _controllers.map((c) => c.text).join();

    // Notifier le changement
    widget.onChanged?.call(_otpValue);

    // Si tous les champs sont remplis, notifier la complétion
    if (_otpValue.length == widget.length) {
      widget.onCompleted(_otpValue);
    }
  }

  void _onBackspace(int index) {
    // Si le champ est vide et qu'on appuie sur backspace
    if (_controllers[index].text.isEmpty && index > 0) {
      // Revenir au champ précédent
      _focusNodes[index - 1].requestFocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: List.generate(widget.length, (index) {
        return _buildOtpBox(index);
      }),
    );
  }

  Widget _buildOtpBox(int index) {
    final bool hasFocus = _focusNodes[index].hasFocus;

    return AnimatedContainer(
      duration: DSDuration.fastDuration,
      width: 48,
      height: 56,
      decoration: BoxDecoration(
        borderRadius: DSRadius.borderRadiusMd,
        border: Border.all(
          color: widget.hasError
              ? DSColors.red600
              : hasFocus
                  ? DSColors.emerald600
                  : DSColors.darkBorderGlass,
          width: hasFocus ? 2 : 1,
        ),
        color: DSColors.darkSurfaceGlass,
      ),
      child: TextField(
        controller: _controllers[index],
        focusNode: _focusNodes[index],
        textAlign: TextAlign.center,
        keyboardType: TextInputType.number,
        maxLength: 1,
        style: DSTypography.h4.copyWith(
          color: DSColors.darkTextPrimary,
          fontFamily: DSTypography.fontFamilyMono,
        ),
        decoration: const InputDecoration(
          border: InputBorder.none,
          counterText: '',
          contentPadding: EdgeInsets.zero,
        ),
        inputFormatters: [
          FilteringTextInputFormatter.digitsOnly,
        ],
        onChanged: (value) => _onChanged(index, value),
        onTap: () {
          // Sélectionner le texte existant au focus
          if (_controllers[index].text.isNotEmpty) {
            _controllers[index].selection = TextSelection(
              baseOffset: 0,
              extentOffset: _controllers[index].text.length,
            );
          }
        },
        onEditingComplete: () {
          // Ne rien faire, le focus est géré dans onChanged
        },
        onSubmitted: (_) {
          // Ne rien faire, le focus est géré dans onChanged
        },
      ),
    );
  }

  /// Efface tous les champs
  void clear() {
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();
    _otpValue = '';
  }

  /// Définit la valeur OTP
  void setValue(String value) {
    if (value.length > widget.length) {
      value = value.substring(0, widget.length);
    }

    for (var i = 0; i < widget.length; i++) {
      if (i < value.length) {
        _controllers[i].text = value[i];
      } else {
        _controllers[i].clear();
      }
    }

    _otpValue = value;
  }
}
