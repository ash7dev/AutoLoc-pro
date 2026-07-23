import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import '../../base/gradient_text.dart';
import '../currency/currency_selector_button.dart';
import '../notifications/notification_button.dart';
import '../profile/profile_button.dart';
import '../search/explore_search_bar.dart';
import '../search/filter_button.dart';

/// Tenant AppBar - Header contextuel pour l'application tenant
///
/// **5 modes d'affichage :**
/// - [TenantAppBarMode.home] → Logo + Devise + Notifications + Profil
/// - [TenantAppBarMode.explore] → SearchBar + FilterButton
/// - [TenantAppBarMode.bookings] → Titre avec dégradé
/// - [TenantAppBarMode.settings] → Titre avec dégradé
/// - [TenantAppBarMode.notifications] → Titre avec dégradé
///
/// **Glassmorphism réel :**
/// L'ancien header était un simple aplat `Color(0xFF0D0D0D)` — pas de flou,
/// donc pas de "verre", juste un gris uni à l'écran. Ici on utilise un vrai
/// `BackdropFilter` (flou du contenu qui défile derrière) sur un fond noir
/// pur translucide. Pour que l'effet soit visible, le `Scaffold` qui
/// utilise cette AppBar doit avoir `extendBodyBehindAppBar: true`.
///
/// **Séparation des responsabilités :**
/// Chaque composant (CurrencySelector, NotificationButton, etc.)
/// est dans son propre fichier pour une maintenance facile.
enum TenantAppBarMode {
  home,
  explore,
  bookings,
  settings,
  notifications,
}

class TenantAppBar extends StatelessWidget implements PreferredSizeWidget {
  const TenantAppBar({
    super.key,
    required this.mode,
    this.title,
    this.onSearchChanged,
    this.showBackButton = false,
  });

  final TenantAppBarMode mode;
  final String? title;
  final ValueChanged<String>? onSearchChanged;
  final bool showBackButton;

  @override
  Size get preferredSize => const Size.fromHeight(80);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      systemOverlayStyle: SystemUiOverlayStyle.light,
      backgroundColor: Colors.transparent,
      elevation: 0,
      automaticallyImplyLeading: false,
      leading: showBackButton
          ? IconButton(
              icon: const Icon(Icons.arrow_back, color: Colors.white),
              onPressed: () => Navigator.of(context).pop(),
            )
          : null,
      titleSpacing: showBackButton ? 0 : 16,
      toolbarHeight: 80,
      flexibleSpace: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 24, sigmaY: 24),
          child: Container(
            decoration: BoxDecoration(
              // Noir pur et translucide — c'est le flou derrière qui crée
              // la matière "verre", pas une teinte grise.
              color: Colors.black.withOpacity(0.72),
            ),
          ),
        ),
      ),
      title: _buildContent(context),
    );
  }

  Widget _buildContent(BuildContext context) {
    switch (mode) {
      case TenantAppBarMode.home:
        return _HomeAppBar();

      case TenantAppBarMode.explore:
        return _ExploreAppBar(
          onSearchChanged: onSearchChanged,
        );

      case TenantAppBarMode.bookings:
        return _TitleAppBar(title: title ?? 'Mes Réservations');

      case TenantAppBarMode.settings:
        return _TitleAppBar(title: title ?? 'Paramètres');

      case TenantAppBarMode.notifications:
        return _TitleAppBar(title: title ?? 'Notifications');
    }
  }
}

// ============================================================================
// HOME MODE - Logo + Devise + Notifications + Profil
// ============================================================================

class _HomeAppBar extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // Logo
        Image.asset(
          'assets/images/logofondnoir.png', // TODO: Theme-aware
          height: 48,
          fit: BoxFit.contain,
        ),

        const Spacer(),

        // Actions à droite
        const CurrencySelectorButton(),
        const SizedBox(width: 10),
        const NotificationButton(),
        const SizedBox(width: 10),
        const ProfileButton(),
      ],
    );
  }
}

// ============================================================================
// EXPLORE MODE - SearchBar + FilterButton
// ============================================================================

class _ExploreAppBar extends StatelessWidget {
  const _ExploreAppBar({
    required this.onSearchChanged,
  });

  final ValueChanged<String>? onSearchChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        // SearchBar (prend la majorité de l'espace)
        Expanded(
          child: ExploreSearchBar(
            onChanged: onSearchChanged,
          ),
        ),

        const SizedBox(width: 12),

        // Bouton Filtre (compact) - gère son propre compteur via provider
        const FilterButton(),
      ],
    );
  }
}

// ============================================================================
// TITLE MODE - Bookings & Settings
// ============================================================================

class _TitleAppBar extends StatelessWidget {
  const _TitleAppBar({required this.title});

  final String title;

  @override
  Widget build(BuildContext context) {
    return GradientText(
      title,
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [
          Colors.white,
          Colors.white,
          Color(0xFF34D399), // Emerald
        ],
        stops: [0.0, 0.55, 1.0],
      ),
      style: const TextStyle(
        fontSize: 24,
        fontWeight: FontWeight.w900,
        letterSpacing: -0.5,
        height: 1.2,
      ),
    );
  }
}