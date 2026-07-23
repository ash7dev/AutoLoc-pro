import 'package:freezed_annotation/freezed_annotation.dart';

part 'onboarding_data.freezed.dart';
part 'onboarding_data.g.dart';

/// **OnboardingData** - Données pour l'Onboarding
///
/// ## Responsabilité
/// État de l'onboarding (pour le moment simple, peut évoluer).
///
/// ## Propriétés
/// - `isCompleted`: L'onboarding est-il terminé?
@freezed
class OnboardingData with _$OnboardingData {
  const factory OnboardingData({
    @Default(false) bool isCompleted,
  }) = _OnboardingData;

  factory OnboardingData.fromJson(Map<String, dynamic> json) =>
      _$OnboardingDataFromJson(json);
}
