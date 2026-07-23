import 'dart:async';

import '../storage/secure_storage.dart';
import '../storage/preferences.dart';

/// Service pour gérer la session utilisateur
/// Expose des streams pour écouter les changements d'état d'authentification
class SessionService {
  final SecureStorage _secureStorage;
  final Preferences _preferences;

  // Streams controllers
  final StreamController<AuthState> _authStateController;
  final StreamController<UserSession?> _sessionController;

  SessionService({
    required SecureStorage secureStorage,
    required Preferences preferences,
  })  : _secureStorage = secureStorage,
        _preferences = preferences,
        _authStateController = StreamController<AuthState>.broadcast(),
        _sessionController = StreamController<UserSession?>.broadcast();

  /// Stream de l'état d'authentification
  Stream<AuthState> get authStateStream => _authStateController.stream;

  /// Stream de la session utilisateur
  Stream<UserSession?> get sessionStream => _sessionController.stream;

  /// Session courante (cached)
  UserSession? _currentSession;
  UserSession? get currentSession => _currentSession;

  /// Vérifie si l'utilisateur est connecté
  bool get isAuthenticated => _currentSession != null;

  /// Vérifie si l'utilisateur a complété son profil
  bool get hasCompletedProfile =>
      _currentSession?.profileCompleted ?? false;

  /// Vérifie si le téléphone est vérifié
  bool get isPhoneVerified => _currentSession?.phoneVerified ?? false;

  /// Vérifie si le KYC est vérifié
  bool get isKycVerified =>
      _currentSession?.kycStatus == KycStatus.verified;

  /// Vérifie si l'utilisateur a un permis
  bool get hasPermis => _currentSession?.hasPermis ?? false;

  /// Récupère le rôle actuel
  UserRole? get currentRole => _currentSession?.role;

  /// Récupère l'ID utilisateur
  String? get userId => _currentSession?.userId;

  // =========================================================================
  // INITIALISATION
  // =========================================================================

  /// Initialise la session depuis le stockage local
  Future<void> initialize() async {
    final token = await _secureStorage.getAccessToken();

    if (token != null) {
      // Tenter de restaurer la session
      final userId = await _secureStorage.getUserId();
      final role = await _secureStorage.getUserRole();

      if (userId != null && role != null) {
        // Créer une session partielle (sera complétée par un appel à /auth/me)
        _currentSession = UserSession(
          userId: userId,
          role: UserRole.fromString(role),
          accessToken: token,
        );

        _authStateController.add(AuthState.authenticated);
        _sessionController.add(_currentSession);
      }
    } else {
      _authStateController.add(AuthState.unauthenticated);
      _sessionController.add(null);
    }
  }

  // =========================================================================
  // GESTION DE SESSION
  // =========================================================================

  /// Démarre une nouvelle session
  Future<void> startSession(UserSession session) async {
    _currentSession = session;

    // Sauvegarder les tokens
    await _secureStorage.saveTokens(
      accessToken: session.accessToken,
      refreshToken: session.refreshToken ?? '',
    );

    // Sauvegarder les infos utilisateur
    await _secureStorage.saveUserId(session.userId);
    await _secureStorage.saveUserRole(session.role.value);

    // Émettre les changements
    _authStateController.add(AuthState.authenticated);
    _sessionController.add(session);
  }

  /// Met à jour la session
  Future<void> updateSession(UserSession session) async {
    _currentSession = session;

    // Mettre à jour le rôle si changé
    await _secureStorage.saveUserRole(session.role.value);

    // Émettre les changements
    _sessionController.add(session);
  }

  /// Termine la session (logout)
  Future<void> endSession() async {
    _currentSession = null;

    // Supprimer les tokens
    await _secureStorage.clearTokens();

    // Optionnel : garder les préférences ou tout supprimer ?
    // await _preferences.clearAll();

    // Émettre les changements
    _authStateController.add(AuthState.unauthenticated);
    _sessionController.add(null);
  }

  /// Refresh les tokens
  Future<void> refreshTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _secureStorage.saveTokens(
      accessToken: accessToken,
      refreshToken: refreshToken,
    );

    if (_currentSession != null) {
      _currentSession = _currentSession!.copyWith(
        accessToken: accessToken,
        refreshToken: refreshToken,
      );
      _sessionController.add(_currentSession);
    }
  }

  // =========================================================================
  // GUARDS
  // =========================================================================

  /// Vérifie si l'utilisateur peut créer une réservation
  bool canMakeReservation() {
    return isAuthenticated &&
        hasCompletedProfile &&
        isPhoneVerified &&
        hasPermis;
  }

  /// Vérifie si l'utilisateur peut créer un véhicule
  bool canCreateVehicle() {
    return isAuthenticated &&
        currentRole == UserRole.owner &&
        hasCompletedProfile &&
        isPhoneVerified;
  }

  /// Vérifie si l'utilisateur peut demander un retrait
  bool canRequestWithdrawal() {
    return isAuthenticated && currentRole == UserRole.owner && isKycVerified;
  }

  // =========================================================================
  // CLEANUP
  // =========================================================================

  /// Dispose le service
  void dispose() {
    _authStateController.close();
    _sessionController.close();
  }
}

// =============================================================================
// MODELS
// =============================================================================

/// État d'authentification
enum AuthState {
  authenticated,
  unauthenticated,
  unknown,
}

/// Rôle utilisateur (synchronisé avec le backend)
enum UserRole {
  tenant('LOCATAIRE'),
  owner('PROPRIETAIRE'),
  admin('ADMIN');

  const UserRole(this.value);
  final String value;

  static UserRole fromString(String value) {
    return UserRole.values.firstWhere(
      (role) => role.value == value,
      orElse: () => UserRole.tenant,
    );
  }
}

/// Statut KYC (synchronisé avec le backend)
enum KycStatus {
  notVerified('NON_VERIFIE'),
  pending('EN_ATTENTE'),
  verified('VERIFIE'),
  rejected('REJETE');

  const KycStatus(this.value);
  final String value;

  static KycStatus fromString(String value) {
    return KycStatus.values.firstWhere(
      (status) => status.value == value,
      orElse: () => KycStatus.notVerified,
    );
  }
}

/// Session utilisateur complète
class UserSession {
  final String userId;
  final String? utilisateurId;
  final String? email;
  final String? phone;
  final UserRole role;
  final String accessToken;
  final String? refreshToken;

  // Flags
  final bool profileCompleted;
  final bool phoneVerified;
  final KycStatus kycStatus;
  final bool hasPermis;
  final bool hasVehicles;

  // Profile info
  final String? prenom;
  final String? nom;
  final String? avatarUrl;
  final DateTime? dateNaissance;
  final DateTime? bloqueJusqua;

  const UserSession({
    required this.userId,
    this.utilisateurId,
    this.email,
    this.phone,
    required this.role,
    required this.accessToken,
    this.refreshToken,
    this.profileCompleted = false,
    this.phoneVerified = false,
    this.kycStatus = KycStatus.notVerified,
    this.hasPermis = false,
    this.hasVehicles = false,
    this.prenom,
    this.nom,
    this.avatarUrl,
    this.dateNaissance,
    this.bloqueJusqua,
  });

  /// Crée une session depuis la réponse de /auth/me
  factory UserSession.fromProfileResponse(
    Map<String, dynamic> json,
    String accessToken,
    String? refreshToken,
  ) {
    return UserSession(
      userId: json['userId'] as String,
      utilisateurId: json['utilisateurId'] as String?,
      email: json['email'] as String?,
      phone: json['phone'] as String?,
      role: UserRole.fromString(json['role'] as String),
      accessToken: accessToken,
      refreshToken: refreshToken,
      profileCompleted: json['hasUtilisateur'] as bool? ?? false,
      phoneVerified: json['phoneVerified'] as bool? ?? false,
      kycStatus: KycStatus.fromString(
        json['kycStatus'] as String? ?? 'NON_VERIFIE',
      ),
      hasPermis: json['hasPermis'] as bool? ?? false,
      hasVehicles: json['hasVehicles'] as bool? ?? false,
      prenom: json['prenom'] as String?,
      nom: json['nom'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      dateNaissance: json['dateNaissance'] != null
          ? DateTime.tryParse(json['dateNaissance'] as String)
          : null,
      bloqueJusqua: json['bloqueJusqua'] != null
          ? DateTime.tryParse(json['bloqueJusqua'] as String)
          : null,
    );
  }

  /// Copie avec modifications
  UserSession copyWith({
    String? userId,
    String? utilisateurId,
    String? email,
    String? phone,
    UserRole? role,
    String? accessToken,
    String? refreshToken,
    bool? profileCompleted,
    bool? phoneVerified,
    KycStatus? kycStatus,
    bool? hasPermis,
    bool? hasVehicles,
    String? prenom,
    String? nom,
    String? avatarUrl,
    DateTime? dateNaissance,
    DateTime? bloqueJusqua,
  }) {
    return UserSession(
      userId: userId ?? this.userId,
      utilisateurId: utilisateurId ?? this.utilisateurId,
      email: email ?? this.email,
      phone: phone ?? this.phone,
      role: role ?? this.role,
      accessToken: accessToken ?? this.accessToken,
      refreshToken: refreshToken ?? this.refreshToken,
      profileCompleted: profileCompleted ?? this.profileCompleted,
      phoneVerified: phoneVerified ?? this.phoneVerified,
      kycStatus: kycStatus ?? this.kycStatus,
      hasPermis: hasPermis ?? this.hasPermis,
      hasVehicles: hasVehicles ?? this.hasVehicles,
      prenom: prenom ?? this.prenom,
      nom: nom ?? this.nom,
      avatarUrl: avatarUrl ?? this.avatarUrl,
      dateNaissance: dateNaissance ?? this.dateNaissance,
      bloqueJusqua: bloqueJusqua ?? this.bloqueJusqua,
    );
  }

  /// Nom complet
  String? get fullName {
    if (prenom == null || nom == null) return null;
    return '$prenom $nom';
  }

  /// Initiales
  String get initials {
    final cleanPrenom = prenom?.trim() ?? '';
    final cleanNom = nom?.trim() ?? '';
    if (cleanPrenom.isNotEmpty && cleanNom.isNotEmpty) {
      return '${cleanPrenom[0]}${cleanNom[0]}'.toUpperCase();
    }
    if (cleanPrenom.isNotEmpty) {
      return cleanPrenom[0].toUpperCase();
    }
    if (cleanNom.isNotEmpty) {
      return cleanNom[0].toUpperCase();
    }
    final cleanEmail = email?.trim() ?? '';
    if (cleanEmail.isNotEmpty) {
      return cleanEmail[0].toUpperCase();
    }
    return 'U';
  }

  /// Vérifie si le compte est bloqué
  bool get isBlocked {
    if (bloqueJusqua == null) return false;
    return bloqueJusqua!.isAfter(DateTime.now());
  }
}



