import 'dart:async';

import 'package:connectivity_plus/connectivity_plus.dart';

/// Service pour gérer la connectivité réseau
/// Expose un Stream<bool> pour écouter les changements de connexion
class ConnectivityService {
  final Connectivity _connectivity;
  final StreamController<bool> _connectionStatusController;

  ConnectivityService({
    Connectivity? connectivity,
  })  : _connectivity = connectivity ?? Connectivity(),
        _connectionStatusController = StreamController<bool>.broadcast();

  /// Stream qui émet true si connecté, false sinon
  Stream<bool> get onConnectivityChanged => _connectionStatusController.stream;

  /// Vérifie l'état actuel de la connexion
  Future<bool> get isOnline async {
    final result = await _connectivity.checkConnectivity();
    return _isConnected(result);
  }

  /// Initialise l'écoute des changements de connectivité
  Future<void> initialize() async {
    // Émettre l'état initial
    final initialStatus = await isOnline;
    _connectionStatusController.add(initialStatus);

    // Écouter les changements
    _connectivity.onConnectivityChanged.listen((ConnectivityResult result) {
      final isConnected = _isConnected(result);
      _connectionStatusController.add(isConnected);
    });
  }

  /// Détermine si le type de connexion est "connecté"
  bool _isConnected(ConnectivityResult result) {
    return result != ConnectivityResult.none;
  }

  /// Dispose le service
  void dispose() {
    _connectionStatusController.close();
  }
}
