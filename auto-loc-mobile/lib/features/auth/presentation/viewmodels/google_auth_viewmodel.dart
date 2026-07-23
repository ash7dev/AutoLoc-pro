import 'dart:async';
import 'package:supabase_flutter/supabase_flutter.dart' as sb;

import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../../../core/services/session_service.dart' as session;
import '../../../../core/services/supabase_service.dart';
import '../../domain/entities/auth_user.dart';
import '../../domain/usecases/login_with_supabase.dart';
import '../effects/auth_effect.dart';
import '../states/auth_state.dart';

/// GoogleAuthViewModel
///
/// Gère le flow d'authentification Google OAuth:
/// 1. Ouvrir Google OAuth dans le navigateur
/// 2. Récupérer l'access token Supabase après callback
/// 3. Envoyer au backend NestJS pour sync
/// 4. Démarrer la session
class GoogleAuthViewModel extends BaseViewModel<AuthUser> {
  final SupabaseService _supabaseService;
  final LoginWithSupabase _loginWithSupabase;
  final session.SessionService _sessionService;

  GoogleAuthViewModel({
    required SupabaseService supabaseService,
    required LoginWithSupabase loginWithSupabase,
    required session.SessionService sessionService,
  })  : _supabaseService = supabaseService,
        _loginWithSupabase = loginWithSupabase,
        _sessionService = sessionService,
        super() {
    _subscribeToAuthChanges();
  }

  StreamSubscription<sb.AuthState>? _authSubscription;

  void _subscribeToAuthChanges() {
    _authSubscription = _supabaseService.authStateChanges.listen((state) {
      if (state.event == sb.AuthChangeEvent.signedIn) {
        handleOAuthCallback();
      }
    });
  }

  @override
  void dispose() {
    _authSubscription?.cancel();
    super.dispose();
  }

  @override
  Future<void> load() async {
    // Pas de chargement initial pour Google auth
    // state = const ViewState.initial();
  }

  // ===========================================================================
  // GOOGLE OAUTH
  // ===========================================================================

  /// Démarre le flow Google OAuth
  Future<void> signInWithGoogle() async {
    try {
      // 1. Lancer le flow OAuth (ouvre le navigateur)
      final success = await _supabaseService.signInWithGoogle();

      if (!success) {
        throw Exception('Impossible de démarrer l\'authentification Google');
      }

      // Le reste du flow est géré par le callback deep link
      // Voir handleOAuthCallback()
    } catch (e) {
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  /// Gère le callback OAuth après redirection
  Future<void> handleOAuthCallback() async {
    state = const ViewState.loading();

    try {
      // 1. Récupérer la session Supabase
      final session = await _supabaseService.getSession();

      if (session == null) {
        throw Exception('Aucune session Supabase trouvée');
      }

      // 2. Sync avec le backend NestJS
      final result = await _loginWithSupabase(
        accessToken: session.accessToken,
      );

      result.fold(
        (failure) {
          state = ViewState.failure(failure.message);
          emitEffect(AuthEffect.showError(failure.message));
        },
        (authUser) async {
          // 3. Démarrer la session
          await _startSession(authUser);

          // 4. Navigation
          state = ViewState.success(authUser);
          emitEffect(const AuthEffect.navigateToHome());
          emitEffect(const AuthEffect.showSuccess('Connexion réussie'));
        },
      );
    } catch (e) {
      state = ViewState.failure(e.toString());
      emitEffect(AuthEffect.showError(e.toString()));
    }
  }

  // ===========================================================================
  // SESSION MANAGEMENT
  // ===========================================================================

  /// Démarre une session utilisateur après OAuth réussi
  Future<void> _startSession(AuthUser authUser) async {
    // Utiliser les tokens NestJS retournés par notre backend
    final sessionData = session.UserSession(
      userId: authUser.userId,
      email: authUser.email,
      phone: authUser.telephone,
      role: _mapRoleProfileToUserRole(authUser.role),
      accessToken: authUser.accessToken ?? '',
      refreshToken: authUser.refreshToken ?? '',
      profileCompleted: authUser.hasUtilisateur,
      phoneVerified: authUser.phoneVerified,
      kycStatus: _mapKycStatus(authUser.statutKyc),
      prenom: authUser.prenom,
      nom: authUser.nom,
      avatarUrl: authUser.avatarUrl,
      dateNaissance: authUser.dateNaissance,
    );

    await _sessionService.startSession(sessionData);
  }

  session.UserRole _mapRoleProfileToUserRole(dynamic roleProfile) {
    final roleStr = roleProfile.toString().toUpperCase();
    if (roleStr.contains('OWNER') || roleStr.contains('PROPRIETAIRE')) {
      return session.UserRole.owner;
    } else if (roleStr.contains('ADMIN')) {
      return session.UserRole.admin;
    }
    return session.UserRole.tenant;
  }

  /// Map KycStatus entity vers SessionService KycStatus
  session.KycStatus _mapKycStatus(dynamic kycStatus) {
    if (kycStatus == null) return session.KycStatus.notVerified;

    final statusStr = kycStatus.toString();
    if (statusStr.contains('verified') || statusStr.contains('VERIFIE')) {
      return session.KycStatus.verified;
    } else if (statusStr.contains('pending') || statusStr.contains('EN_ATTENTE')) {
      return session.KycStatus.pending;
    } else if (statusStr.contains('rejected') || statusStr.contains('REJETE')) {
      return session.KycStatus.rejected;
    }
    return session.KycStatus.notVerified;
  }
}
