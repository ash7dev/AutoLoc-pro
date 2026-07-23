import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../core/navigation/routes.dart';
import 'buttons/primary_button.dart';

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF059669);

/// A reusable placeholder shown when authentication is required.
class PlaceholderFeature {
  const PlaceholderFeature({
    required this.icon,
    required this.label,
  });

  final IconData icon;
  final String label;
}

/// A simple auth-gated placeholder card used by protected screens.
class AuthRequiredPlaceholder extends StatelessWidget {
  const AuthRequiredPlaceholder({
    required this.icon,
    required this.heading,
    required this.subtitle,
    super.key,
    this.features = const [],
    this.onLoginPressed,
    this.buttonLabel,
  });

  final IconData icon;
  final String heading;
  final String subtitle;
  final List<PlaceholderFeature> features;
  final VoidCallback? onLoginPressed;
  final String? buttonLabel;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 24),
        child: Container(
          width: double.infinity,
          constraints: const BoxConstraints(maxWidth: 520),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              // Icône
              SizedBox(
                width: 132,
                height: 132,
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    Container(
                      width: 88,
                      height: 88,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: _emerald.withOpacity(0.12),
                        border: Border.all(
                          color: _emerald.withOpacity(0.3),
                          width: 1,
                        ),
                      ),
                      child: Icon(icon, size: 40, color: _emerald),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 8),

              // Carte glass — fond noir/blanc translucide, sans halo vert
              // en forme de rectangle autour (moins premium qu'un glow
              // circulaire décoratif discret).
              ClipRRect(
                borderRadius: BorderRadius.circular(24),
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    padding: const EdgeInsets.all(28),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.4),
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          Colors.white.withOpacity(0.07),
                          Colors.white.withOpacity(0.03),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(24),
                      border: Border.all(
                        color: Colors.white.withOpacity(0.10),
                        width: 1,
                      ),
                    ),
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          heading,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.w800,
                            fontSize: 22,
                            letterSpacing: -0.3,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 10),
                        Text(
                          subtitle,
                          textAlign: TextAlign.center,
                          style: theme.textTheme.bodyMedium?.copyWith(
                            color: Colors.white.withOpacity(0.55),
                            height: 1.5,
                            fontSize: 14,
                          ),
                        ),

                        if (features.isNotEmpty) ...[
                          const SizedBox(height: 24),
                          // Une seule carte avec des lignes séparées par
                          // des dividers, au lieu d'une carte bordée par
                          // feature (moins répétitif visuellement).
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 14,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.white.withOpacity(0.04),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(
                                color: Colors.white.withOpacity(0.07),
                              ),
                            ),
                            child: Column(
                              children: List.generate(features.length, (i) {
                                final feature = features[i];
                                final isLast = i == features.length - 1;
                                return Column(
                                  children: [
                                    Padding(
                                      padding: const EdgeInsets.symmetric(
                                        vertical: 12,
                                      ),
                                      child: Row(
                                        children: [
                                          Container(
                                            width: 32,
                                            height: 32,
                                            decoration: BoxDecoration(
                                              color:
                                                  _emerald.withOpacity(0.14),
                                              borderRadius:
                                                  BorderRadius.circular(9),
                                            ),
                                            child: Icon(
                                              feature.icon,
                                              size: 16,
                                              color: _emerald,
                                            ),
                                          ),
                                          const SizedBox(width: 12),
                                          Expanded(
                                            child: Text(
                                              feature.label,
                                              style: theme.textTheme.bodyMedium
                                                  ?.copyWith(
                                                color: Colors.white
                                                    .withOpacity(0.85),
                                                fontWeight: FontWeight.w500,
                                                fontSize: 14,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    if (!isLast)
                                      Divider(
                                        color: Colors.white.withOpacity(0.06),
                                        height: 1,
                                      ),
                                  ],
                                );
                              }),
                            ),
                          ),
                        ],

                        const SizedBox(height: 26),

                        // Bouton — un seul glow (pas deux empilées),
                        // texte noir cohérent avec les autres CTA
                        // émeraude de l'app (filtre, recherche).
                        Container(
                          width: double.infinity,
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(16),
                            boxShadow: [
                              BoxShadow(
                                color: _emerald.withOpacity(0.3),
                                blurRadius: 20,
                                offset: const Offset(0, 8),
                              ),
                            ],
                          ),
                          child: PrimaryButton(
                            label: buttonLabel ?? 'Se connecter',
                            onPressed:
                                onLoginPressed ?? () => context.push(Routes.login),
                            backgroundColor: _emerald,
                            textColor: Colors.black,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}