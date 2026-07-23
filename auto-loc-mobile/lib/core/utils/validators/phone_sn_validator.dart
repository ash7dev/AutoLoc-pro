import '../formatters/phone_formatter.dart';

/// Validateur pour les numéros de téléphone sénégalais
class PhoneSenegalValidator {
  PhoneSenegalValidator._();

  /// Valide un numéro de téléphone sénégalais
  /// Retourne null si valide, un message d'erreur sinon
  static String? validate(String? value) {
    if (value == null || value.isEmpty) {
      return 'Le numéro de téléphone est requis';
    }

    final cleaned = PhoneFormatter.clean(value);

    // Vérifier la longueur
    if (cleaned.length != 9) {
      return 'Le numéro doit contenir 9 chiffres';
    }

    // Vérifier que ce sont bien des chiffres
    if (!RegExp(r'^\d+$').hasMatch(cleaned)) {
      return 'Le numéro ne doit contenir que des chiffres';
    }

    // Vérifier le préfixe (77, 78, 76, 70, 75)
    final prefix = cleaned.substring(0, 2);
    final validPrefixes = ['77', '78', '76', '70', '75'];

    if (!validPrefixes.contains(prefix)) {
      return 'Le numéro doit commencer par 77, 78, 76, 70 ou 75';
    }

    return null; // Valide
  }

  /// Valide en mode optionnel (peut être vide)
  static String? validateOptional(String? value) {
    if (value == null || value.isEmpty) {
      return null; // Vide est accepté
    }

    return validate(value);
  }

  /// Valide et retourne un booléen
  static bool isValid(String? value) {
    return validate(value) == null;
  }

  /// Valide avec message custom
  static String? validateWithMessage(
    String? value, {
    String? requiredMessage,
    String? invalidMessage,
  }) {
    if (value == null || value.isEmpty) {
      return requiredMessage ?? 'Le numéro de téléphone est requis';
    }

    if (!PhoneFormatter.isValid(value)) {
      return invalidMessage ?? 'Numéro de téléphone invalide';
    }

    return null;
  }

  /// Valide un numéro pour un opérateur spécifique
  static String? validateForOperator(
    String? value,
    PhoneOperator requiredOperator,
  ) {
    final baseValidation = validate(value);
    if (baseValidation != null) {
      return baseValidation;
    }

    final operator = PhoneFormatter.getOperator(value!);
    if (operator != requiredOperator) {
      return 'Le numéro doit être de l\'opérateur ${requiredOperator.name}';
    }

    return null;
  }

  /// Messages d'erreur personnalisables
  static const Map<String, String> errorMessages = {
    'required': 'Le numéro de téléphone est requis',
    'invalid_length': 'Le numéro doit contenir 9 chiffres',
    'invalid_format': 'Le numéro ne doit contenir que des chiffres',
    'invalid_prefix': 'Le numéro doit commencer par 77, 78, 76, 70 ou 75',
    'invalid_operator': 'Opérateur non supporté',
  };
}
