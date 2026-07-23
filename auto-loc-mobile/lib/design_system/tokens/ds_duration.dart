/// Design System - Duration Tokens
/// Durées d'animation cohérentes pour l'application
/// Basé sur les best practices Material Design et iOS
class DSDuration {
  DSDuration._();

  // ===========================================================================
  // DURATIONS (en millisecondes)
  // ===========================================================================

  /// Instant - 0ms (pas d'animation)
  static const int instant = 0;

  /// Extra fast - 75ms (micro-interactions)
  static const int extraFast = 75;

  /// Fast - 150ms (hover, focus, petites transitions)
  static const int fast = 150;

  /// Normal - 300ms (transitions standards, la plupart des animations)
  static const int normal = 300;

  /// Slow - 500ms (animations complexes, page transitions)
  static const int slow = 500;

  /// Extra slow - 700ms (animations lourdes, modales)
  static const int extraSlow = 700;

  // ===========================================================================
  // DURATIONS (en Duration pour Flutter)
  // ===========================================================================

  /// Instant Duration
  static const Duration instantDuration = Duration(milliseconds: instant);

  /// Extra fast Duration
  static const Duration extraFastDuration = Duration(milliseconds: extraFast);

  /// Fast Duration
  static const Duration fastDuration = Duration(milliseconds: fast);

  /// Normal Duration
  static const Duration normalDuration = Duration(milliseconds: normal);

  /// Slow Duration
  static const Duration slowDuration = Duration(milliseconds: slow);

  /// Extra slow Duration
  static const Duration extraSlowDuration = Duration(milliseconds: extraSlow);

  // ===========================================================================
  // SEMANTIC DURATIONS (usage spécifique)
  // ===========================================================================

  /// Durée pour les micro-interactions (ripple, tap feedback)
  static const Duration microInteraction = extraFastDuration;

  /// Durée pour les hover states
  static const Duration hover = fastDuration;

  /// Durée pour les focus states
  static const Duration focus = fastDuration;

  /// Durée pour les transitions de page
  static const Duration pageTransition = normalDuration;

  /// Durée pour les animations de modal/dialog
  static const Duration modal = normalDuration;

  /// Durée pour les animations de bottom sheet
  static const Duration bottomSheet = slowDuration;

  /// Durée pour les animations de snackbar
  static const Duration snackbar = normalDuration;

  /// Durée pour les animations de loading
  static const Duration loading = normalDuration;

  /// Durée pour les animations de skeleton
  static const Duration skeleton = slowDuration;

  /// Durée pour les animations de shimmer
  static const Duration shimmer = Duration(milliseconds: 1500);

  /// Durée pour le collapse/expand
  static const Duration collapse = normalDuration;

  /// Durée pour les fade in/out
  static const Duration fade = fastDuration;

  /// Durée pour les slide animations
  static const Duration slide = normalDuration;

  /// Durée pour les scale animations
  static const Duration scale = fastDuration;

  /// Durée pour les rotation animations
  static const Duration rotation = normalDuration;

  /// Durée pour les swipe gestures
  static const Duration swipe = normalDuration;

  /// Durée pour les drag gestures
  static const Duration drag = instantDuration;

  /// Durée pour les success animations
  static const Duration success = slowDuration;

  /// Durée pour les error animations
  static const Duration error = normalDuration;

  /// Durée pour les tooltip show/hide
  static const Duration tooltip = fastDuration;

  /// Durée pour les tab transitions
  static const Duration tabTransition = normalDuration;

  /// Durée pour les list item animations
  static const Duration listItem = fastDuration;

  /// Durée pour les splash screen
  static const Duration splash = Duration(milliseconds: 2000);

  // ===========================================================================
  // DELAYS
  // ===========================================================================

  /// Delay court (pour les staggered animations)
  static const Duration delayShort = Duration(milliseconds: 50);

  /// Delay moyen
  static const Duration delayMedium = Duration(milliseconds: 100);

  /// Delay long
  static const Duration delayLong = Duration(milliseconds: 200);

  // ===========================================================================
  // DURATIONS SPÉCIALES
  // ===========================================================================

  /// Durée pour les auto-dismiss (snackbars, toasts)
  static const Duration autoDismissShort = Duration(seconds: 2);

  /// Durée pour les auto-dismiss medium
  static const Duration autoDismissMedium = Duration(seconds: 4);

  /// Durée pour les auto-dismiss long
  static const Duration autoDismissLong = Duration(seconds: 6);

  /// Durée pour les debounce (search, form validation)
  static const Duration debounce = Duration(milliseconds: 300);

  /// Durée pour les throttle (scroll events, resize)
  static const Duration throttle = Duration(milliseconds: 100);

  /// Durée pour les timeout (API calls)
  static const Duration timeout = Duration(seconds: 30);

  /// Durée pour les long timeout (upload, long operations)
  static const Duration timeoutLong = Duration(seconds: 60);
}
