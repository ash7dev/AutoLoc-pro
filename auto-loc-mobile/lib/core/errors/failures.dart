/// Failures métier (couche domain/presentation)
/// Les failures sont retournées par les repositories et consommées par les ViewModels

sealed class Failure {
  final String message;
  final String? userMessage;
  final String? code;

  const Failure({
    required this.message,
    this.userMessage,
    this.code,
  });

  /// Message à afficher à l'utilisateur
  String get displayMessage => userMessage ?? message;
}

// ============================================================================
// Network Failures
// ============================================================================

class NetworkFailure extends Failure {
  const NetworkFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory NetworkFailure.offline() => const NetworkFailure(
        message: 'No internet connection',
        userMessage: 'Aucune connexion Internet. Veuillez vérifier votre connexion.',
        code: 'OFFLINE',
      );

  factory NetworkFailure.timeout() => const NetworkFailure(
        message: 'Request timeout',
        userMessage: 'La requête a pris trop de temps. Veuillez réessayer.',
        code: 'TIMEOUT',
      );

  factory NetworkFailure.unknown() => const NetworkFailure(
        message: 'Unknown network error',
        userMessage: 'Une erreur réseau est survenue. Veuillez réessayer.',
        code: 'NETWORK_ERROR',
      );
}

// ============================================================================
// Server Failures
// ============================================================================

class ServerFailure extends Failure {
  final int? statusCode;

  const ServerFailure({
    required super.message,
    super.userMessage,
    super.code,
    this.statusCode,
  });

  factory ServerFailure.internal() => const ServerFailure(
        message: 'Internal server error',
        userMessage: 'Une erreur serveur est survenue. Veuillez réessayer plus tard.',
        code: 'SERVER_ERROR',
        statusCode: 500,
      );

  factory ServerFailure.maintenance() => const ServerFailure(
        message: 'Server under maintenance',
        userMessage: 'Le serveur est en maintenance. Veuillez réessayer plus tard.',
        code: 'MAINTENANCE',
        statusCode: 503,
      );
}

// ============================================================================
// Auth Failures
// ============================================================================

class AuthFailure extends Failure {
  const AuthFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory AuthFailure.unauthorized() => const AuthFailure(
        message: 'Unauthorized',
        userMessage: 'Vous devez vous connecter pour effectuer cette action.',
        code: 'UNAUTHORIZED',
      );

  factory AuthFailure.invalidCredentials() => const AuthFailure(
        message: 'Invalid credentials',
        userMessage: 'Email ou mot de passe incorrect.',
        code: 'INVALID_CREDENTIALS',
      );

  factory AuthFailure.tokenExpired() => const AuthFailure(
        message: 'Token expired',
        userMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
        code: 'TOKEN_EXPIRED',
      );

  factory AuthFailure.forbidden() => const AuthFailure(
        message: 'Forbidden',
        userMessage: "Vous n'avez pas les permissions pour effectuer cette action.",
        code: 'FORBIDDEN',
      );

  factory AuthFailure.invalidOtp() => const AuthFailure(
        message: 'Invalid OTP',
        userMessage: 'Le code OTP est invalide ou expiré.',
        code: 'INVALID_OTP',
      );

  factory AuthFailure.phoneAlreadyExists() => const AuthFailure(
        message: 'Phone already exists',
        userMessage: 'Ce numéro de téléphone est déjà utilisé.',
        code: 'PHONE_EXISTS',
      );

  factory AuthFailure.emailAlreadyExists() => const AuthFailure(
        message: 'Email already exists',
        userMessage: 'Cet email est déjà utilisé.',
        code: 'EMAIL_EXISTS',
      );
}

// ============================================================================
// Validation Failures
// ============================================================================

class ValidationFailure extends Failure {
  final Map<String, dynamic>? errors;

  const ValidationFailure(
    String message, {
    String? userMessage,
    this.errors,
  }) : super(
          message: message,
          userMessage: userMessage,
          code: 'VALIDATION_ERROR',
        );

  factory ValidationFailure.fromMap(Map<String, dynamic> errors) {
    final firstError = errors.values.first;
    return ValidationFailure(
      'Validation error',
      userMessage: firstError is List ? firstError.first.toString() : firstError.toString(),
      errors: errors,
    );
  }
}

// ============================================================================
// Not Found Failures
// ============================================================================

class NotFoundFailure extends Failure {
  const NotFoundFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory NotFoundFailure.resource(String resource) => NotFoundFailure(
        message: '$resource not found',
        userMessage: 'La ressource demandée est introuvable.',
        code: 'NOT_FOUND',
      );

  factory NotFoundFailure.vehicle() => const NotFoundFailure(
        message: 'Vehicle not found',
        userMessage: 'Ce véhicule est introuvable.',
        code: 'VEHICLE_NOT_FOUND',
      );

  factory NotFoundFailure.booking() => const NotFoundFailure(
        message: 'Booking not found',
        userMessage: 'Cette réservation est introuvable.',
        code: 'BOOKING_NOT_FOUND',
      );
}

// ============================================================================
// Cache Failures
// ============================================================================

class CacheFailure extends Failure {
  const CacheFailure({
    required super.message,
    super.userMessage,
  }) : super(code: 'CACHE_ERROR');

  factory CacheFailure.read() => const CacheFailure(
        message: 'Failed to read from cache',
        userMessage: 'Erreur lors de la lecture du cache.',
      );

  factory CacheFailure.write() => const CacheFailure(
        message: 'Failed to write to cache',
        userMessage: 'Erreur lors de l\'écriture dans le cache.',
      );
}

// ============================================================================
// Storage Failures
// ============================================================================

class StorageFailure extends Failure {
  const StorageFailure({
    required super.message,
    super.userMessage,
  }) : super(code: 'STORAGE_ERROR');

  factory StorageFailure.read() => const StorageFailure(
        message: 'Failed to read from storage',
        userMessage: 'Erreur lors de la lecture du stockage.',
      );

  factory StorageFailure.write() => const StorageFailure(
        message: 'Failed to write to storage',
        userMessage: 'Erreur lors de l\'écriture dans le stockage.',
      );
}

// ============================================================================
// Permission Failures
// ============================================================================

class PermissionFailure extends Failure {
  final String permission;

  const PermissionFailure({
    required super.message,
    super.userMessage,
    required this.permission,
  }) : super(code: 'PERMISSION_DENIED');

  factory PermissionFailure.location() => const PermissionFailure(
        message: 'Location permission denied',
        userMessage:
            'L\'accès à votre localisation est nécessaire pour cette fonctionnalité.',
        permission: 'location',
      );

  factory PermissionFailure.camera() => const PermissionFailure(
        message: 'Camera permission denied',
        userMessage: 'L\'accès à la caméra est nécessaire pour prendre une photo.',
        permission: 'camera',
      );

  factory PermissionFailure.photos() => const PermissionFailure(
        message: 'Photos permission denied',
        userMessage: 'L\'accès à vos photos est nécessaire pour sélectionner une image.',
        permission: 'photos',
      );

  factory PermissionFailure.notifications() => const PermissionFailure(
        message: 'Notifications permission denied',
        userMessage:
            'L\'accès aux notifications est nécessaire pour recevoir des alertes.',
        permission: 'notifications',
      );
}

// ============================================================================
// Business Logic Failures (Métier)
// ============================================================================

class BookingFailure extends Failure {
  const BookingFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory BookingFailure.vehicleUnavailable() => const BookingFailure(
        message: 'Vehicle unavailable',
        userMessage: 'Ce véhicule n\'est pas disponible pour ces dates.',
        code: 'VEHICLE_UNAVAILABLE',
      );

  factory BookingFailure.invalidPeriod() => const BookingFailure(
        message: 'Invalid booking period',
        userMessage: 'La période de réservation est invalide.',
        code: 'INVALID_PERIOD',
      );

  factory BookingFailure.minAdvanceNotMet() => const BookingFailure(
        message: 'Minimum advance booking not met',
        userMessage: 'Vous devez réserver au moins 2 heures à l\'avance.',
        code: 'MIN_ADVANCE_NOT_MET',
      );

  factory BookingFailure.cannotCancel() => const BookingFailure(
        message: 'Cannot cancel booking',
        userMessage: 'Cette réservation ne peut plus être annulée.',
        code: 'CANNOT_CANCEL',
      );
}

class WalletFailure extends Failure {
  const WalletFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory WalletFailure.insufficientBalance() => const WalletFailure(
        message: 'Insufficient balance',
        userMessage: 'Solde insuffisant pour effectuer cette opération.',
        code: 'INSUFFICIENT_BALANCE',
      );

  factory WalletFailure.withdrawalLimitExceeded() => const WalletFailure(
        message: 'Withdrawal limit exceeded',
        userMessage: 'Le montant dépasse la limite de retrait autorisée.',
        code: 'WITHDRAWAL_LIMIT_EXCEEDED',
      );

  factory WalletFailure.minimumAmountNotMet() => const WalletFailure(
        message: 'Minimum withdrawal amount not met',
        userMessage: 'Le montant minimum de retrait est de 5 000 FCFA.',
        code: 'MIN_AMOUNT_NOT_MET',
      );
}

class PaymentFailure extends Failure {
  const PaymentFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory PaymentFailure.failed() => const PaymentFailure(
        message: 'Payment failed',
        userMessage: 'Le paiement a échoué. Veuillez réessayer.',
        code: 'PAYMENT_FAILED',
      );

  factory PaymentFailure.cancelled() => const PaymentFailure(
        message: 'Payment cancelled',
        userMessage: 'Le paiement a été annulé.',
        code: 'PAYMENT_CANCELLED',
      );

  factory PaymentFailure.timeout() => const PaymentFailure(
        message: 'Payment timeout',
        userMessage: 'Le paiement a pris trop de temps. Veuillez réessayer.',
        code: 'PAYMENT_TIMEOUT',
      );
}

class KycFailure extends Failure {
  const KycFailure({
    required super.message,
    super.userMessage,
    super.code,
  });

  factory KycFailure.rejected() => const KycFailure(
        message: 'KYC rejected',
        userMessage: 'Votre vérification d\'identité a été rejetée.',
        code: 'KYC_REJECTED',
      );

  factory KycFailure.pending() => const KycFailure(
        message: 'KYC pending',
        userMessage: 'Votre vérification d\'identité est en cours de traitement.',
        code: 'KYC_PENDING',
      );

  factory KycFailure.uploadFailed() => const KycFailure(
        message: 'Upload failed',
        userMessage: 'L\'upload du document a échoué. Veuillez réessayer.',
        code: 'UPLOAD_FAILED',
      );
}

// ============================================================================
// Parse Failure
// ============================================================================

class ParseFailure extends Failure {
  const ParseFailure({
    required super.message,
    super.userMessage,
  }) : super(code: 'PARSE_ERROR');

  factory ParseFailure.json() => const ParseFailure(
        message: 'Failed to parse JSON',
        userMessage: 'Erreur lors du traitement des données.',
      );
}

// ============================================================================
// Unknown Failure
// ============================================================================

class UnknownFailure extends Failure {
  const UnknownFailure([String? message])
      : super(
          message: message ?? 'Unknown error',
          userMessage: 'Une erreur inattendue est survenue.',
          code: 'UNKNOWN_ERROR',
        );
}

// ============================================================================
// Additional Failures
// ============================================================================

class UnauthorizedFailure extends Failure {
  const UnauthorizedFailure(String message)
      : super(
          message: message,
          userMessage: 'Votre session a expiré. Veuillez vous reconnecter.',
          code: 'UNAUTHORIZED',
        );
}

class ForbiddenFailure extends Failure {
  const ForbiddenFailure(String message)
      : super(
          message: message,
          userMessage: "Vous n'avez pas les permissions pour effectuer cette action.",
          code: 'FORBIDDEN',
        );
}

class UnexpectedFailure extends Failure {
  const UnexpectedFailure(String message)
      : super(
          message: message,
          userMessage: 'Une erreur inattendue est survenue.',
          code: 'UNEXPECTED_ERROR',
        );
}
