import 'dart:ui';

import 'package:flutter/material.dart';

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF16A34A);
const Color _emeraldPale = Color(0xFFA7F3D0);
const Color _ink = Color(0xFF06110C);

/// Premium Hero Banner — v2
///
/// Direction : "coffre-fort" premium. La bannière ne se contente plus
/// d'un gradient plat sur la photo : un panneau sombre à bord diagonal
/// "protège" le texte comme un volet de sécurité, un badge de confiance
/// pulse doucement pour rappeler la promesse anti-arnaque, et le CTA
/// reçoit un reflet animé pour signaler que c'est LE geste à faire.
///
/// **Usage :**
/// ```dart
/// PremiumHeroBanner(
///   title: 'Fini les Scam',
///   subtitle: 'Location de voiture 100% sécurisée',
///   ctaText: 'Louer maintenant',
///   onTap: () => context.push(Routes.explore),
/// )
/// ```
class PremiumHeroBanner extends StatefulWidget {
  const PremiumHeroBanner({
    super.key,
    this.title = 'Fini les Scam',
    this.subtitle = 'Location de voiture 100% sécurisée',
    this.ctaPrefix = 'Kaay',
    this.ctaHighlight = 'Louer',
    this.badgeText = 'Paiement vérifié',
    this.imagePath = 'assets/images/banner-premium.png',
    this.onTap,
  });

  final String title;
  final String subtitle;

  /// Premier mot du CTA (ton neutre, blanc). Ex: "Kaay".
  final String ctaPrefix;

  /// Mot mis en avant, toujours en émeraude. Ex: "Louer".
  final String ctaHighlight;
  final String badgeText;
  final String imagePath;
  final VoidCallback? onTap;

  @override
  State<PremiumHeroBanner> createState() => _PremiumHeroBannerState();
}

class _PremiumHeroBannerState extends State<PremiumHeroBanner>
    with TickerProviderStateMixin {
  late final AnimationController _pulseController;
  late final AnimationController _shimmerController;
  late final AnimationController _arrowController;
  bool _pressed = false;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    )..repeat(reverse: true);

    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2600),
    )..repeat();

    // Petit aller-retour de la flèche du CTA, façon "clique-moi".
    _arrowController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 850),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _shimmerController.dispose();
    _arrowController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: AnimatedScale(
        scale: _pressed ? 0.98 : 1.0,
        duration: const Duration(milliseconds: 120),
        curve: Curves.easeOut,
        child: Material(
          color: Colors.transparent,
          borderRadius: BorderRadius.circular(26),
          child: InkWell(
            onTap: widget.onTap,
            onTapDown: (_) => setState(() => _pressed = true),
            onTapUp: (_) => setState(() => _pressed = false),
            onTapCancel: () => setState(() => _pressed = false),
            borderRadius: BorderRadius.circular(26),
            splashColor: _emerald.withOpacity(0.15),
            child: Container(
              height: 212,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(26),
                boxShadow: [
                  BoxShadow(
                    color: _emerald.withOpacity(0.22),
                    blurRadius: 34,
                    offset: const Offset(0, 12),
                  ),
                  BoxShadow(
                    color: Colors.black.withOpacity(0.35),
                    blurRadius: 18,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Stack(
                children: [
                  // Image de fond
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(26),
                      child: Image.asset(
                        widget.imagePath,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) {
                          return Container(
                            decoration: const BoxDecoration(
                              gradient: LinearGradient(
                                begin: Alignment.topLeft,
                                end: Alignment.bottomRight,
                                colors: [Color(0xFF1F2937), Color(0xFF0B0F0D)],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
                  ),

                  // Voile diagonal "volet de sécurité" — remplace le simple
                  // gradient horizontal par une forme qui isole nettement
                  // la zone de lecture, comme un panneau qu'on entrouvre.
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(26),
                      child: ClipPath(
                        clipper: _DiagonalShutterClipper(),
                        child: Container(
                          decoration: BoxDecoration(
                            gradient: LinearGradient(
                              begin: Alignment.centerLeft,
                              end: Alignment.centerRight,
                              colors: [
                                _ink.withOpacity(0.97),
                                _ink.withOpacity(0.88),
                              ],
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),

                  // Liseré émeraude fin qui souligne le bord du volet
                  Positioned.fill(
                    child: ClipRRect(
                      borderRadius: BorderRadius.circular(26),
                      child: CustomPaint(
                        painter: _ShutterEdgePainter(),
                      ),
                    ),
                  ),

                  // Glow ambiant, respire lentement (badge de confiance)
                  AnimatedBuilder(
                    animation: _pulseController,
                    builder: (context, child) {
                      final t = Curves.easeInOut.transform(_pulseController.value);
                      return Positioned(
                        top: -50 + (t * 6),
                        left: -40,
                        child: ImageFiltered(
                          imageFilter: ImageFilter.blur(sigmaX: 70, sigmaY: 70),
                          child: Container(
                            width: 170 + (t * 20),
                            height: 170 + (t * 20),
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              color: _emerald.withOpacity(0.28 + t * 0.12),
                            ),
                          ),
                        ),
                      );
                    },
                  ),

                  // Glow secondaire bas-droite pour équilibrer la voiture
                  Positioned(
                    bottom: -70,
                    right: -50,
                    child: ImageFiltered(
                      imageFilter: ImageFilter.blur(sigmaX: 90, sigmaY: 90),
                      child: Container(
                        width: 220,
                        height: 220,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: _emeraldDeep.withOpacity(0.22),
                        ),
                      ),
                    ),
                  ),

                  // Bordure glassmorphism
                  Positioned.fill(
                    child: Container(
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(26),
                        border: Border.all(
                          color: Colors.white.withOpacity(0.14),
                          width: 1.4,
                        ),
                      ),
                    ),
                  ),

                  // Contenu texte
                  Positioned(
                    left: 0,
                    top: 0,
                    bottom: 0,
                    right: 128,
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.center,
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          // Badge de confiance — le signal anti-arnaque
                          AnimatedBuilder(
                            animation: _pulseController,
                            builder: (context, child) {
                              final t = Curves.easeInOut.transform(_pulseController.value);
                              return Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 5,
                                ),
                                decoration: BoxDecoration(
                                  color: _emerald.withOpacity(0.12),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: _emerald.withOpacity(0.4 + t * 0.3),
                                    width: 1,
                                  ),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.verified_rounded,
                                      size: 13,
                                      color: _emeraldPale.withOpacity(0.9 + t * 0.1),
                                    ),
                                    const SizedBox(width: 5),
                                    Text(
                                      widget.badgeText,
                                      style: const TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.w700,
                                        color: _emeraldPale,
                                        letterSpacing: 0.1,
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            },
                          ),
                          const SizedBox(height: 10),

                          // Titre avec gradient
                          ShaderMask(
                            blendMode: BlendMode.srcIn,
                            shaderCallback: (bounds) => const LinearGradient(
                              begin: Alignment.topLeft,
                              end: Alignment.bottomRight,
                              colors: [Colors.white, _emerald],
                              stops: [0.15, 1.0],
                            ).createShader(bounds),
                            child: Text(
                              widget.title,
                              style: const TextStyle(
                                fontSize: 28,
                                fontWeight: FontWeight.w900,
                                letterSpacing: -1.0,
                                height: 1.02,
                              ),
                            ),
                          ),
                          const SizedBox(height: 7),

                          // Sous-titre
                          Text(
                            widget.subtitle,
                            style: TextStyle(
                              fontSize: 12.5,
                              fontWeight: FontWeight.w600,
                              color: Colors.white.withOpacity(0.78),
                              height: 1.3,
                              letterSpacing: -0.1,
                            ),
                          ),
                          const SizedBox(height: 15),

                          // CTA "Kaay Louer" — verre clair, "Louer" toujours
                          // en émeraude, flèche qui invite au clic, halo qui
                          // respire pour capter l'œil sans être criard.
                          AnimatedBuilder(
                            animation: _pulseController,
                            builder: (context, child) {
                              final t = Curves.easeInOut.transform(_pulseController.value);
                              return Container(
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(14),
                                  boxShadow: [
                                    BoxShadow(
                                      color: _emerald.withOpacity(0.28 + t * 0.22),
                                      blurRadius: 16 + t * 8,
                                      spreadRadius: t * 0.5,
                                    ),
                                  ],
                                ),
                                child: child,
                              );
                            },
                            child: ClipRRect(
                              borderRadius: BorderRadius.circular(14),
                              child: BackdropFilter(
                                filter: ImageFilter.blur(sigmaX: 12, sigmaY: 12),
                                child: Container(
                                  decoration: BoxDecoration(
                                    color: Colors.white.withOpacity(0.94),
                                    borderRadius: BorderRadius.circular(14),
                                    border: Border.all(
                                      color: _emerald.withOpacity(0.55),
                                      width: 1.2,
                                    ),
                                  ),
                                  child: Stack(
                                    children: [
                                      Padding(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: 18,
                                          vertical: 11,
                                        ),
                                        child: Row(
                                          mainAxisSize: MainAxisSize.min,
                                          children: [
                                            Text(
                                              '${widget.ctaPrefix} ',
                                              style: const TextStyle(
                                                color: _ink,
                                                fontSize: 14.5,
                                                fontWeight: FontWeight.w700,
                                                letterSpacing: -0.2,
                                              ),
                                            ),
                                            Text(
                                              widget.ctaHighlight,
                                              style: const TextStyle(
                                                color: _emeraldDeep,
                                                fontSize: 14.5,
                                                fontWeight: FontWeight.w900,
                                                letterSpacing: -0.2,
                                              ),
                                            ),
                                            const SizedBox(width: 7),
                                            AnimatedBuilder(
                                              animation: _arrowController,
                                              builder: (context, child) {
                                                final dx = Curves.easeInOut
                                                        .transform(_arrowController.value) *
                                                    5;
                                                return Transform.translate(
                                                  offset: Offset(dx, 0),
                                                  child: child,
                                                );
                                              },
                                              child: const Icon(
                                                Icons.arrow_forward_rounded,
                                                color: _emeraldDeep,
                                                size: 17,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                      // Reflet qui balaie le verre
                                      Positioned.fill(
                                        child: AnimatedBuilder(
                                          animation: _shimmerController,
                                          builder: (context, child) {
                                            return ShaderMask(
                                              blendMode: BlendMode.srcATop,
                                              shaderCallback: (bounds) {
                                                final dx = _shimmerController.value;
                                                return LinearGradient(
                                                  begin: Alignment(-1.6 + dx * 3.2, -1),
                                                  end: Alignment(-0.8 + dx * 3.2, 1),
                                                  colors: [
                                                    _emerald.withOpacity(0.0),
                                                    _emerald.withOpacity(0.16),
                                                    _emerald.withOpacity(0.0),
                                                  ],
                                                  stops: const [0.35, 0.5, 0.65],
                                                ).createShader(bounds);
                                              },
                                              child: Container(color: Colors.transparent),
                                            );
                                          },
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}

/// Découpe diagonale façon "volet" — plus dynamique qu'un simple
/// gradient horizontal, elle donne au panneau sombre un bord vivant
/// qui vient mordre légèrement sur la voiture.
class _DiagonalShutterClipper extends CustomClipper<Path> {
  @override
  Path getClip(Size size) {
    final w = size.width;
    final h = size.height;
    final path = Path()
      ..moveTo(0, 0)
      ..lineTo(w * 0.66, 0)
      ..lineTo(w * 0.50, h)
      ..lineTo(0, h)
      ..close();
    return path;
  }

  @override
  bool shouldReclip(covariant CustomClipper<Path> oldClipper) => false;
}

/// Trace le liseré émeraude qui souligne le bord diagonal du volet.
class _ShutterEdgePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;
    final path = Path()
      ..moveTo(w * 0.66, 0)
      ..lineTo(w * 0.50, h);

    final paint = Paint()
      ..shader = const LinearGradient(
        begin: Alignment.topCenter,
        end: Alignment.bottomCenter,
        colors: [_emerald, _emeraldDeep],
      ).createShader(Rect.fromLTWH(0, 0, w, h))
      ..strokeWidth = 1.6
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawPath(path, paint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}