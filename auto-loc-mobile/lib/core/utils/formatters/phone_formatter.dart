/// Formatter pour les numéros de téléphone sénégalais
class PhoneFormatter {
  PhoneFormatter._();

  /// Formate un numéro de téléphone sénégalais
  /// Input: "771234567" ou "77 123 45 67" ou "+221771234567"
  /// Output: "77 123 45 67"
  static String format(String phone) {
    // Nettoyer le numéro
    final cleaned = clean(phone);

    // Vérifier la longueur
    if (cleaned.length != 9) {
      return phone; // Retourner tel quel si invalide
    }

    // Formatter: 77 123 45 67
    return '${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}';
  }

  /// Formate avec l'indicatif international
  /// Input: "771234567"
  /// Output: "+221 77 123 45 67"
  static String formatInternational(String phone) {
    final formatted = format(phone);
    if (formatted.length != 12) {
      // Format attendu: "77 123 45 67" = 12 caractères
      return phone;
    }
    return '+221 $formatted';
  }

  /// Nettoie un numéro de téléphone (retire espaces, +221, etc.)
  /// Input: "+221 77 123 45 67" ou "77 123 45 67"
  /// Output: "771234567"
  static String clean(String phone) {
    return phone
        .replaceAll(RegExp(r'\s'), '') // Retirer espaces
        .replaceAll('+221', '') // Retirer indicatif
        .replaceAll('(221)', '') // Retirer indicatif avec parenthèses
        .replaceAll('-', '') // Retirer tirets
        .replaceAll('(', '') // Retirer parenthèses
        .replaceAll(')', '')
        .trim();
  }

  /// Valide un numéro de téléphone sénégalais
  /// Commence par 77, 78, 76, 70, ou 75 et contient 9 chiffres
  static bool isValid(String phone) {
    final cleaned = clean(phone);

    // Vérifier la longueur
    if (cleaned.length != 9) {
      return false;
    }

    // Vérifier le préfixe (77, 78, 76, 70, 75)
    final validPrefixes = ['77', '78', '76', '70', '75'];
    final prefix = cleaned.substring(0, 2);

    return validPrefixes.contains(prefix);
  }

  /// Retourne l'opérateur à partir du préfixe
  /// 77 → Orange, 78 → Orange, 76 → Expresso, 70 → Free, 75 → Expresso
  static PhoneOperator? getOperator(String phone) {
    final cleaned = clean(phone);

    if (cleaned.length < 2) {
      return null;
    }

    final prefix = cleaned.substring(0, 2);

    switch (prefix) {
      case '77':
      case '78':
        return PhoneOperator.orange;
      case '76':
      case '75':
        return PhoneOperator.expresso;
      case '70':
        return PhoneOperator.free;
      default:
        return null;
    }
  }

  /// Masque partiellement le numéro
  /// Input: "771234567"
  /// Output: "77 *** ** 67"
  static String mask(String phone) {
    final cleaned = clean(phone);

    if (cleaned.length != 9) {
      return phone;
    }

    return '${cleaned.substring(0, 2)} *** ** ${cleaned.substring(7)}';
  }

  /// Parse vers le format E.164 (pour API)
  /// Input: "771234567"
  /// Output: "+221771234567"
  static String toE164(String phone) {
    final cleaned = clean(phone);

    if (cleaned.length != 9) {
      return phone;
    }

    return '+221$cleaned';
  }

  /// Formate pour affichage dans input
  /// Ajoute les espaces pendant la saisie
  static String formatAsYouType(String phone) {
    final cleaned = clean(phone);

    if (cleaned.isEmpty) {
      return '';
    }

    // 77
    if (cleaned.length <= 2) {
      return cleaned;
    }

    // 77 123
    if (cleaned.length <= 5) {
      return '${cleaned.substring(0, 2)} ${cleaned.substring(2)}';
    }

    // 77 123 45
    if (cleaned.length <= 7) {
      return '${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5)}';
    }

    // 77 123 45 67
    return '${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7, cleaned.length > 9 ? 9 : cleaned.length)}';
  }

  /// Limite la longueur à 9 chiffres
  static String limitLength(String phone) {
    final cleaned = clean(phone);
    if (cleaned.length > 9) {
      return cleaned.substring(0, 9);
    }
    return cleaned;
  }
}

/// Opérateurs téléphoniques au Sénégal
enum PhoneOperator {
  orange('Orange'),
  expresso('Expresso'),
  free('Free');

  const PhoneOperator(this.name);
  final String name;

  /// Couleur de l'opérateur
  String get color {
    switch (this) {
      case PhoneOperator.orange:
        return '#FF6600';
      case PhoneOperator.expresso:
        return '#00A651';
      case PhoneOperator.free:
        return '#CE0037';
    }
  }

  /// Icône de l'opérateur (si vous avez des assets)
  String get icon {
    switch (this) {
      case PhoneOperator.orange:
        return 'assets/icons/orange.png';
      case PhoneOperator.expresso:
        return 'assets/icons/expresso.png';
      case PhoneOperator.free:
        return 'assets/icons/free.png';
    }
  }
}

/// Extension sur String pour faciliter le formatage
extension PhoneFormatterExtension on String {
  /// Formate le numéro de téléphone
  String get formatPhone => PhoneFormatter.format(this);

  /// Formate avec indicatif international
  String get formatPhoneInternational => PhoneFormatter.formatInternational(this);

  /// Nettoie le numéro
  String get cleanPhone => PhoneFormatter.clean(this);

  /// Valide le numéro
  bool get isValidPhone => PhoneFormatter.isValid(this);

  /// Masque le numéro
  String get maskPhone => PhoneFormatter.mask(this);

  /// Retourne l'opérateur
  PhoneOperator? get phoneOperator => PhoneFormatter.getOperator(this);

  /// Format E.164
  String get toE164Phone => PhoneFormatter.toE164(this);
}
