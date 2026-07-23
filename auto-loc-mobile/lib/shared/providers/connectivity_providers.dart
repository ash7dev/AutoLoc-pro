import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/network/connectivity_service.dart';
import '../../core/di/core_injection.dart';

/// Provider pour le ConnectivityService (singleton)
final connectivityServiceProvider = Provider<ConnectivityService>((ref) {
  return CoreInjection.sl<ConnectivityService>();
});

/// Provider pour le stream de connectivité
final connectivityStreamProvider = StreamProvider<bool>((ref) {
  final connectivityService = ref.watch(connectivityServiceProvider);
  return connectivityService.onConnectivityChanged;
});

/// Provider pour savoir si l'appareil est en ligne
final isOnlineProvider = Provider<bool>((ref) {
  final connectivityAsync = ref.watch(connectivityStreamProvider);
  return connectivityAsync.maybeWhen(
    data: (isOnline) => isOnline,
    orElse: () => true, // Par défaut, on considère qu'on est en ligne
  );
});

/// Provider pour savoir si l'appareil est hors ligne
final isOfflineProvider = Provider<bool>((ref) {
  return !ref.watch(isOnlineProvider);
});
