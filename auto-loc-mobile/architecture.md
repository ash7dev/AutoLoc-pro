# AutoLoc — Architecture Flutter détaillée (v2)

> Feature-First + Clean Architecture + MVVM + DDD
> Version intégrant les 13 améliorations validées : `app/`, tokens, DI par feature, effects, domain services, DTO, wallet subdivisé, etc.

---

# 1. Vue d'ensemble complète de `lib/`

```
lib/
├── main.dart                              # Entrée unique : runApp(bootstrap())
│
├── app/                                   # Tout ce qui "assemble" l'application
│   ├── app.dart                           # Widget racine : MaterialApp.router, thème, locale
│   ├── bootstrap.dart                     # Séquence de démarrage (async) : env → DI → services
│   ├── app_initializer.dart               # Warm-up : session, cache, remote config, deep links
│   ├── app_providers.dart                 # ProviderScope / MultiProvider racine + overrides
│   ├── app_router.dart                    # Assemblage du go_router (routes de toutes les features)
│   ├── app_observers.dart                 # RouterObserver, ProviderObserver, analytics observer
│   └── app_lifecycle.dart                 # AppLifecycleListener (resume, pause, detach)
│
├── core/                                  # Transverse. RÈGLE : zéro import de features/
│   ├── environment/
│   │   ├── env.dart                       # Interface : apiBaseUrl, waveApiKey, sentryDsn…
│   │   ├── env_dev.dart
│   │   ├── env_staging.dart
│   │   └── env_prod.dart
│   ├── constants/
│   │   ├── api_endpoints.dart
│   │   └── app_constants.dart             # Durées, tailles max upload, regex CNI…
│   ├── errors/
│   │   ├── exceptions.dart                # ServerException, CacheException, NetworkException
│   │   ├── failures.dart                  # Failure sealed : ServerFailure, ValidationFailure…
│   │   └── error_mapper.dart              # Exception → Failure (utilisé par tous les repos)
│   ├── network/
│   │   ├── api_client.dart                # Dio configuré (baseUrl depuis env)
│   │   ├── interceptors/
│   │   │   ├── auth_interceptor.dart      # Injecte le token, gère le refresh 401
│   │   │   ├── logging_interceptor.dart
│   │   │   └── retry_interceptor.dart
│   │   └── connectivity_service.dart      # Stream<bool> online/offline
│   ├── storage/
│   │   ├── secure_storage.dart            # Tokens, PIN (flutter_secure_storage)
│   │   ├── local_database.dart            # Isar/Hive : ouverture, schémas, migrations
│   │   └── preferences.dart               # onboarding_seen, tutorial_seen, theme_mode
│   ├── permissions/
│   │   └── permission_service.dart        # request contextuel + rationale + settings redirect
│   ├── navigation/
│   │   ├── routes.dart                    # Noms + paths centralisés (const)
│   │   └── guards/
│   │       ├── auth_guard.dart            # Redirige vers /auth si action protégée
│   │       └── role_guard.dart            # Bloque les routes owner pour un tenant
│   ├── services/
│   │   ├── session_service.dart           # Utilisateur courant, rôle, stream d'auth state
│   │   ├── notification_service.dart      # FCM : token, foreground, tap handling
│   │   └── deep_link_service.dart
│   ├── logging/
│   │   ├── app_logger.dart                # Interface : d/i/w/e
│   │   └── console_logger.dart            # Impl dev (impl prod → monitoring)
│   ├── monitoring/
│   │   ├── crash_reporter.dart            # Interface (Crashlytics/Sentry derrière)
│   │   └── analytics_tracker.dart         # Interface : track(event, params)
│   ├── feature_flags/
│   │   ├── feature_flags.dart             # Interface : isEnabled('wallet_cashback')
│   │   └── remote_config_flags.dart       # Impl Firebase Remote Config
│   ├── utils/
│   │   ├── extensions/                    # context_x.dart, string_x.dart, datetime_x.dart
│   │   ├── formatters/                    # money_formatter.dart (FCFA), phone_formatter.dart
│   │   ├── validators/                    # phone_sn_validator.dart, otp_validator.dart
│   │   └── result.dart                    # typedef Result<T> = Either<Failure, T>
│   └── di/
│       └── core_injection.dart            # N'enregistre QUE le core (Dio, storage, services)
│
├── design_system/                         # 100% UI, zéro métier, zéro appel réseau
│   ├── tokens/                            # La source de vérité visuelle
│   │   ├── ds_colors.dart                 # Palettes brutes (primary900…primary50)
│   │   ├── ds_spacing.dart                # 4, 8, 12, 16, 24, 32…
│   │   ├── ds_radius.dart
│   │   ├── ds_typography.dart             # Familles, tailles, poids
│   │   ├── ds_opacity.dart
│   │   ├── ds_duration.dart               # fast 150ms, normal 300ms, slow 500ms
│   │   ├── ds_elevation.dart
│   │   └── ds_breakpoints.dart
│   ├── theme/
│   │   ├── app_theme.dart                 # ThemeData light/dark construit DEPUIS les tokens
│   │   └── theme_extensions.dart          # Couleurs sémantiques : success, warning, booking…
│   ├── icons/
│   │   ├── app_icons.dart                 # IconData custom (police d'icônes AutoLoc)
│   │   └── app_illustrations.dart         # Chemins des SVG/illustrations
│   ├── animations/
│   │   ├── fade_slide_transition.dart
│   │   ├── shimmer.dart
│   │   └── page_transitions.dart
│   ├── atoms/
│   │   ├── buttons/                       # primary_button, secondary_button, danger_button
│   │   ├── inputs/                        # app_text_field, otp_field, pin_field
│   │   ├── status_badge.dart              # Générique : (label, color) — pas de métier
│   │   ├── avatar.dart
│   │   ├── rating.dart
│   │   └── price_text.dart
│   ├── molecules/
│   │   ├── app_search_bar.dart
│   │   ├── section_title.dart
│   │   ├── app_top_bar.dart
│   │   ├── calendar_field.dart
│   │   └── bottom_sheet_handle.dart
│   ├── organisms/
│   │   ├── app_bottom_navigation.dart     # Reçoit List<NavItem> — le rôle décide ailleurs
│   │   └── app_dialog.dart
│   └── states/
│       ├── loading_view.dart
│       ├── skeleton_box.dart / skeleton_list.dart
│       ├── empty_view.dart                # (illustration, titre, message, action?)
│       ├── error_view.dart                # + bouton Réessayer
│       └── offline_view.dart
│
├── shared/                                # Métier PARTAGÉ entre 2+ features (le moins possible)
│   ├── components/                        # Widgets métier réutilisés
│   │   ├── vehicle_card.dart              # Utilisé par : explore, home, fleet, favoris
│   │   ├── booking_card.dart              # Utilisé par : tenant/reservations, owner/reservations
│   │   ├── booking_timeline.dart
│   │   ├── booking_status_badge.dart      # Mappe BookingStatus → StatusBadge (atome)
│   │   └── kyc/
│   │       ├── kyc_flow_sheet.dart
│   │       ├── cni_capture_step.dart
│   │       ├── license_capture_step.dart
│   │       └── selfie_capture_step.dart
│   ├── extensions/                        # Extensions sur types métier partagés
│   │   └── booking_status_x.dart          # .label, .color, .icon
│   ├── mixins/
│   │   ├── auth_required_mixin.dart       # Intercepte une action → ouvre l'auth sheet
│   │   └── connectivity_aware_mixin.dart
│   ├── providers/                         # Providers transverses (rôle courant, session…)
│   │   └── session_providers.dart
│   └── enums/
│       ├── user_role.dart                 # tenant / owner
│       ├── booking_status.dart            # pending/confirmed/ongoing/completed/cancelled
│       └── vehicle_status.dart
│
└── features/
    ├── splash/
    ├── onboarding/
    ├── auth/                              # login, register, otp, forgot_password
    ├── home/
    ├── explore/                           # recherche, filtres, résultats, carte
    ├── vehicle/                           # détail d'annonce (lu par tenant ET owner)
    ├── booking/                           # ★ détaillée en section 2
    ├── payment/                           # Wave, Orange Money, cartes — évolue seul
    ├── contract/                          # génération, visualisation, signature PDF
    ├── notifications/
    ├── profile/                           # profil + KYC status
    ├── settings/
    ├── support/                           # tickets, centre d'aide
    │
    ├── tenant/
    │   └── reservations/                  # "Mes réservations" côté locataire
    │
    ├── owner/                             # Un dossier PARENT, mais chaque sous-dossier
    │   ├── dashboard/                     # est une feature COMPLÈTE et indépendante
    │   ├── fleet/                         # flotte + création/modification d'annonce
    │   ├── reservations/                  # réservations reçues + acceptation/refus
    │   └── statistics/
    │
    └── wallet/
        ├── balance/                       # solde + revenus
        ├── transactions/                  # historique des transactions
        ├── withdrawals/                   # demande + suivi des retraits
        └── shared/                        # domaine commun au wallet uniquement
            ├── domain/
            │   ├── entities/wallet.dart
            │   └── value_objects/money.dart (ré-export si défini ailleurs)
            └── components/wallet_balance_card.dart
```

**Trois règles de dépendance à graver dans un `analysis_options.yaml` (ou avec `dart_code_metrics` / `import_lint`) :**

1. `core/` et `design_system/` n'importent **jamais** `features/` ni `shared/`.
2. `shared/` peut importer `core/` et `design_system/`, jamais `features/`.
3. Une feature n'importe **jamais** une autre feature directement — elle passe par `shared/` ou par la navigation (route + paramètres).

---

# 2. Anatomie complète d'une feature : `booking/`

C'est la feature la plus riche (règles métier, paiement, états multiples, effets one-shot), donc le meilleur gabarit. **Toutes les features suivent exactement ce squelette**, en enlevant ce dont elles n'ont pas besoin.

```
features/booking/
│
├── di/
│   └── booking_injection.dart
│
├── domain/
│   ├── entities/
│   │   ├── booking.dart
│   │   └── booking_draft.dart
│   ├── value_objects/
│   │   ├── booking_period.dart
│   │   └── booking_price.dart
│   ├── repositories/
│   │   └── booking_repository.dart
│   ├── services/
│   │   ├── booking_pricing_service.dart
│   │   ├── cancellation_policy.dart
│   │   └── availability_checker.dart
│   └── usecases/
│       ├── create_booking.dart
│       ├── get_my_bookings.dart
│       ├── get_booking_details.dart
│       ├── cancel_booking.dart
│       └── watch_booking_status.dart
│
├── data/
│   ├── dto/
│   │   ├── booking_dto.dart
│   │   ├── booking_request_dto.dart
│   │   └── booking_status_dto.dart
│   ├── mappers/
│   │   └── booking_mapper.dart
│   ├── datasources/
│   │   ├── remote/
│   │   │   └── booking_remote_datasource.dart
│   │   ├── local/
│   │   │   └── booking_local_datasource.dart
│   │   └── cache/
│   │       └── booking_cache_policy.dart
│   └── repositories/
│       └── booking_repository_impl.dart
│
└── presentation/
    ├── states/
    │   ├── booking_creation_state.dart
    │   └── my_bookings_state.dart
    ├── effects/
    │   └── booking_effect.dart
    ├── viewmodels/
    │   ├── booking_creation_viewmodel.dart
    │   ├── my_bookings_viewmodel.dart
    │   └── booking_details_viewmodel.dart
    ├── providers/
    │   └── booking_providers.dart
    ├── screens/
    │   ├── booking_creation_screen.dart
    │   ├── booking_summary_screen.dart
    │   ├── my_bookings_screen.dart
    │   └── booking_details_screen.dart
    └── widgets/
        ├── booking_date_picker.dart
        ├── booking_price_breakdown.dart
        ├── booking_summary_card.dart
        └── cancel_booking_sheet.dart
```

Voyons maintenant le **contenu** de chaque couche, fichier par fichier.

---

## 2.1 `domain/` — le cœur, zéro dépendance Flutter

### `entities/booking.dart`

Une entité a une **identité** et un cycle de vie. Elle est immuable et ne connaît ni JSON, ni API.

```dart
class Booking {
  final String id;
  final String vehicleId;
  final String tenantId;
  final String ownerId;
  final BookingPeriod period;        // value object
  final BookingPrice price;          // value object
  final BookingStatus status;        // enum partagé (shared/enums)
  final DateTime createdAt;

  const Booking({ ... });

  bool get isCancellable =>
      status == BookingStatus.pending || status == BookingStatus.confirmed;

  bool get isActive => status == BookingStatus.ongoing;
}
```

### `value_objects/booking_period.dart`

Un value object n'a **pas d'identité** : il est défini par ses valeurs, et surtout il est **impossible à construire dans un état invalide**. C'est là que DDD paie.

```dart
class BookingPeriod {
  final DateTime start;
  final DateTime end;

  const BookingPeriod._(this.start, this.end);

  /// Constructeur validant : retourne une Failure au lieu de lancer
  static Result<BookingPeriod> create(DateTime start, DateTime end) {
    if (!end.isAfter(start)) {
      return Left(ValidationFailure('La date de fin doit être après le début'));
    }
    if (start.isBefore(DateTime.now())) {
      return Left(ValidationFailure('Impossible de réserver dans le passé'));
    }
    return Right(BookingPeriod._(start, end));
  }

  int get durationInDays => end.difference(start).inDays.clamp(1, 365);
}
```

### `services/booking_pricing_service.dart`

Un **domain service** porte une règle métier qui n'appartient naturellement à aucune entité (elle croise véhicule + période + commission). Ce n'est **pas** un usecase : il ne fait pas d'I/O, il calcule.

```dart
class BookingPricingService {
  final CommissionCalculator commission;
  BookingPricingService(this.commission);

  BookingPrice compute({
    required Money dailyRate,
    required BookingPeriod period,
    Money? deposit,
  }) {
    final subtotal = dailyRate * period.durationInDays;
    final fee = commission.forBooking(subtotal);   // ex: 10% plafonné
    return BookingPrice(
      subtotal: subtotal,
      serviceFee: fee,
      deposit: deposit ?? Money.zero,
      total: subtotal + fee,
    );
  }
}
```

Idem pour `cancellation_policy.dart` (remboursement 100% à J-3, 50% à J-1, 0% le jour même) : c'est une règle métier pure, testable en une milliseconde sans mock.

### `repositories/booking_repository.dart`

Uniquement l'**interface**. Le domaine dit ce dont il a besoin ; il ne sait pas si ça vient d'une API, d'Isar ou d'un cache.

```dart
abstract interface class BookingRepository {
  Future<Result<Booking>> create(BookingDraft draft);
  Future<Result<List<Booking>>> getMyBookings({bool forceRefresh = false});
  Future<Result<Booking>> getById(String id);
  Future<Result<Booking>> cancel(String id, {required String reason});
  Stream<BookingStatus> watchStatus(String id);
}
```

### `usecases/create_booking.dart`

Un usecase = **une intention utilisateur**, orchestrée. Il compose les value objects, les domain services et le repository. C'est la seule porte d'entrée du ViewModel vers le domaine.

```dart
class CreateBooking {
  final BookingRepository _repository;
  final AvailabilityChecker _availability;
  final BookingPricingService _pricing;

  CreateBooking(this._repository, this._availability, this._pricing);

  Future<Result<Booking>> call({
    required String vehicleId,
    required Money dailyRate,
    required DateTime start,
    required DateTime end,
  }) async {
    // 1. Valider la période (value object)
    final period = BookingPeriod.create(start, end);
    if (period.isLeft()) return Left(period.failure);

    // 2. Règle métier : disponibilité
    final available = await _availability.isFree(vehicleId, period.value);
    if (!available) return Left(BookingFailure.vehicleUnavailable());

    // 3. Calcul du prix (domain service)
    final price = _pricing.compute(dailyRate: dailyRate, period: period.value);

    // 4. Persistance via l'interface
    return _repository.create(BookingDraft(
      vehicleId: vehicleId, period: period.value, price: price,
    ));
  }
}
```

---

## 2.2 `data/` — l'implémentation technique

### `dto/booking_dto.dart`

Le DTO est le **miroir exact du JSON de l'API**, y compris ses bizarreries (snake_case, dates en string, montants en centimes). Il ne sort jamais de la couche data.

```dart
@JsonSerializable()
class BookingDto {
  final String id;
  @JsonKey(name: 'vehicle_id') final String vehicleId;
  @JsonKey(name: 'start_date') final String startDate;   // "2026-07-20"
  @JsonKey(name: 'end_date') final String endDate;
  @JsonKey(name: 'total_amount') final int totalAmount;  // en centimes FCFA
  final String status;                                   // "PENDING"
  // fromJson / toJson générés
}
```

### `mappers/booking_mapper.dart`

La **frontière anti-contamination** : c'est le seul endroit où DTO et entité se rencontrent.

```dart
extension BookingDtoMapper on BookingDto {
  Booking toDomain() => Booking(
    id: id,
    vehicleId: vehicleId,
    period: BookingPeriod.create(
      DateTime.parse(startDate), DateTime.parse(endDate),
    ).getOrThrow(),                        // le serveur est garant ici
    price: BookingPrice.fromCents(totalAmount),
    status: BookingStatus.fromApi(status), // "PENDING" → BookingStatus.pending
    ...
  );
}
```

### `datasources/remote/booking_remote_datasource.dart`

Parle HTTP, retourne des DTO, lance des `Exception` techniques (pas des Failures).

```dart
class BookingRemoteDatasource {
  final ApiClient _client;

  Future<BookingDto> create(BookingRequestDto request) async {
    final res = await _client.post(ApiEndpoints.bookings, data: request.toJson());
    return BookingDto.fromJson(res.data);
  }

  Future<List<BookingDto>> getMine() async { ... }
}
```

### `datasources/local/` + `datasources/cache/`

`local/` = persistance Isar/Hive (les collections, les requêtes). `cache/` = la **politique** : quand est-ce périmé, quand rafraîchir.

```dart
// cache/booking_cache_policy.dart
class BookingCachePolicy {
  static const ttl = Duration(minutes: 5);
  bool isStale(DateTime? lastSync) =>
      lastSync == null || DateTime.now().difference(lastSync) > ttl;
}
```

### `repositories/booking_repository_impl.dart`

L'orchestrateur : remote + local + cache + connectivité, et la traduction Exception → Failure. C'est ici que vit la stratégie offline-first.

```dart
class BookingRepositoryImpl implements BookingRepository {
  final BookingRemoteDatasource _remote;
  final BookingLocalDatasource _local;
  final BookingCachePolicy _cache;
  final ConnectivityService _connectivity;

  @override
  Future<Result<List<Booking>>> getMyBookings({bool forceRefresh = false}) async {
    try {
      final fresh = !_cache.isStale(await _local.lastSync());
      if (fresh && !forceRefresh) {
        return Right((await _local.getAll()).map((d) => d.toDomain()).toList());
      }
      if (!await _connectivity.isOnline) {
        final cached = await _local.getAll();
        return cached.isNotEmpty
            ? Right(cached.map((d) => d.toDomain()).toList())
            : Left(NetworkFailure.offline());
      }
      final dtos = await _remote.getMine();
      await _local.saveAll(dtos);
      return Right(dtos.map((d) => d.toDomain()).toList());
    } on Exception catch (e) {
      return Left(ErrorMapper.toFailure(e));
    }
  }
}
```

---

## 2.3 `presentation/` — MVVM avec states et effects séparés

### `states/my_bookings_state.dart`

Le state est **ce que l'écran affiche**. Sealed class = le `switch` de l'écran est exhaustif, le compilateur t'interdit d'oublier un cas. Ton exigence « aucun écran ne gère uniquement le Success » devient une garantie du compilateur.

```dart
sealed class MyBookingsState {
  const MyBookingsState();
}
class MyBookingsLoading extends MyBookingsState { const MyBookingsLoading(); }
class MyBookingsLoaded  extends MyBookingsState {
  final List<Booking> upcoming;
  final List<Booking> past;
  final bool isRefreshing;
  const MyBookingsLoaded({required this.upcoming, required this.past, this.isRefreshing = false});
}
class MyBookingsEmpty   extends MyBookingsState { const MyBookingsEmpty(); }
class MyBookingsError   extends MyBookingsState {
  final Failure failure;
  const MyBookingsError(this.failure);
}
class MyBookingsOffline extends MyBookingsState {
  final List<Booking>? cached;   // on peut être offline AVEC des données
  const MyBookingsOffline({this.cached});
}
```

### `effects/booking_effect.dart`

L'effect est **ce qui arrive une seule fois** : snackbar, navigation, bottom sheet, haptic. Le mettre dans le state crée le bug classique du snackbar qui réapparaît à chaque rebuild. Ici, il est consommé puis oublié.

```dart
sealed class BookingEffect {
  const BookingEffect();
}
class NavigateToPayment extends BookingEffect {
  final String bookingId;
  const NavigateToPayment(this.bookingId);
}
class ShowBookingError extends BookingEffect {
  final String message;
  const ShowBookingError(this.message);
}
class ShowCancellationConfirmed extends BookingEffect {
  final Money refundAmount;
  const ShowCancellationConfirmed(this.refundAmount);
}
class RequestNotificationPermission extends BookingEffect {
  const RequestNotificationPermission();   // ta règle : demandée à la 1re réservation
}
```

### `viewmodels/booking_creation_viewmodel.dart`

Le ViewModel ne connaît **que des usecases**. Il expose un state (continu) et un flux d'effects (one-shot).

```dart
class BookingCreationViewModel extends Notifier<BookingCreationState> {
  late final CreateBooking _createBooking;
  final _effects = StreamController<BookingEffect>.broadcast();
  Stream<BookingEffect> get effects => _effects.stream;

  @override
  BookingCreationState build() {
    _createBooking = ref.read(createBookingProvider);
    ref.onDispose(_effects.close);
    return const BookingCreationState.editing();
  }

  Future<void> submit() async {
    state = const BookingCreationState.submitting();
    final result = await _createBooking(
      vehicleId: vehicleId, dailyRate: rate, start: start, end: end,
    );
    result.fold(
      (failure) {
        state = BookingCreationState.editing();       // on rend la main au form
        _effects.add(ShowBookingError(failure.userMessage));
      },
      (booking) {
        _effects.add(const RequestNotificationPermission());
        _effects.add(NavigateToPayment(booking.id));
      },
    );
  }
}
```

### `providers/booking_providers.dart`

Le câblage Riverpod de la feature (si tu utilises get_it seul, ce fichier disparaît au profit du `di/`).

```dart
final myBookingsViewModelProvider =
    NotifierProvider<MyBookingsViewModel, MyBookingsState>(MyBookingsViewModel.new);

final createBookingProvider = Provider<CreateBooking>((ref) => sl<CreateBooking>());
```

### `screens/my_bookings_screen.dart`

L'écran est **bête** : il switch sur le state, écoute les effects, et branche les vues du design system. Aucune logique.

```dart
class MyBookingsScreen extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final state = ref.watch(myBookingsViewModelProvider);
    ref.listenEffects(bookingEffectsProvider, _handleEffect); // extension maison

    return Scaffold(
      appBar: AppTopBar(title: 'Mes réservations'),
      body: switch (state) {
        MyBookingsLoading()          => const SkeletonList(itemHeight: 120),
        MyBookingsEmpty()            => EmptyView(
            illustration: AppIllustrations.noBookings,
            title: 'Aucune réservation',
            actionLabel: 'Explorer les véhicules',
            onAction: () => context.go(Routes.explore),
          ),
        MyBookingsError(:final failure) => ErrorView(
            message: failure.userMessage,
            onRetry: () => ref.read(myBookingsViewModelProvider.notifier).load(),
          ),
        MyBookingsOffline(:final cached) => cached != null
            ? _BookingsList(cached, banner: const OfflineBanner())
            : const OfflineView(),
        MyBookingsLoaded(:final upcoming, :final past) =>
            _BookingsList(upcoming: upcoming, past: past),
      },
    );
  }
}
```

---

## 2.4 `di/booking_injection.dart`

Chaque feature s'enregistre elle-même. `core/di` ne connaît que le core ; `app/bootstrap.dart` appelle chaque module. Le fichier DI géant n'existe jamais.

```dart
class BookingInjection {
  static void register(GetIt sl) {
    // Datasources
    sl.registerLazySingleton(() => BookingRemoteDatasource(sl<ApiClient>()));
    sl.registerLazySingleton(() => BookingLocalDatasource(sl<LocalDatabase>()));

    // Repository (on enregistre l'INTERFACE)
    sl.registerLazySingleton<BookingRepository>(
      () => BookingRepositoryImpl(sl(), sl(), BookingCachePolicy(), sl()),
    );

    // Domain services
    sl.registerLazySingleton(() => BookingPricingService(sl<CommissionCalculator>()));
    sl.registerLazySingleton(() => CancellationPolicy());

    // Usecases
    sl.registerFactory(() => CreateBooking(sl(), sl(), sl()));
    sl.registerFactory(() => GetMyBookings(sl()));
    sl.registerFactory(() => CancelBooking(sl(), sl<CancellationPolicy>()));
  }
}
```

Et dans `app/bootstrap.dart` :

```dart
Future<void> bootstrap() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Env.load(Flavor.current);

  CoreInjection.register(sl);
  AuthInjection.register(sl);
  BookingInjection.register(sl);
  WalletBalanceInjection.register(sl);
  WalletWithdrawalsInjection.register(sl);
  // ... une ligne par feature

  await AppInitializer.run(sl);   // session, remote config, deep link initial
  runApp(const AppProviders(child: AutoLocApp()));
}
```

---

# 3. Déclinaison sur les autres features

Le squelette est identique partout ; seule l'épaisseur change.

**Feature légère** (`settings/`, `onboarding/`) : pas de `data/` ni de `domain/` complet — juste `presentation/` + éventuellement un repository minimal sur `preferences`. On ne crée pas de couches vides pour le principe.

**`wallet/withdrawals/`** (mini-feature complète) :

```
wallet/withdrawals/
├── di/withdrawals_injection.dart
├── domain/
│   ├── entities/withdrawal.dart
│   ├── value_objects/withdrawal_status.dart      # pending / validated / rejected
│   ├── services/withdrawal_policy.dart           # montant min, solde suffisant, 1 retrait actif max
│   ├── repositories/withdrawal_repository.dart
│   └── usecases/  request_withdrawal.dart · get_withdrawals.dart · watch_withdrawal_status.dart
├── data/
│   ├── dto/withdrawal_dto.dart
│   ├── mappers/withdrawal_mapper.dart
│   ├── datasources/ remote/ · local/ · cache/
│   └── repositories/withdrawal_repository_impl.dart
└── presentation/
    ├── states/  withdrawal_request_state.dart · withdrawals_list_state.dart
    ├── effects/withdrawal_effect.dart             # ShowWithdrawalSubmitted, ShowInsufficientBalance
    ├── viewmodels/ · providers/
    ├── screens/  withdrawal_request_screen.dart · withdrawals_tracking_screen.dart
    └── widgets/  withdrawal_card.dart · withdrawal_status_badge.dart · amount_input_sheet.dart
```

`balance/`, `transactions/` et `withdrawals/` partagent l'entité `Wallet` et `Money` via `wallet/shared/` — jamais en s'important mutuellement. Quand cashback, parrainage ou factures arriveront, ce seront de nouveaux sous-dossiers, sans toucher aux existants.

**`owner/fleet/`** suit le même moule avec `domain/services/listing_validation_service.dart` (photos min, documents véhicule requis avant publication) — encore une règle métier qui n'est ni un usecase ni de l'UI.

---

# 4. Récapitulatif des décisions et de leur "pourquoi"

| Décision | Problème évité |
|---|---|
| `app/` en dossier | `main.dart` de 400 lignes dans 6 mois |
| Tokens séparés du thème | Refonte visuelle = toucher 1 dossier, pas 40 écrans |
| `dto/` au lieu de `models/` | Confusion DTO/entité, JSON qui fuit dans le domaine |
| Mappers obligatoires | Un renommage d'API qui casse 15 écrans |
| Domain services | Règles métier éparpillées dans les ViewModels |
| Value objects validants | Réservation avec dates inversées en prod |
| `states/` en fichiers dédiés | ViewModels de 800 lignes, states copiés-collés |
| `effects/` séparés | Snackbar fantôme à chaque rebuild |
| DI par feature | `injection.dart` de 1 200 lignes, conflits Git permanents |
| `cache/` comme politique | TTL codés en dur dans les datasources |
| Wallet subdivisé | Feature wallet monolithique de 60 fichiers dans 2 ans |
| Interdiction feature→feature | Couplage circulaire, features impossibles à extraire |

---

# 5. Ordre de mise en place (aligné sur ta Phase 1)

1. `app/` + `core/environment` + `core/errors` (Failure, Result, ErrorMapper) — **avant tout le reste**
2. `design_system/tokens` → `theme` → `states/` (les 5 vues d'état)
3. `core/network` + `core/storage` + `core/di`
4. Le **gabarit de feature** : créer `booking/` vide avec tous les dossiers, en faire le modèle copiable
5. Première feature de bout en bout (splash → onboarding → explore) pour valider le flux complet state/effect/DI
6. Ensuite seulement, dérouler les phases 2 à 6 de ton plan initial

Le point 4 est stratégique : un script (`mason` avec un brick `feature`) qui génère ce squelette garantit que la 15e feature ressemblera à la première.