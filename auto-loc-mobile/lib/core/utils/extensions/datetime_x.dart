import 'package:intl/intl.dart';

/// Extensions sur DateTime
extension DateTimeExtensions on DateTime {
  // =========================================================================
  // FORMATAGE
  // =========================================================================

  /// Formate en 'dd/MM/yyyy' (ex: 14/07/2026)
  String get formatDate => DateFormat('dd/MM/yyyy').format(this);

  /// Formate en 'HH:mm' (ex: 14:30)
  String get formatTime => DateFormat('HH:mm').format(this);

  /// Formate en 'dd/MM/yyyy HH:mm' (ex: 14/07/2026 14:30)
  String get formatDateTime => DateFormat('dd/MM/yyyy HH:mm').format(this);

  /// Formate en 'yyyy-MM-dd' pour l'API (ex: 2026-07-14)
  String get formatApi => DateFormat('yyyy-MM-dd').format(this);

  /// Formate en 'EEEE d MMMM yyyy' (ex: lundi 14 juillet 2026)
  String get formatLong => DateFormat('EEEE d MMMM yyyy', 'fr_FR').format(this);

  /// Formate en 'EEE d MMM' (ex: lun 14 juil)
  String get formatShort => DateFormat('EEE d MMM', 'fr_FR').format(this);

  /// Formate en 'd MMM yyyy' (ex: 14 juil 2026)
  String get formatMedium => DateFormat('d MMM yyyy', 'fr_FR').format(this);

  /// Formate en 'd MMMM' (ex: 14 juillet)
  String get formatDayMonth => DateFormat('d MMMM', 'fr_FR').format(this);

  /// Formate de manière relative (aujourd'hui, hier, demain, ou date)
  String get formatRelative {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final yesterday = today.subtract(const Duration(days: 1));
    final tomorrow = today.add(const Duration(days: 1));
    final date = DateTime(year, month, day);

    if (date == today) {
      return 'Aujourd\'hui à ${formatTime}';
    } else if (date == yesterday) {
      return 'Hier à ${formatTime}';
    } else if (date == tomorrow) {
      return 'Demain à ${formatTime}';
    } else if (date.isAfter(today.subtract(const Duration(days: 7)))) {
      return formatShort;
    } else {
      return formatDate;
    }
  }

  /// Temps écoulé depuis (il y a 2h, il y a 3 jours...)
  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(this);

    if (difference.inSeconds < 60) {
      return 'À l\'instant';
    } else if (difference.inMinutes < 60) {
      final minutes = difference.inMinutes;
      return 'Il y a $minutes min';
    } else if (difference.inHours < 24) {
      final hours = difference.inHours;
      return 'Il y a ${hours}h';
    } else if (difference.inDays < 7) {
      final days = difference.inDays;
      return 'Il y a $days jour${days > 1 ? 's' : ''}';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return 'Il y a $weeks semaine${weeks > 1 ? 's' : ''}';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return 'Il y a $months mois';
    } else {
      final years = (difference.inDays / 365).floor();
      return 'Il y a $years an${years > 1 ? 's' : ''}';
    }
  }

  // =========================================================================
  // COMPARAISONS
  // =========================================================================

  /// Vérifie si c'est aujourd'hui
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Vérifie si c'est hier
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Vérifie si c'est demain
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  /// Vérifie si c'est dans le passé
  bool get isPast => isBefore(DateTime.now());

  /// Vérifie si c'est dans le futur
  bool get isFuture => isAfter(DateTime.now());

  /// Vérifie si c'est cette semaine
  bool get isThisWeek {
    final now = DateTime.now();
    final startOfWeek = now.subtract(Duration(days: now.weekday - 1));
    final endOfWeek = startOfWeek.add(const Duration(days: 6));

    return isAfter(startOfWeek) && isBefore(endOfWeek);
  }

  /// Vérifie si c'est ce mois
  bool get isThisMonth {
    final now = DateTime.now();
    return year == now.year && month == now.month;
  }

  /// Vérifie si c'est cette année
  bool get isThisYear {
    final now = DateTime.now();
    return year == now.year;
  }

  /// Vérifie si c'est le même jour qu'une autre date
  bool isSameDay(DateTime other) {
    return year == other.year && month == other.month && day == other.day;
  }

  // =========================================================================
  // MANIPULATION
  // =========================================================================

  /// Début de journée (00:00:00)
  DateTime get startOfDay => DateTime(year, month, day);

  /// Fin de journée (23:59:59.999)
  DateTime get endOfDay {
    return DateTime(year, month, day, 23, 59, 59, 999);
  }

  /// Début de semaine (lundi 00:00:00)
  DateTime get startOfWeek {
    final daysToSubtract = weekday - 1;
    return subtract(Duration(days: daysToSubtract)).startOfDay;
  }

  /// Fin de semaine (dimanche 23:59:59)
  DateTime get endOfWeek {
    final daysToAdd = 7 - weekday;
    return add(Duration(days: daysToAdd)).endOfDay;
  }

  /// Début du mois (1er du mois à 00:00:00)
  DateTime get startOfMonth => DateTime(year, month, 1);

  /// Fin du mois (dernier jour du mois à 23:59:59)
  DateTime get endOfMonth {
    final nextMonth = month == 12 ? DateTime(year + 1, 1, 1) : DateTime(year, month + 1, 1);
    return nextMonth.subtract(const Duration(microseconds: 1));
  }

  /// Début de l'année (1er janvier à 00:00:00)
  DateTime get startOfYear => DateTime(year, 1, 1);

  /// Fin de l'année (31 décembre à 23:59:59)
  DateTime get endOfYear => DateTime(year, 12, 31, 23, 59, 59, 999);

  /// Ajoute des jours
  DateTime addDays(int days) => add(Duration(days: days));

  /// Retire des jours
  DateTime subtractDays(int days) => subtract(Duration(days: days));

  /// Ajoute des mois
  DateTime addMonths(int months) {
    final newMonth = month + months;
    final newYear = year + (newMonth - 1) ~/ 12;
    final finalMonth = ((newMonth - 1) % 12) + 1;
    return DateTime(newYear, finalMonth, day, hour, minute, second);
  }

  /// Retire des mois
  DateTime subtractMonths(int months) => addMonths(-months);

  /// Ajoute des années
  DateTime addYears(int years) => DateTime(year + years, month, day, hour, minute, second);

  /// Retire des années
  DateTime subtractYears(int years) => addYears(-years);

  // =========================================================================
  // PROPRIÉTÉS
  // =========================================================================

  /// Nom du jour de la semaine (lundi, mardi...)
  String get dayName => DateFormat('EEEE', 'fr_FR').format(this);

  /// Nom du mois (janvier, février...)
  String get monthName => DateFormat('MMMM', 'fr_FR').format(this);

  /// Numéro de la semaine dans l'année
  int get weekOfYear {
    final startOfYear = DateTime(year, 1, 1);
    final days = difference(startOfYear).inDays;
    return ((days + startOfYear.weekday) / 7).ceil();
  }

  /// Jour de l'année (1-365/366)
  int get dayOfYear {
    final startOfYear = DateTime(year, 1, 1);
    return difference(startOfYear).inDays + 1;
  }

  /// Nombre de jours dans le mois
  int get daysInMonth {
    final nextMonth = month == 12 ? DateTime(year + 1, 1, 1) : DateTime(year, month + 1, 1);
    return nextMonth.subtract(const Duration(days: 1)).day;
  }

  /// Vérifie si c'est une année bissextile
  bool get isLeapYear {
    return (year % 4 == 0 && year % 100 != 0) || (year % 400 == 0);
  }

  /// Vérifie si c'est un weekend
  bool get isWeekend => weekday == DateTime.saturday || weekday == DateTime.sunday;

  /// Vérifie si c'est un jour de semaine
  bool get isWeekday => !isWeekend;

  // =========================================================================
  // HELPERS
  // =========================================================================

  /// Age en années
  int get age {
    final now = DateTime.now();
    var age = now.year - year;

    if (now.month < month || (now.month == month && now.day < day)) {
      age--;
    }

    return age;
  }

  /// Copie avec modification
  DateTime copyWith({
    int? year,
    int? month,
    int? day,
    int? hour,
    int? minute,
    int? second,
    int? millisecond,
    int? microsecond,
  }) {
    return DateTime(
      year ?? this.year,
      month ?? this.month,
      day ?? this.day,
      hour ?? this.hour,
      minute ?? this.minute,
      second ?? this.second,
      millisecond ?? this.millisecond,
      microsecond ?? this.microsecond,
    );
  }
}

/// Extensions sur DateTime nullable
extension NullableDateTimeExtensions on DateTime? {
  /// Vérifie si null
  bool get isNull => this == null;

  /// Vérifie si non null
  bool get isNotNull => this != null;

  /// Retourne la valeur ou maintenant
  DateTime orNow() => this ?? DateTime.now();

  /// Formate ou retourne un texte par défaut
  String formatOr(String defaultValue, String Function(DateTime) formatter) {
    return this != null ? formatter(this!) : defaultValue;
  }
}
