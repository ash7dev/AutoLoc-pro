import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';

import 'view_effect.dart';

/// **EffectHandler** - Mixin pour gérer les ViewEffects dans les Screens
///
/// ## Responsabilité
/// Écouter le stream d'effects du ViewModel et dispatcher chaque effect
/// vers l'action appropriée (navigation, snackbar, dialog, etc.).
///
/// ## Usage
///
/// ### 1. Ajouter le mixin au Screen
/// ```dart
/// class WalletScreen extends ConsumerStatefulWidget {
///   @override
///   ConsumerState<WalletScreen> createState() => _WalletScreenState();
/// }
///
/// class _WalletScreenState extends ConsumerState<WalletScreen>
///     with EffectHandler { // ← Ajouter le mixin
///   // ...
/// }
/// ```
///
/// ### 2. Écouter les effects dans initState
/// ```dart
/// @override
/// void initState() {
///   super.initState();
///   listenToEffects(walletEffectsProvider); // ← Écouter les effects
/// }
/// ```
///
/// ### 3. Le mixin s'occupe du reste
/// Tous les effects émis par le ViewModel seront automatiquement gérés:
/// - Navigation → go_router
/// - Snackbar → ScaffoldMessenger
/// - Dialog → showDialog
/// - Clipboard → Clipboard.setData
/// - URL → url_launcher
/// - etc.
///
/// ## Exemple complet
///
/// ```dart
/// // ViewModel
/// class WalletViewModel extends BaseViewModel<WalletData> {
///   Future<void> requestWithdrawal() async {
///     // ... logic
///     showSuccess('Retrait demandé'); // ← Émet un effect
///     navigateTo('/wallet/history'); // ← Émet un effect
///   }
/// }
///
/// // Screen
/// class WalletScreen extends ConsumerStatefulWidget {
///   @override
///   ConsumerState<WalletScreen> createState() => _WalletScreenState();
/// }
///
/// class _WalletScreenState extends ConsumerState<WalletScreen>
///     with EffectHandler {
///   @override
///   void initState() {
///     super.initState();
///     listenToEffects(walletEffectsProvider);
///   }
///
///   @override
///   Widget build(BuildContext context) {
///     // ... UI
///   }
/// }
/// ```
///
/// ## Personnalisation
///
/// Si vous avez besoin de gérer un effect de manière spécifique,
/// surchargez `handleEffect`:
///
/// ```dart
/// @override
/// void handleEffect(BuildContext context, ViewEffect effect) {
///   effect.maybeMap(
///     showDialog: (e) {
///       // Custom dialog implementation
///       _showCustomDialog(context, e);
///     },
///     orElse: () => super.handleEffect(context, effect), // Default handling
///   );
/// }
/// ```
mixin EffectHandler<T extends ConsumerStatefulWidget> on ConsumerState<T> {
  /// Subscription au stream d'effects
  StreamSubscription<ViewEffect>? _effectsSubscription;

  /// **Écouter les effects du ViewModel**
  ///
  /// À appeler dans `initState()` du Screen.
  ///
  /// Paramètres:
  /// - `effectProvider`: Le StreamProvider des effects du ViewModel
  ///
  /// Exemple:
  /// ```dart
  /// @override
  /// void initState() {
  ///   super.initState();
  ///   listenToEffects(walletEffectsProvider);
  /// }
  /// ```
  void listenToEffects(StreamProvider<ViewEffect> effectProvider) {
    // Cancel previous subscription if any
    _effectsSubscription?.cancel();

    // Listen to the effects stream
    final effectsStream = ref.read(effectProvider.stream);

    _effectsSubscription = effectsStream.listen((effect) {
      // Wait for next frame to ensure context is available
      WidgetsBinding.instance.addPostFrameCallback((_) {
        if (mounted) {
          handleEffect(context, effect);
        }
      });
    });
  }

  /// **Dispatcher d'effects**
  ///
  /// Route chaque effect vers l'action appropriée.
  ///
  /// Peut être surchargé pour personnaliser le handling de certains effects.
  ///
  /// Exemple de surcharge:
  /// ```dart
  /// @override
  /// void handleEffect(BuildContext context, ViewEffect effect) {
  ///   effect.maybeMap(
  ///     showSnackbar: (e) => _showCustomSnackbar(context, e),
  ///     orElse: () => super.handleEffect(context, effect),
  ///   );
  /// }
  /// ```
  @protected
  void handleEffect(BuildContext context, ViewEffect effect) {
    effect.when(
      // Navigation
      navigateTo: (route, arguments) => _handleNavigateTo(context, route, arguments),
      navigateBack: (result) => _handleNavigateBack(context, result),
      navigateReplace: (route, arguments) => _handleNavigateReplace(context, route, arguments),

      // Messages
      showSnackbar: (message, type) => _handleShowSnackbar(context, message, type),
      showToast: (message) => _handleShowToast(context, message),
      showDialog: (title, message, confirmText, cancelText) =>
        _handleShowDialog(context, title, message, confirmText, cancelText),
      showBottomSheet: (content) => _handleShowBottomSheet(context, content),

      // System actions
      copyToClipboard: (text) => _handleCopyToClipboard(context, text),
      openUrl: (url) => _handleOpenUrl(url),
      shareText: (text) => _handleShareText(text),
      launchCall: (phone) => _handleLaunchCall(phone),

      // Permissions
      requestPermission: (permission) => _handleRequestPermission(context, permission),
    );
  }

  /// **Cleanup** - Appelé automatiquement par Flutter
  ///
  /// Annule la subscription au stream d'effects.
  @override
  void dispose() {
    _effectsSubscription?.cancel();
    super.dispose();
  }

  // ============================================================================
  // NAVIGATION HANDLERS
  // ============================================================================

  void _handleNavigateTo(BuildContext context, String route, Object? arguments) {
    context.push(route, extra: arguments);
  }

  void _handleNavigateBack(BuildContext context, Object? result) {
    context.pop(result);
  }

  void _handleNavigateReplace(BuildContext context, String route, Object? arguments) {
    context.replace(route, extra: arguments);
  }

  // ============================================================================
  // MESSAGE HANDLERS
  // ============================================================================

  void _handleShowSnackbar(BuildContext context, String message, SnackbarType? type) {
    final snackbarType = type ?? SnackbarType.info;

    // Color based on type
    final backgroundColor = switch (snackbarType) {
      SnackbarType.success => Colors.green.shade600,
      SnackbarType.error => Colors.red.shade600,
      SnackbarType.warning => Colors.orange.shade600,
      SnackbarType.info => Colors.blue.shade600,
    };

    // Icon based on type
    final icon = switch (snackbarType) {
      SnackbarType.success => Icons.check_circle,
      SnackbarType.error => Icons.error,
      SnackbarType.warning => Icons.warning,
      SnackbarType.info => Icons.info,
    };

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(icon, color: Colors.white, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(color: Colors.white),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        margin: const EdgeInsets.all(16),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _handleShowToast(BuildContext context, String message) {
    // For toast, we use a shorter snackbar
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          message,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white),
        ),
        backgroundColor: Colors.black87,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        margin: EdgeInsets.only(
          bottom: MediaQuery.of(context).size.height * 0.8,
          left: 50,
          right: 50,
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _handleShowDialog(BuildContext context, String title, String message, String? confirmText, String? cancelText) {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(title),
        content: Text(message),
        actions: [
          if (cancelText != null)
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: Text(cancelText),
            ),
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: Text(confirmText ?? 'OK'),
          ),
        ],
      ),
    );
  }

  void _handleShowBottomSheet(BuildContext context, String content) {
    showModalBottomSheet<void>(
      context: context,
      builder: (context) => Padding(
        padding: const EdgeInsets.all(16),
        child: Text(content),
      ),
    );
  }

  // ============================================================================
  // SYSTEM ACTION HANDLERS
  // ============================================================================

  void _handleCopyToClipboard(BuildContext context, String text) {
    Clipboard.setData(ClipboardData(text: text));

    // Show confirmation toast
    _handleShowToast(context, 'Copié dans le presse-papier');
  }

  Future<void> _handleOpenUrl(String url) async {
    final uri = Uri.parse(url);

    if (await canLaunchUrl(uri)) {
      await launchUrl(
        uri,
        mode: LaunchMode.externalApplication,
      );
    } else {
      debugPrint('Cannot launch URL: $url');
    }
  }

  Future<void> _handleShareText(String text) async {
    await Share.share(text);
  }

  Future<void> _handleLaunchCall(String phone) async {
    final uri = Uri.parse('tel:$phone');

    if (await canLaunchUrl(uri)) {
      await launchUrl(uri);
    } else {
      debugPrint('Cannot launch call: $phone');
    }
  }

  // ============================================================================
  // PERMISSION HANDLER
  // ============================================================================

  void _handleRequestPermission(BuildContext context, String permission) {
    // TODO: Implement permission request using permission_handler package
    // This is a placeholder - actual implementation depends on permission_handler
    debugPrint('Permission requested: $permission');

    // Example implementation:
    // final permission = Permission.camera;
    // await permission.request();
  }
}
