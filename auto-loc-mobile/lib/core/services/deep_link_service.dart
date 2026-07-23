import 'dart:async';

import '../logging/app_logger.dart';

/// Service pour gérer les deep links
/// Permet d'ouvrir l'app avec des URLs personnalisées
///
/// Exemples de deep links :
/// - autoloc://vehicle/123 → Ouvrir le détail d'un véhicule
/// - autoloc://booking/456 → Ouvrir une réservation
/// - autoloc://search?city=Dakar → Recherche avec filtres
/// - https://autoloc.sn/vehicle/123 → Universal link (iOS/Android)
class DeepLinkService {
  final AppLogger _logger;

  final StreamController<DeepLink> _deepLinkStreamController;

  DeepLinkService({required AppLogger logger})
      : _logger = logger,
        _deepLinkStreamController = StreamController<DeepLink>.broadcast();

  /// Stream des deep links
  Stream<DeepLink> get onDeepLink => _deepLinkStreamController.stream;

  /// Deep link initial (si l'app a été ouverte via un deep link)
  DeepLink? _initialDeepLink;
  DeepLink? get initialDeepLink => _initialDeepLink;

  // =========================================================================
  // INITIALISATION
  // =========================================================================

  /// Initialise le service de deep links
  Future<void> initialize() async {
    try {
      // TODO: Utiliser uni_links ou go_router pour gérer les deep links

      // Récupérer le deep link initial
      // final initialUri = await getInitialUri();
      // if (initialUri != null) {
      //   _initialDeepLink = _parseDeepLink(initialUri);
      //   _logger.i('Deep link initial: $_initialDeepLink');
      // }

      // Écouter les deep links (app déjà ouverte)
      // uriLinkStream.listen((uri) {
      //   final deepLink = _parseDeepLink(uri);
      //   _logger.i('Deep link reçu: $deepLink');
      //   _deepLinkStreamController.add(deepLink);
      // });

      _logger.i('DeepLinkService initialisé');
    } catch (e, stackTrace) {
      _logger.e('Erreur lors de l\'initialisation des deep links', e, stackTrace);
    }
  }

  // =========================================================================
  // PARSING
  // =========================================================================

  /// Parse une URI en DeepLink
  DeepLink _parseDeepLink(Uri uri) {
    final path = uri.path.replaceFirst('/', '');
    final pathSegments = path.split('/');
    final queryParams = uri.queryParameters;

    // Déterminer le type de deep link
    if (pathSegments.isEmpty) {
      return DeepLink(
        type: DeepLinkType.home,
        uri: uri,
      );
    }

    final type = _getDeepLinkType(pathSegments.first);

    return DeepLink(
      type: type,
      uri: uri,
      pathSegments: pathSegments,
      queryParams: queryParams,
    );
  }

  /// Détermine le type de deep link à partir du premier segment
  DeepLinkType _getDeepLinkType(String segment) {
    switch (segment.toLowerCase()) {
      case 'vehicle':
      case 'vehicule':
        return DeepLinkType.vehicle;

      case 'booking':
      case 'reservation':
        return DeepLinkType.booking;

      case 'search':
      case 'recherche':
        return DeepLinkType.search;

      case 'profile':
      case 'profil':
        return DeepLinkType.profile;

      case 'wallet':
      case 'portefeuille':
        return DeepLinkType.wallet;

      case 'kyc':
        return DeepLinkType.kyc;

      case 'payment':
      case 'paiement':
        return DeepLinkType.payment;

      default:
        return DeepLinkType.unknown;
    }
  }

  // =========================================================================
  // CRÉATION DE DEEP LINKS
  // =========================================================================

  /// Crée un deep link pour un véhicule
  String createVehicleLink(String vehicleId) {
    return 'autoloc://vehicle/$vehicleId';
  }

  /// Crée un deep link pour une réservation
  String createBookingLink(String bookingId) {
    return 'autoloc://booking/$bookingId';
  }

  /// Crée un deep link pour une recherche
  String createSearchLink({
    String? city,
    String? vehicleType,
    DateTime? startDate,
    DateTime? endDate,
  }) {
    final params = <String, String>{};

    if (city != null) params['city'] = city;
    if (vehicleType != null) params['type'] = vehicleType;
    if (startDate != null) params['start'] = startDate.toIso8601String();
    if (endDate != null) params['end'] = endDate.toIso8601String();

    final queryString = params.entries.map((e) => '${e.key}=${e.value}').join('&');

    return 'autoloc://search${queryString.isNotEmpty ? '?$queryString' : ''}';
  }

  /// Crée un universal link (https)
  String createUniversalLink(String path) {
    return 'https://autoloc.sn/$path';
  }

  // =========================================================================
  // PARTAGE
  // =========================================================================

  /// Partage un véhicule
  String shareVehicle(String vehicleId, {required String vehicleName}) {
    final link = createUniversalLink('vehicle/$vehicleId');
    return 'Découvre ce véhicule sur AutoLoc : $vehicleName\n$link';
  }

  /// Partage l'app
  String shareApp() {
    return 'Télécharge AutoLoc et loue des véhicules partout au Sénégal ! \nhttps://autoloc.sn';
  }

  // =========================================================================
  // CLEANUP
  // =========================================================================

  /// Dispose le service
  void dispose() {
    _deepLinkStreamController.close();
  }
}

/// Représente un deep link parsé
class DeepLink {
  final DeepLinkType type;
  final Uri uri;
  final List<String> pathSegments;
  final Map<String, String> queryParams;

  const DeepLink({
    required this.type,
    required this.uri,
    this.pathSegments = const [],
    this.queryParams = const {},
  });

  /// Récupère un ID à partir des segments de path
  /// Ex: /vehicle/123 → 123
  String? get id => pathSegments.length > 1 ? pathSegments[1] : null;

  @override
  String toString() {
    return 'DeepLink(type: $type, uri: $uri, id: $id, params: $queryParams)';
  }
}

/// Types de deep links supportés
enum DeepLinkType {
  home,
  vehicle,
  booking,
  search,
  profile,
  wallet,
  kyc,
  payment,
  unknown,
}
