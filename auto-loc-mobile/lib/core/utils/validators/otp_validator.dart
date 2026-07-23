/// Validateur pour les codes OTP
class OtpValidator {
  OtpValidator._();

  /// Longueur standard d'un code OTP
  static const int defaultLength = 6;

  /// Valide un code OTP
  /// Retourne null si valide, un message d'erreur sinon
  static String? validate(
    String? value, {
    int length = defaultLength,
  }) {
    if (value == null || value.isEmpty) {
      return 'Le code est requis';
    }

    // Retirer les espaces
    final cleaned = value.replaceAll(RegExp(r'\s'), '');

    // Vérifier la longueur
    if (cleaned.length != length) {
      return 'Le code doit contenir $length chiffres';
    }

    // Vérifier que ce sont bien des chiffres
    if (!RegExp(r'^\d+$').hasMatch(cleaned)) {
      return 'Le code ne doit contenir que des chiffres';
    }

    return null; // Valide
  }

  /// Valide et retourne un booléen
  static bool isValid(
    String? value, {
    int length = defaultLength,
  }) {
    return validate(value, length: length) == null;
  }

  /// Valide avec un message custom
  static String? validateWithMessage(
    String? value, {
    int length = defaultLength,
    String? requiredMessage,
    String? invalidMessage,
  }) {
    if (value == null || value.isEmpty) {
      return requiredMessage ?? 'Le code est requis';
    }

    if (!isValid(value, length: length)) {
      return invalidMessage ?? 'Code invalide';
    }

    return null;
  }

  /// Formate un code OTP (ajoute des espaces)
  /// Input: "123456"
  /// Output: "123 456"
  static String format(String value, {int length = defaultLength}) {
    final cleaned = value.replaceAll(RegExp(r'\s'), '');

    if (cleaned.length <= length / 2) {
      return cleaned;
    }

    final half = length ~/ 2;
    final firstPart = cleaned.substring(0, half);
    final secondPart = cleaned.substring(half, cleaned.length);

    return '$firstPart $secondPart';
  }

  /// Nettoie un code OTP (retire les espaces)
  static String clean(String value) {
    return value.replaceAll(RegExp(r'\s'), '');
  }

  /// Vérifie si le code est complet
  static bool isComplete(String value, {int length = defaultLength}) {
    return clean(value).length == length;
  }

  /// Limite la longueur à la taille attendue
  static String limitLength(String value, {int length = defaultLength}) {
    final cleaned = clean(value);
    if (cleaned.length > length) {
      return cleaned.substring(0, length);
    }
    return cleaned;
  }

  /// Formate au fur et à mesure de la saisie
  static String formatAsYouType(String value, {int length = defaultLength}) {
    final cleaned = clean(value);
    final limited = limitLength(cleaned, length: length);
    return format(limited, length: length);
  }
}

/// Extension sur String pour faciliter la validation OTP
extension OtpValidatorExtension on String {
  /// Valide comme OTP
  String? get validateOtp => OtpValidator.validate(this);

  /// Vérifie si c'est un OTP valide
  bool get isValidOtp => OtpValidator.isValid(this);

  /// Nettoie l'OTP
  String get cleanOtp => OtpValidator.clean(this);

  /// Formate l'OTP
  String get formatOtp => OtpValidator.format(this);

  /// Vérifie si l'OTP est complet
  bool get isCompleteOtp => OtpValidator.isComplete(this);
}
