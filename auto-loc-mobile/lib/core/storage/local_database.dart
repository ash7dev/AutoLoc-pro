import 'package:isar/isar.dart';
import 'package:path_provider/path_provider.dart';

/// Service pour gérer la base de données locale Isar
/// Utilisé pour le cache offline des données (véhicules, réservations, etc.)
class LocalDatabase {
  Isar? _isar;

  /// Instance Isar
  Isar get instance {
    if (_isar == null) {
      throw Exception(
        'LocalDatabase not initialized. Call initialize() first.',
      );
    }
    return _isar!;
  }

  /// Vérifie si la DB est initialisée
  bool get isInitialized => _isar != null;

  /// Initialise la base de données Isar
  ///
  /// NOTE: Les schémas doivent être générés avec build_runner :
  /// flutter pub run build_runner build
  ///
  /// Les collections seront ajoutées au fur et à mesure du développement :
  /// - VehicleCache (pour le cache des véhicules)
  /// - BookingCache (pour le cache des réservations)
  /// - UserCache (pour le cache du profil)
  /// - SearchHistoryCache (pour l'historique de recherche enrichi)
  Future<void> initialize() async {
    if (_isar != null) {
      return; // Déjà initialisé
    }

    final dir = await getApplicationDocumentsDirectory();

    // Pour l'instant, on initialise avec un schéma vide
    // Les schémas seront ajoutés progressivement
    try {
      _isar = await Isar.open(
        [], // schemas: sera rempli au fur et à mesure
        directory: dir.path,
        name: 'autoloc_db',
        inspector: true, // Active l'inspecteur Isar (dev uniquement)
      );
    } catch (e) {
      // Isar lève une exception s'il n'y a aucune collection à ouvrir.
      // On l'ignore pour l'instant en affichant un warning.
      print('Warning: Base de données Isar non ouverte (aucun schéma défini): $e');
    }
  }

  /// Ferme la base de données
  Future<void> close() async {
    await _isar?.close();
    _isar = null;
  }

  /// Supprime toutes les données (cache clear)
  Future<void> clearAll() async {
    if (_isar == null) return;

    await _isar!.writeTxn(() async {
      await _isar!.clear();
    });
  }

  /// Récupère la taille de la DB en bytes
  Future<int> getSize() async {
    if (_isar == null) return 0;

    // La taille sera calculée différemment selon les collections
    // Pour l'instant on retourne 0
    return 0;
  }

  // =========================================================================
  // MÉTHODES UTILITAIRES (seront étendues avec les collections)
  // =========================================================================

  /// Execute une transaction en lecture
  Future<T> readTxn<T>(Future<T> Function() callback) async {
    return await instance.txn(callback);
  }

  /// Execute une transaction en écriture
  Future<T> writeTxn<T>(Future<T> Function() callback) async {
    return await instance.writeTxn(callback);
  }

  // =========================================================================
  // COLLECTIONS SPÉCIFIQUES
  // Ces méthodes seront implémentées au fur et à mesure
  // =========================================================================

  // TODO: Ajouter les méthodes pour VehicleCache
  // IsarCollection<VehicleCache> get vehicles => instance.vehicleCaches;

  // TODO: Ajouter les méthodes pour BookingCache
  // IsarCollection<BookingCache> get bookings => instance.bookingCaches;

  // TODO: Ajouter les méthodes pour UserCache
  // IsarCollection<UserCache> get users => instance.userCaches;
}

/// NOTE: Les schémas Isar seront créés dans les datasources locaux de chaque feature
///
/// Exemple de schéma (à créer plus tard) :
///
/// @collection
/// class VehicleCache {
///   Id id = Isar.autoIncrement;
///
///   @Index(unique: true)
///   late String vehicleId;
///
///   late String jsonData; // JSON sérialisé
///   late DateTime cachedAt;
/// }
///
/// Pour générer le schéma :
/// flutter pub run build_runner build --delete-conflicting-outputs
