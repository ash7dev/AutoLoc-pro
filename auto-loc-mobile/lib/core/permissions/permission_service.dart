import 'package:permission_handler/permission_handler.dart';

/// Service pour gérer les permissions de l'application
/// Gestion contextuelle : demande uniquement quand nécessaire
class PermissionService {
  /// Demande la permission de localisation
  Future<PermissionResult> requestLocation({String? rationale}) async {
    final status = await Permission.location.request();
    return _handlePermissionStatus(
      status,
      Permission.location,
      rationale: rationale ??
          'AutoLoc a besoin d\'accéder à votre localisation pour trouver les véhicules proches de vous.',
    );
  }

  /// Demande la permission caméra
  Future<PermissionResult> requestCamera({String? rationale}) async {
    final status = await Permission.camera.request();
    return _handlePermissionStatus(
      status,
      Permission.camera,
      rationale: rationale ??
          'AutoLoc a besoin d\'accéder à votre caméra pour prendre des photos de vos documents.',
    );
  }

  /// Demande la permission photos/galerie
  Future<PermissionResult> requestPhotos({String? rationale}) async {
    final status = await Permission.photos.request();
    return _handlePermissionStatus(
      status,
      Permission.photos,
      rationale: rationale ??
          'AutoLoc a besoin d\'accéder à vos photos pour sélectionner des images.',
    );
  }

  /// Demande la permission notifications
  Future<PermissionResult> requestNotifications({String? rationale}) async {
    final status = await Permission.notification.request();
    return _handlePermissionStatus(
      status,
      Permission.notification,
      rationale: rationale ??
          'AutoLoc a besoin d\'envoyer des notifications pour vous tenir informé de vos réservations.',
    );
  }

  /// Vérifie le statut d'une permission sans la demander
  Future<PermissionStatus> checkLocation() async {
    return await Permission.location.status;
  }

  Future<PermissionStatus> checkCamera() async {
    return await Permission.camera.status;
  }

  Future<PermissionStatus> checkPhotos() async {
    return await Permission.photos.status;
  }

  Future<PermissionStatus> checkNotifications() async {
    return await Permission.notification.status;
  }

  /// Vérifie si une permission est accordée
  Future<bool> isLocationGranted() async {
    final status = await checkLocation();
    return status.isGranted;
  }

  Future<bool> isCameraGranted() async {
    final status = await checkCamera();
    return status.isGranted;
  }

  Future<bool> isPhotosGranted() async {
    final status = await checkPhotos();
    return status.isGranted;
  }

  Future<bool> isNotificationsGranted() async {
    final status = await checkNotifications();
    return status.isGranted;
  }

  /// Ouvre les paramètres de l'application
  Future<bool> openAppSettings() async {
    return await openAppSettings();
  }

  /// Gère le statut d'une permission et retourne un résultat
  PermissionResult _handlePermissionStatus(
    PermissionStatus status,
    Permission permission, {
    required String rationale,
  }) {
    switch (status) {
      case PermissionStatus.granted:
      case PermissionStatus.limited:
        return PermissionResult.granted();

      case PermissionStatus.denied:
        return PermissionResult.denied(
          rationale: rationale,
          canAskAgain: true,
        );

      case PermissionStatus.permanentlyDenied:
      case PermissionStatus.restricted:
        return PermissionResult.permanentlyDenied(
          rationale: rationale,
        );

      default:
        return PermissionResult.denied(
          rationale: rationale,
          canAskAgain: true,
        );
    }
  }

  /// Demande plusieurs permissions en même temps
  Future<Map<Permission, PermissionStatus>> requestMultiple(
    List<Permission> permissions,
  ) async {
    return await permissions.request();
  }

  /// Vérifie plusieurs permissions
  Future<Map<Permission, PermissionStatus>> checkMultiple(
    List<Permission> permissions,
  ) async {
    final Map<Permission, PermissionStatus> statuses = {};
    for (final permission in permissions) {
      statuses[permission] = await permission.status;
    }
    return statuses;
  }

  /// Demande les permissions nécessaires pour créer une réservation
  /// (Localisation optionnelle, Notifications recommandées)
  Future<bool> requestBookingPermissions() async {
    // Pour l'instant, juste les notifications
    final notifResult = await requestNotifications(
      rationale:
          'Activez les notifications pour être informé de l\'état de vos réservations.',
    );

    // On ne bloque pas si refusé
    return true;
  }

  /// Demande les permissions nécessaires pour le KYC
  /// (Caméra pour prendre les photos de documents)
  Future<bool> requestKycPermissions() async {
    final cameraResult = await requestCamera(
      rationale:
          'Autorisez l\'accès à la caméra pour prendre des photos de vos documents d\'identité.',
    );

    final photosResult = await requestPhotos(
      rationale:
          'Autorisez l\'accès à vos photos pour sélectionner vos documents d\'identité.',
    );

    // Au moins une des deux doit être accordée
    return cameraResult.isGranted || photosResult.isGranted;
  }

  /// Demande les permissions nécessaires pour rechercher des véhicules proches
  Future<bool> requestSearchNearbyPermissions() async {
    final locationResult = await requestLocation(
      rationale:
          'Autorisez l\'accès à votre position pour trouver les véhicules disponibles près de vous.',
    );

    return locationResult.isGranted;
  }
}

/// Résultat d'une demande de permission
class PermissionResult {
  final PermissionResultType type;
  final String? rationale;
  final bool canAskAgain;

  const PermissionResult._({
    required this.type,
    this.rationale,
    this.canAskAgain = false,
  });

  factory PermissionResult.granted() {
    return const PermissionResult._(type: PermissionResultType.granted);
  }

  factory PermissionResult.denied({
    required String rationale,
    bool canAskAgain = true,
  }) {
    return PermissionResult._(
      type: PermissionResultType.denied,
      rationale: rationale,
      canAskAgain: canAskAgain,
    );
  }

  factory PermissionResult.permanentlyDenied({required String rationale}) {
    return PermissionResult._(
      type: PermissionResultType.permanentlyDenied,
      rationale: rationale,
      canAskAgain: false,
    );
  }

  bool get isGranted => type == PermissionResultType.granted;
  bool get isDenied => type == PermissionResultType.denied;
  bool get isPermanentlyDenied => type == PermissionResultType.permanentlyDenied;
}

/// Type de résultat de permission
enum PermissionResultType {
  granted,
  denied,
  permanentlyDenied,
}
