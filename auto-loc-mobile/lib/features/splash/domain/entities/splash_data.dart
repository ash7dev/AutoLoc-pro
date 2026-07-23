import 'package:freezed_annotation/freezed_annotation.dart';

part 'splash_data.freezed.dart';
part 'splash_data.g.dart';

/// **SplashData** - Données nécessaires pour le Splash
///
/// ## Responsabilité
/// Contenir les informations de navigation après le splash.
///
/// ## Propriétés
/// - `nextRoute`: Route vers laquelle naviguer
/// - `hasSeenOnboarding`: L'user a-t-il déjà vu l'onboarding?
/// - `isAuthenticated`: L'user est-il authentifié?
@freezed
class SplashData with _$SplashData {
  const factory SplashData({
    required String nextRoute,
    required bool hasSeenOnboarding,
    required bool isAuthenticated,
  }) = _SplashData;

  factory SplashData.fromJson(Map<String, dynamic> json) =>
      _$SplashDataFromJson(json);
}
