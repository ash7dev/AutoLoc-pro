import 'package:flutter_riverpod/flutter_riverpod.dart';

/// User Model
class AppUser {
  const AppUser({
    required this.id,
    required this.name,
    required this.email,
    this.photoUrl,
    this.phone,
    this.role = UserRole.tenant,
  });

  final String id;
  final String name;
  final String email;
  final String? photoUrl;
  final String? phone;
  final UserRole role;

  AppUser copyWith({
    String? id,
    String? name,
    String? email,
    String? photoUrl,
    String? phone,
    UserRole? role,
  }) {
    return AppUser(
      id: id ?? this.id,
      name: name ?? this.name,
      email: email ?? this.email,
      photoUrl: photoUrl ?? this.photoUrl,
      phone: phone ?? this.phone,
      role: role ?? this.role,
    );
  }
}

enum UserRole {
  guest,
  tenant,
  owner,
}

/// Auth State
class AuthState {
  const AuthState({
    this.user,
    this.isLoading = false,
    this.error,
  });

  final AppUser? user;
  final bool isLoading;
  final String? error;

  bool get isAuthenticated => user != null;
  bool get isGuest => user == null;
  bool get isTenant => user?.role == UserRole.tenant;
  bool get isOwner => user?.role == UserRole.owner;

  AuthState copyWith({
    AppUser? user,
    bool? isLoading,
    String? error,
  }) {
    return AuthState(
      user: user ?? this.user,
      isLoading: isLoading ?? this.isLoading,
      error: error ?? this.error,
    );
  }
}

/// Auth Notifier
class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier() : super(const AuthState()) {
    _checkAuthStatus();
  }

  Future<void> _checkAuthStatus() async {
    state = state.copyWith(isLoading: true);

    // TODO: Check token in SecureStorage
    // Pour l'instant, simuler un utilisateur connecté
    await Future.delayed(const Duration(milliseconds: 500));

    // Simuler un utilisateur pour le développement
    state = AuthState(
      user: const AppUser(
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+221 77 123 45 67',
        role: UserRole.tenant,
        // photoUrl: 'https://i.pravatar.cc/150?img=12',
      ),
      isLoading: false,
    );
  }

  Future<void> login(String email, String password) async {
    state = state.copyWith(isLoading: true);

    try {
      // TODO: Call login API
      await Future.delayed(const Duration(seconds: 1));

      state = AuthState(
        user: AppUser(
          id: '1',
          name: 'John Doe',
          email: email,
          role: UserRole.tenant,
        ),
        isLoading: false,
      );
    } catch (e) {
      state = AuthState(
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  Future<void> logout() async {
    state = state.copyWith(isLoading: true);

    try {
      // TODO: Call logout API
      await Future.delayed(const Duration(milliseconds: 500));

      state = const AuthState(isLoading: false);
    } catch (e) {
      state = AuthState(
        user: state.user,
        error: e.toString(),
        isLoading: false,
      );
    }
  }

  void updateProfile(AppUser user) {
    state = state.copyWith(user: user);
  }
}

/// Provider pour l'authentification
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier();
});

/// Provider pour l'utilisateur actuel
final currentUserProvider = Provider<AppUser?>((ref) {
  return ref.watch(authProvider).user;
});

/// Provider pour vérifier si l'utilisateur est authentifié
final isAuthenticatedProvider = Provider<bool>((ref) {
  return ref.watch(authProvider).isAuthenticated;
});
