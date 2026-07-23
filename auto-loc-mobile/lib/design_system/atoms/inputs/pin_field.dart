import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../tokens/ds_colors.dart';
import '../../tokens/ds_spacing.dart';
import '../../tokens/ds_radius.dart';
import '../../tokens/ds_duration.dart';

/// PIN Field
/// Champ pour saisir un code PIN (4 ou 6 digits)
/// Affiche des points au lieu des chiffres pour la sécurité
class PinField extends StatefulWidget {
  const PinField({
    super.key,
    required this.onCompleted,
    this.onChanged,
    this.length = 4,
    this.hasError = false,
    this.obscurePin = true,
  });

  final ValueChanged<String> onCompleted;
  final ValueChanged<String>? onChanged;
  final int length;
  final bool hasError;
  final bool obscurePin;

  @override
  State<PinField> createState() => _PinFieldState();
}

class _PinFieldState extends State<PinField> {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  String _pinValue = '';

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

    // Construire la valeur PIN complète
    _pinValue = _controllers.map((c) => c.text).join();

    // Notifier le changement
    widget.onChanged?.call(_pinValue);

    // Si tous les champs sont remplis, notifier la complétion
    if (_pinValue.length == widget.length) {
      widget.onCompleted(_pinValue);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: List.generate(widget.length, (index) {
        return Padding(
          padding: EdgeInsets.symmetric(
            horizontal: index == 0 || index == widget.length - 1
                ? 0
                : DSSpacing.xs,
          ),
          child: _buildPinBox(index),
        );
      }),
    );
  }

  Widget _buildPinBox(int index) {
    final bool hasFocus = _focusNodes[index].hasFocus;
    final bool hasValue = _controllers[index].text.isNotEmpty;

    return AnimatedContainer(
      duration: DSDuration.fastDuration,
      width: 56,
      height: 64,
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
      alignment: Alignment.center,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Affichage du point ou du chiffre
          if (hasValue)
            widget.obscurePin
                ? Container(
                    width: 12,
                    height: 12,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: DSColors.emerald600,
                    ),
                  )
                : Text(
                    _controllers[index].text,
                    style: const TextStyle(
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                      color: DSColors.darkTextPrimary,
                    ),
                  ),

          // TextField invisible pour la saisie
          Opacity(
            opacity: 0,
            child: TextField(
              controller: _controllers[index],
              focusNode: _focusNodes[index],
              textAlign: TextAlign.center,
              keyboardType: TextInputType.number,
              maxLength: 1,
              decoration: const InputDecoration(
                border: InputBorder.none,
                counterText: '',
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
            ),
          ),
        ],
      ),
    );
  }

  /// Efface tous les champs
  void clear() {
    for (final controller in _controllers) {
      controller.clear();
    }
    _focusNodes[0].requestFocus();
    _pinValue = '';
  }

  /// Définit la valeur PIN
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

    _pinValue = value;
  }
}
