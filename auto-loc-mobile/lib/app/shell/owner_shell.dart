import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../design_system/organisms/owner_bottom_navigation.dart';

/// Owner Shell - Navigation pour les propriétaires avec Bottom Nav
///
/// Wrapper pour les 5 écrans principaux accessibles via le Bottom Nav:
/// - Dashboard (index 0)
/// - Fleet (index 1)
/// - Reservations (index 2)
/// - Wallet (index 3)
/// - Settings (index 4)
///
/// Utilisé avec ShellRoute dans le router
class OwnerShell extends StatefulWidget {
  const OwnerShell({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<OwnerShell> createState() => _OwnerShellState();
}

class _OwnerShellState extends State<OwnerShell> {
  void _onTabTapped(int index) {
    // Navigation vers la route correspondante
    switch (index) {
      case 0:
        context.go('/owner/dashboard');
        break;
      case 1:
        context.go('/owner/fleet');
        break;
      case 2:
        context.go('/owner/reservations');
        break;
      case 3:
        context.go('/owner/wallet');
        break;
      case 4:
        context.go('/owner/settings');
        break;
    }
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    if (location.startsWith('/owner/dashboard')) {
      return 0;
    } else if (location.startsWith('/owner/fleet')) {
      return 1;
    } else if (location.startsWith('/owner/reservations')) {
      return 2;
    } else if (location.startsWith('/owner/wallet')) {
      return 3;
    } else if (location.startsWith('/owner/settings')) {
      return 4;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: OwnerBottomNavigation(
        currentIndex: _getCurrentIndex(context),
        onTap: _onTabTapped,
      ),
    );
  }
}
