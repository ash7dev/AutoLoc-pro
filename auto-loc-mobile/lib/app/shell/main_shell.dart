import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

import '../../design_system/organisms/app_bottom_navigation.dart';

/// Main Shell - Navigation principale avec Bottom Nav
///
/// Wrapper pour les 4 écrans principaux accessibles via le Bottom Nav:
/// - Home (index 0)
/// - Explore (index 1)
/// - My Bookings (index 2)
/// - Profile (index 3)
///
/// Utilisé avec ShellRoute dans le router
class MainShell extends StatefulWidget {
  const MainShell({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  State<MainShell> createState() => _MainShellState();
}

class _MainShellState extends State<MainShell> {
  void _onTabTapped(int index) {
    // Navigation vers la route correspondante
    switch (index) {
      case 0:
        context.go('/home');
        break;
      case 1:
        context.go('/explore');
        break;
      case 2:
        context.go('/my-bookings');
        break;
      case 3:
        context.go('/profile');
        break;
    }
  }

  int _getCurrentIndex(BuildContext context) {
    final location = GoRouterState.of(context).matchedLocation;

    if (location == '/home') {
      return 0;
    } else if (location == '/explore') {
      return 1;
    } else if (location == '/my-bookings') {
      return 2;
    } else if (location == '/profile') {
      return 3;
    }
    return 0;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: widget.child,
      bottomNavigationBar: AppBottomNavigation(
        currentIndex: _getCurrentIndex(context),
        onTap: _onTabTapped,
      ),
    );
  }
}
