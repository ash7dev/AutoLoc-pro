import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:go_router/go_router.dart';

import '../widgets/onboarding_background.dart';
import '../widgets/page_indicator.dart';
import '../pages/discover_page.dart';
import '../pages/reserve_page.dart';
import '../pages/trust_page.dart';

/// Onboarding Screen avec 3 pages swipables
///
/// Flow:
/// - Page 1: Découvrir (carte véhicule)
/// - Page 2: Réserver (trajet GPS)
/// - Page 3: Confiance (badges + CTA)
///
/// Features:
/// - Swipe horizontal avec physics
/// - Skip button (top right)
/// - Page indicator
/// - Save hasSeenOnboarding = true
/// - Navigate to Home après completion
class OnboardingScreen extends ConsumerStatefulWidget {
  const OnboardingScreen({super.key});

  @override
  ConsumerState<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends ConsumerState<OnboardingScreen> {
  final PageController _pageController = PageController();
  int _currentPage = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  void _onPageChanged(int page) {
    setState(() {
      _currentPage = page;
    });
  }

  Future<void> _completeOnboarding() async {
    // Sauvegarder hasSeenOnboarding = true
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('hasSeenOnboarding', true);

    if (!mounted) return;

    // Navigate to Home
    context.go('/home');
  }

  void _skip() {
    // Aller directement à la dernière page
    _pageController.animateToPage(
      2,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          // PageView avec background animé
          PageView(
            controller: _pageController,
            onPageChanged: _onPageChanged,
            physics: const BouncingScrollPhysics(),
            children: [
              // Page 1 - Découvrir
              OnboardingBackground(
                pageIndex: 0,
                child: const DiscoverPage(),
              ),

              // Page 2 - Réserver
              OnboardingBackground(
                pageIndex: 1,
                child: const ReservePage(),
              ),

              // Page 3 - Confiance
              OnboardingBackground(
                pageIndex: 2,
                child: TrustPage(
                  onComplete: _completeOnboarding,
                ),
              ),
            ],
          ),

          // Skip button (top right) - masqué sur la dernière page
          if (_currentPage < 2)
            Positioned(
              top: MediaQuery.of(context).padding.top + 16,
              right: 24,
              child: TextButton(
                onPressed: _skip,
                style: TextButton.styleFrom(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 20,
                    vertical: 10,
                  ),
                  backgroundColor: Colors.white.withOpacity(0.2),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
                child: const Text(
                  'Passer',
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ),

          // Page Indicator (bottom) - masqué sur la dernière page (car CTA button présent)
          if (_currentPage < 2)
            Positioned(
              bottom: 60,
              left: 0,
              right: 0,
              child: PageIndicator(
                currentPage: _currentPage,
                totalPages: 3,
              ),
            ),
        ],
      ),
    );
  }
}
