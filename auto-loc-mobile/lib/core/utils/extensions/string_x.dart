/// Extensions sur String
extension StringExtensions on String {
  // =========================================================================
  // VALIDATION
  // =========================================================================

  /// Vérifie si la chaîne est vide ou null
  bool get isNullOrEmpty => trim().isEmpty;

  /// Vérifie si la chaîne n'est pas vide
  bool get isNotNullOrEmpty => trim().isNotEmpty;

  /// Vérifie si c'est un email valide
  bool get isValidEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Vérifie si c'est un numéro de téléphone sénégalais valide
  bool get isValidSenegalPhone {
    final phoneRegex = RegExp(r'^(77|78|76|70|75)\d{7}$');
    return phoneRegex.hasMatch(replaceAll(RegExp(r'\s'), ''));
  }

  /// Vérifie si c'est un numéro CNI sénégalais valide (13 chiffres)
  bool get isValidCni {
    final cniRegex = RegExp(r'^\d{13}$');
    return cniRegex.hasMatch(replaceAll(RegExp(r'\s'), ''));
  }

  /// Vérifie si c'est un URL valide
  bool get isValidUrl {
    try {
      final uri = Uri.parse(this);
      return uri.hasScheme && uri.hasAuthority;
    } catch (e) {
      return false;
    }
  }

  /// Vérifie si c'est un nombre
  bool get isNumeric {
    return double.tryParse(this) != null;
  }

  // =========================================================================
  // TRANSFORMATION
  // =========================================================================

  /// Capitalise la première lettre
  String get capitalize {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1).toLowerCase()}';
  }

  /// Capitalise chaque mot
  String get capitalizeWords {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize).join(' ');
  }

  /// Met en majuscule
  String get upper => toUpperCase();

  /// Met en minuscule
  String get lower => toLowerCase();

  /// Retire les espaces en début et fin
  String get trimmed => trim();

  /// Retire tous les espaces
  String get removeSpaces => replaceAll(RegExp(r'\s+'), '');

  /// Retire les accents
  String get removeAccents {
    const withAccents = 'àáâãäåèéêëìíîïòóôõöùúûüýÿñç';
    const withoutAccents = 'aaaaaaeeeeiiiioooouuuuyync';

    var result = this;
    for (var i = 0; i < withAccents.length; i++) {
      result = result.replaceAll(withAccents[i], withoutAccents[i]);
      result = result.replaceAll(
        withAccents[i].toUpperCase(),
        withoutAccents[i].toUpperCase(),
      );
    }
    return result;
  }

  // =========================================================================
  // FORMATAGE
  // =========================================================================

  /// Formate un numéro de téléphone sénégalais : 77 123 45 67
  String get formatSenegalPhone {
    final cleaned = replaceAll(RegExp(r'\s'), '');
    if (cleaned.length != 9) return this;

    return '${cleaned.substring(0, 2)} ${cleaned.substring(2, 5)} ${cleaned.substring(5, 7)} ${cleaned.substring(7)}';
  }

  /// Formate un CNI : 1 2345 6789 0123 4
  String get formatCni {
    final cleaned = replaceAll(RegExp(r'\s'), '');
    if (cleaned.length != 13) return this;

    return '${cleaned.substring(0, 1)} ${cleaned.substring(1, 5)} ${cleaned.substring(5, 9)} ${cleaned.substring(9, 13)}';
  }

  /// Masque partiellement une chaîne (ex: email, téléphone)
  String mask({int visibleStart = 3, int visibleEnd = 3, String maskChar = '*'}) {
    if (length <= visibleStart + visibleEnd) return this;

    final start = substring(0, visibleStart);
    final end = substring(length - visibleEnd);
    final maskLength = length - visibleStart - visibleEnd;
    final mask = maskChar * maskLength;

    return '$start$mask$end';
  }

  // =========================================================================
  // PARSING
  // =========================================================================

  /// Parse en int (retourne null si invalide)
  int? toIntOrNull() => int.tryParse(this);

  /// Parse en double (retourne null si invalide)
  double? toDoubleOrNull() => double.tryParse(this);

  /// Parse en DateTime (retourne null si invalide)
  DateTime? toDateTimeOrNull() => DateTime.tryParse(this);

  /// Parse en int avec valeur par défaut
  int toInt([int defaultValue = 0]) => int.tryParse(this) ?? defaultValue;

  /// Parse en double avec valeur par défaut
  double toDouble([double defaultValue = 0.0]) {
    return double.tryParse(this) ?? defaultValue;
  }

  // =========================================================================
  // HELPERS
  // =========================================================================

  /// Tronque la chaîne à une longueur max avec ellipsis
  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - ellipsis.length)}$ellipsis';
  }

  /// Répète la chaîne n fois
  String repeat(int times) => List.filled(times, this).join();

  /// Vérifie si contient (case insensitive)
  bool containsIgnoreCase(String other) {
    return toLowerCase().contains(other.toLowerCase());
  }

  /// Reverse la chaîne
  String get reversed => split('').reversed.join();

  /// Compte les occurrences d'une sous-chaîne
  int countOccurrences(String substring) {
    if (substring.isEmpty) return 0;
    return substring.allMatches(this).length;
  }

  /// Initiales (première lettre de chaque mot)
  String get initials {
    final clean = trim();
    if (clean.isEmpty) return '';
    final words = clean.split(RegExp(r'\s+'));
    return words
        .where((word) => word.isNotEmpty)
        .take(2)
        .map((word) => word[0].toUpperCase())
        .join();
  }

  /// Slug (URL-friendly)
  String get slug {
    return toLowerCase()
        .removeAccents
        .replaceAll(RegExp(r'[^\w\s-]'), '')
        .replaceAll(RegExp(r'\s+'), '-')
        .replaceAll(RegExp(r'-+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');
  }
}

/// Extensions sur String nullable
extension NullableStringExtensions on String? {
  /// Vérifie si null ou vide
  bool get isNullOrEmpty => this == null || this!.trim().isEmpty;

  /// Vérifie si non null et non vide
  bool get isNotNullOrEmpty => this != null && this!.trim().isNotEmpty;

  /// Retourne la valeur ou une valeur par défaut
  String orEmpty() => this ?? '';

  /// Retourne la valeur ou une valeur custom
  String or(String defaultValue) => this ?? defaultValue;
}
