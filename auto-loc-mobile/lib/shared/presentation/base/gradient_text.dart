import 'package:flutter/material.dart';

/// Gradient Text - Texte avec dégradé premium
///
/// Reproduit l'effet ShaderMask utilisé dans l'onboarding
/// pour un rendu professionnel blanc → émeraude
///
/// **Usage :**
/// ```dart
/// GradientText(
///   'Mes Réservations',
///   gradient: LinearGradient(
///     colors: [Colors.white, Color(0xFF34D399)],
///   ),
///   style: TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
/// )
/// ```
class GradientText extends StatelessWidget {
  const GradientText(
    this.text, {
    super.key,
    required this.gradient,
    this.style,
    this.textAlign,
    this.maxLines,
    this.overflow,
  });

  final String text;
  final Gradient gradient;
  final TextStyle? style;
  final TextAlign? textAlign;
  final int? maxLines;
  final TextOverflow? overflow;

  @override
  Widget build(BuildContext context) {
    return ShaderMask(
      blendMode: BlendMode.srcIn,
      shaderCallback: (bounds) => gradient.createShader(bounds),
      child: Text(
        text,
        style: style?.copyWith(color: Colors.white) ??
            const TextStyle(color: Colors.white),
        textAlign: textAlign,
        maxLines: maxLines,
        overflow: overflow,
      ),
    );
  }
}
