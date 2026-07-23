import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../widgets/trust_badges.dart';
import '../widgets/onboarding_cta_button.dart';

/// Page 3 - Confiance
///
/// Message: Paiement sécurisé • Contrat automatique • Véhicules vérifiés
/// Visuel: 3 badges animés + logos Wave/Orange Money
/// CTA: "Commencer" → Navigate to Home
/// Lien: "Connexion" → Navigate to Login
class TrustPage extends StatelessWidget {
  final VoidCallback onComplete;

  const TrustPage({
    super.key,
    required this.onComplete,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 40),

          // 3 badges de confiance
          const TrustBadges(animate: true),

          const SizedBox(height: 32),

          // Logos de paiement Wave/Orange Money
          _buildPaymentLogos(),

          const SizedBox(height: 48),

          // Titre
          const Text(
            'Confiance',
            style: TextStyle(
              fontSize: 32,
              fontWeight: FontWeight.w800,
              color: Colors.white,
              letterSpacing: 0.5,
            ),
          ),

          const SizedBox(height: 16),

          // Description
          Text(
            'Paiement sécurisé • Contrat automatique\nVéhicules vérifiés.',
            textAlign: TextAlign.center,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w400,
              color: Colors.white.withOpacity(0.9),
              height: 1.6,
              letterSpacing: 0.3,
            ),
          ),

          const SizedBox(height: 40),

          // CTA Button
          OnboardingCtaButton(
            text: 'Commencer',
            onPressed: onComplete,
          ),

          const SizedBox(height: 20),

          // Lien Connexion
          TextButton(
            onPressed: () {
              // Marquer onboarding comme vu avant de naviguer
              onComplete();
              // Puis naviguer vers login
              context.go('/login');
            },
            child: Text(
              'Connexion',
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: Colors.white.withOpacity(0.9),
                decoration: TextDecoration.underline,
                decorationColor: Colors.white.withOpacity(0.9),
              ),
            ),
          ),

          const SizedBox(height: 40),
        ],
      ),
    );
  }

  Widget _buildPaymentLogos() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        // Wave logo
        _buildPaymentLogoImage('assets/images/logowave.png'),
        const SizedBox(width: 20),
        // Orange Money logo
        _buildPaymentLogoImage('assets/images/logoOm.png'),
      ],
    );
  }

  Widget _buildPaymentLogoImage(String assetPath) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.2),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: Colors.white.withOpacity(0.3),
          width: 1,
        ),
      ),
      child: Image.asset(
        assetPath,
        height: 32,
        fit: BoxFit.contain,
      ),
    );
  }
}
