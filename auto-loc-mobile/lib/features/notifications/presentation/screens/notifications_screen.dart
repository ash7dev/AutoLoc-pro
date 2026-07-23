import 'package:flutter/material.dart';

import '../../../../shared/presentation/widgets/app_bars/tenant_app_bar.dart';

/// Notifications Screen
///
/// Affiche toutes les notifications de l'utilisateur:
/// - Réservations
/// - Promotions
/// - Rappels
/// - Messages système
class NotificationsScreen extends StatelessWidget {
  const NotificationsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: const TenantAppBar(
        mode: TenantAppBarMode.notifications,
        title: 'Notifications',
        showBackButton: true,
      ),
      body: SafeArea(
        child: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.notifications_rounded,
                size: 80,
                color: Colors.white.withOpacity(0.3),
              ),
              const SizedBox(height: 24),
              const Text(
                'Aucune notification',
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w700,
                  color: Colors.white,
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Vous serez notifié ici des mises à jour importantes',
                style: TextStyle(
                  fontSize: 16,
                  color: Colors.white.withOpacity(0.5),
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
