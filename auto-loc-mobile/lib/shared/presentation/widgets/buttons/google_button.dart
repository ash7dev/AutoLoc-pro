import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// GoogleButton
///
/// Bouton "Se connecter avec Google" avec logo officiel.
class GoogleButton extends StatelessWidget {
  final VoidCallback? onPressed;
  final bool isLoading;
  final String label;

  const GoogleButton({
    super.key,
    this.onPressed,
    this.isLoading = false,
    this.label = 'Continuer avec Google',
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity,
      height: 56,
      child: OutlinedButton(
        onPressed: isLoading ? null : onPressed,
        style: OutlinedButton.styleFrom(
          backgroundColor: Colors.white,
          foregroundColor: const Color(0xFF0D0D0D),
          side: const BorderSide(
            color: Color(0xFFE2E8F0),
            width: 1.5,
          ),
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16),
          ),
          elevation: 0,
        ),
        child: isLoading
            ? const SizedBox(
                width: 24,
                height: 24,
                child: CircularProgressIndicator(
                  strokeWidth: 2.5,
                  valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF64748B)),
                ),
              )
            : Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  // Google logo SVG
                  _GoogleLogo(),
                  const SizedBox(width: 12),
                  Text(
                    label,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.3,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
}

/// Google Logo Widget
class _GoogleLogo extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return CustomPaint(
      size: const Size(24, 24),
      painter: _GoogleLogoPainter(),
    );
  }
}

/// Google Logo Painter
/// Dessine le logo Google officiel avec les 4 couleurs
class _GoogleLogoPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final double width = size.width;
    final double height = size.height;

    // Blue path
    final bluePath = Path()
      ..moveTo(width * 0.9583, height * 0.5104)
      ..cubicTo(width * 0.9583, height * 0.4771, width * 0.9542, height * 0.4438,
          width * 0.9458, height * 0.4104)
      ..lineTo(width * 0.5, height * 0.4104)
      ..lineTo(width * 0.5, height * 0.6104)
      ..lineTo(width * 0.7583, height * 0.6104)
      ..cubicTo(width * 0.7333, height * 0.6938, width * 0.6833, height * 0.7646,
          width * 0.6167, height * 0.8104)
      ..lineTo(width * 0.6167, height * 0.8104)
      ..lineTo(width * 0.6167, height * 0.9563)
      ..lineTo(width * 0.6167, height * 0.9563)
      ..cubicTo(width * 0.8083, height * 0.9104, width * 0.9583, height * 0.7313,
          width * 0.9583, height * 0.5104);

    final bluePaint = Paint()
      ..color = const Color(0xFF4285F4)
      ..style = PaintingStyle.fill;

    canvas.drawPath(bluePath, bluePaint);

    // Green path
    final greenPath = Path()
      ..moveTo(width * 0.5, height * 0.9583)
      ..cubicTo(width * 0.6292, height * 0.9583, width * 0.7458, height * 0.9146,
          width * 0.8333, height * 0.8438)
      ..lineTo(width * 0.8333, height * 0.8438)
      ..lineTo(width * 0.6167, height * 0.8104)
      ..lineTo(width * 0.6167, height * 0.8104)
      ..cubicTo(width * 0.5708, height * 0.8354, width * 0.5167, height * 0.8521,
          width * 0.4583, height * 0.8521)
      ..cubicTo(width * 0.3333, height * 0.8521, width * 0.2208, height * 0.7979,
          width * 0.1542, height * 0.7104)
      ..lineTo(width * 0.1542, height * 0.7104)
      ..lineTo(width * 0.0417, height * 0.7896)
      ..lineTo(width * 0.0417, height * 0.7896)
      ..cubicTo(width * 0.1667, height * 0.9104, width * 0.3208, height * 0.9583,
          width * 0.5, height * 0.9583);

    final greenPaint = Paint()
      ..color = const Color(0xFF34A853)
      ..style = PaintingStyle.fill;

    canvas.drawPath(greenPath, greenPaint);

    // Yellow path
    final yellowPath = Path()
      ..moveTo(width * 0.8333, height * 0.8438)
      ..cubicTo(width * 0.9208, height * 0.7729, width * 0.9583, height * 0.6479,
          width * 0.9583, height * 0.5104)
      ..lineTo(width * 0.9583, height * 0.5104)
      ..lineTo(width * 0.5, height * 0.5104)
      ..lineTo(width * 0.5, height * 0.8521)
      ..cubicTo(width * 0.5583, height * 0.8521, width * 0.6125, height * 0.8354,
          width * 0.6583, height * 0.8104)
      ..lineTo(width * 0.6583, height * 0.8104)
      ..lineTo(width * 0.8333, height * 0.8438);

    final yellowPaint = Paint()
      ..color = const Color(0xFFFBBC05)
      ..style = PaintingStyle.fill;

    canvas.drawPath(yellowPath, yellowPaint);

    // Red path
    final redPath = Path()
      ..moveTo(width * 0.0417, height * 0.2104)
      ..lineTo(width * 0.1542, height * 0.2896)
      ..cubicTo(width * 0.2208, height * 0.2021, width * 0.3333, height * 0.1479,
          width * 0.4583, height * 0.1479)
      ..cubicTo(width * 0.5417, height * 0.1479, width * 0.6167, height * 0.1813,
          width * 0.6708, height * 0.2313)
      ..lineTo(width * 0.8375, height * 0.0688)
      ..cubicTo(width * 0.7458, height * 0.0104, width * 0.6042, height * -0.0417,
          width * 0.4583, height * 0.0417)
      ..cubicTo(width * 0.3208, height * 0.0417, width * 0.1667, height * 0.0896,
          width * 0.0417, height * 0.2104);

    final redPaint = Paint()
      ..color = const Color(0xFFEA4335)
      ..style = PaintingStyle.fill;

    canvas.drawPath(redPath, redPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}
