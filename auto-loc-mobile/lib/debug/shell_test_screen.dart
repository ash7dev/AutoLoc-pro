import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Shell Test Screen - Pour tester la navigation entre les shells
///
/// TEMPORAIRE - À supprimer en production
///
/// Permet de naviguer facilement entre:
/// - MainShell (Guest/Tenant)
/// - OwnerShell
class ShellTestScreen extends StatelessWidget {
  const ShellTestScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('🧪 Test Navigation Shells'),
        centerTitle: true,
      ),
      body: ListView(
        padding: const EdgeInsets.all(24),
        children: [
          const Text(
            'Shells disponibles:',
            style: TextStyle(
              fontSize: 20,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 24),

          // MainShell
          _ShellCard(
            title: 'MainShell',
            subtitle: 'Guest / Tenant',
            icon: Icons.home_rounded,
            color: Colors.blue,
            tabs: const [
              'Home',
              'Explore',
              'Mes Réservations',
              'Profil',
            ],
            onTap: () => context.go('/home'),
          ),

          const SizedBox(height: 16),

          // OwnerShell
          _ShellCard(
            title: 'OwnerShell',
            subtitle: 'Propriétaire',
            icon: Icons.business_rounded,
            color: const Color(0xFF10B981), // Emerald
            tabs: const [
              'Dashboard',
              'Flotte',
              'Réservations',
              'Portefeuille',
              'Paramètres',
            ],
            onTap: () => context.go('/owner/dashboard'),
          ),

          const SizedBox(height: 32),

          const Divider(),

          const SizedBox(height: 16),

          const Text(
            'Routes rapides:',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),

          const SizedBox(height: 16),

          _QuickRoute(
            label: 'Splash',
            route: '/',
            icon: Icons.water_drop,
          ),
          _QuickRoute(
            label: 'Onboarding',
            route: '/onboarding',
            icon: Icons.swipe,
          ),
        ],
      ),
    );
  }
}

class _ShellCard extends StatelessWidget {
  const _ShellCard({
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.color,
    required this.tabs,
    required this.onTap,
  });

  final String title;
  final String subtitle;
  final IconData icon;
  final Color color;
  final List<String> tabs;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: color.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Icon(icon, color: color, size: 32),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          title,
                          style: const TextStyle(
                            fontSize: 18,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Text(
                          subtitle,
                          style: TextStyle(
                            fontSize: 14,
                            color: Colors.grey.shade600,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const Icon(Icons.arrow_forward_ios, size: 20),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(),
              const SizedBox(height: 12),
              Wrap(
                spacing: 8,
                runSpacing: 8,
                children: tabs
                    .map(
                      (tab) => Chip(
                        label: Text(
                          tab,
                          style: const TextStyle(fontSize: 12),
                        ),
                        backgroundColor: Colors.grey.shade200,
                      ),
                    )
                    .toList(),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _QuickRoute extends StatelessWidget {
  const _QuickRoute({
    required this.label,
    required this.route,
    required this.icon,
  });

  final String label;
  final String route;
  final IconData icon;

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(label),
      trailing: const Icon(Icons.chevron_right),
      onTap: () => context.go(route),
    );
  }
}
