import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// TODO: Décommenter quand AppLogger sera implémenté
// import '../core/logging/app_logger.dart';

/// App Provider Observer
/// Observer pour logger les changements d'état dans les providers Riverpod
class AppProviderObserver extends ProviderObserver {
  @override
  void didAddProvider(
    ProviderBase<Object?> provider,
    Object? value,
    ProviderContainer container,
  ) {
    // TODO: Utiliser AppLogger quand il sera implémenté
    debugPrint('Provider added: ${provider.name ?? provider.runtimeType}');
  }

  @override
  void didUpdateProvider(
    ProviderBase<Object?> provider,
    Object? previousValue,
    Object? newValue,
    ProviderContainer container,
  ) {
    // TODO: Utiliser AppLogger quand il sera implémenté
    debugPrint('Provider updated: ${provider.name ?? provider.runtimeType}');
  }

  @override
  void didDisposeProvider(
    ProviderBase<Object?> provider,
    ProviderContainer container,
  ) {
    // TODO: Utiliser AppLogger quand il sera implémenté
    debugPrint('Provider disposed: ${provider.name ?? provider.runtimeType}');
  }

  @override
  void providerDidFail(
    ProviderBase<Object?> provider,
    Object error,
    StackTrace stackTrace,
    ProviderContainer container,
  ) {
    // TODO: Utiliser AppLogger quand il sera implémenté
    debugPrint('Provider failed: ${provider.name ?? provider.runtimeType} - Error: $error');
  }
}
