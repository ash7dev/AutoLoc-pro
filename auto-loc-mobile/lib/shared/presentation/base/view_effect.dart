import 'package:freezed_annotation/freezed_annotation.dart';

part 'view_effect.freezed.dart';

/// **ViewEffect** - Événements one-shot (ne font PAS partie du State)
///
/// ## Philosophie
/// Les **Effects** représentent des **actions ponctuelles** qui ne doivent
/// **JAMAIS** être dans le State. Ce sont des événements qui se produisent
/// une seule fois et ne persistent pas.
///
/// ## State vs Effect - La règle d'or
///
/// ### ✅ DANS LE STATE (ViewState<T>)
/// - Données à afficher (wallet balance, liste véhicules, profil user)
/// - État de chargement (loading, success, error)
/// - État vide (liste vide, recherche sans résultats)
///
/// ### ✅ DANS LES EFFECTS (ViewEffect)
/// - Navigation (aller à une page, revenir en arrière)
/// - Messages utilisateur (snackbar, toast, dialog)
/// - Actions système (copier dans le presse-papier, ouvrir URL)
/// - Permissions (demander accès caméra, localisation)
///
/// ## Pourquoi séparer State et Effect?
///
/// **Problème sans Effects:**
/// ```dart
/// // ❌ MAUVAIS PATTERN
/// class WalletState {
///   final WalletData? data;
///   final bool showSuccessMessage; // ⚠️ Problème!
///   final String? navigationRoute; // ⚠️ Problème!
/// }
/// ```
///
/// Si l'utilisateur quitte et revient sur l'écran, le message de succès
/// s'affichera à nouveau! La navigation se déclenchera à nouveau!
///
/// **Solution avec Effects:**
/// ```dart
/// // ✅ BON PATTERN
/// class WalletViewModel extends BaseViewModel<WalletData> {
///   Future<void> requestWithdrawal() async {
///     // ... withdrawal logic
///     emitEffect(ViewEffect.showSnackbar(
///       'Retrait demandé avec succès',
///       type: SnackbarType.success,
///     ));
///   }
/// }
/// ```
///
/// L'effect est émis UNE SEULE FOIS, puis disparaît.
///
/// ## Comment écouter les Effects?
///
/// Dans le Screen:
/// ```dart
/// class WalletScreen extends ConsumerStatefulWidget {
///   @override
///   ConsumerState<WalletScreen> createState() => _WalletScreenState();
/// }
///
/// class _WalletScreenState extends ConsumerState<WalletScreen>
///     with EffectHandler {
///   @override
///   void initState() {
///     super.initState();
///     listenToEffects(context, walletEffectsProvider);
///   }
///
///   @override
///   Widget build(BuildContext context) {
///     // ... UI
///   }
/// }
/// ```
///
/// ## Exemples d'utilisation
///
/// ### Navigation
/// ```dart
/// // Aller à la page de détails
/// emitEffect(ViewEffect.navigateTo('/vehicle/123'));
///
/// // Retour arrière avec résultat
/// emitEffect(ViewEffect.navigateBack(result: selectedVehicle));
///
/// // Remplacer la page actuelle
/// emitEffect(ViewEffect.navigateReplace('/home'));
/// ```
///
/// ### Messages utilisateur
/// ```dart
/// // Snackbar de succès
/// emitEffect(ViewEffect.showSnackbar(
///   'Réservation confirmée',
///   type: SnackbarType.success,
/// ));
///
/// // Dialog de confirmation
/// emitEffect(ViewEffect.showDialog(
///   title: 'Supprimer le véhicule?',
///   message: 'Cette action est irréversible',
///   confirmText: 'Supprimer',
///   cancelText: 'Annuler',
/// ));
/// ```
///
/// ### Actions système
/// ```dart
/// // Copier dans le presse-papier
/// emitEffect(ViewEffect.copyToClipboard('123456'));
///
/// // Appeler un numéro
/// emitEffect(ViewEffect.launchCall('+221771234567'));
/// ```
@freezed
sealed class ViewEffect with _$ViewEffect {
  // ============================================================================
  // NAVIGATION
  // ============================================================================

  /// **Naviguer vers une nouvelle page** (push)
  ///
  /// Ajoute une nouvelle page sur la pile de navigation.
  ///
  /// Paramètres:
  /// - `route`: Chemin de la route (ex: '/vehicle/details')
  /// - `arguments`: Données optionnelles à passer (ex: vehicleId)
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.navigateTo(
  ///   '/vehicle/details',
  ///   arguments: {'vehicleId': vehicle.id},
  /// ));
  /// ```
  const factory ViewEffect.navigateTo(
    String route, {
    Object? arguments,
  }) = _NavigateTo;

  /// **Revenir à la page précédente** (pop)
  ///
  /// Retire la page actuelle de la pile de navigation.
  ///
  /// Paramètres:
  /// - `result`: Résultat optionnel à retourner à la page précédente
  ///
  /// Exemple:
  /// ```dart
  /// // Après sélection d'un véhicule
  /// emitEffect(ViewEffect.navigateBack(result: selectedVehicle));
  /// ```
  const factory ViewEffect.navigateBack({Object? result}) = _NavigateBack;

  /// **Remplacer la page actuelle** (replace)
  ///
  /// Remplace la page actuelle au lieu d'ajouter une nouvelle page.
  /// Utile pour empêcher le retour arrière (ex: après login).
  ///
  /// Exemple:
  /// ```dart
  /// // Après login réussi
  /// emitEffect(ViewEffect.navigateReplace('/home'));
  /// ```
  const factory ViewEffect.navigateReplace(
    String route, {
    Object? arguments,
  }) = _NavigateReplace;

  // ============================================================================
  // MESSAGES UTILISATEUR
  // ============================================================================

  /// **Afficher un Snackbar** (message en bas de l'écran)
  ///
  /// Message temporaire avec couleur selon le type (success, error, warning, info).
  ///
  /// Paramètres:
  /// - `message`: Texte à afficher
  /// - `type`: Type de snackbar (détermine la couleur et l'icône)
  ///
  /// Exemple:
  /// ```dart
  /// // Succès
  /// emitEffect(ViewEffect.showSnackbar(
  ///   'Réservation confirmée',
  ///   type: SnackbarType.success,
  /// ));
  ///
  /// // Erreur
  /// emitEffect(ViewEffect.showSnackbar(
  ///   'Erreur réseau',
  ///   type: SnackbarType.error,
  /// ));
  /// ```
  const factory ViewEffect.showSnackbar(
    String message, {
    SnackbarType? type,
  }) = _ShowSnackbar;

  /// **Afficher un Toast** (message court en overlay)
  ///
  /// Message très court qui disparaît rapidement.
  /// Utilisé pour les confirmations simples (ex: "Copié", "Sauvegardé").
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.showToast('Copié dans le presse-papier'));
  /// ```
  const factory ViewEffect.showToast(String message) = _ShowToast;

  /// **Afficher un Dialog** (fenêtre modale)
  ///
  /// Fenêtre modale qui nécessite une action de l'utilisateur.
  /// Utilisé pour les confirmations importantes ou informations critiques.
  ///
  /// Paramètres:
  /// - `title`: Titre du dialog
  /// - `message`: Message détaillé
  /// - `confirmText`: Texte du bouton de confirmation (défaut: "OK")
  /// - `cancelText`: Texte du bouton d'annulation (optionnel)
  ///
  /// Exemple:
  /// ```dart
  /// // Confirmation de suppression
  /// emitEffect(ViewEffect.showDialog(
  ///   title: 'Supprimer le véhicule?',
  ///   message: 'Cette action est irréversible',
  ///   confirmText: 'Supprimer',
  ///   cancelText: 'Annuler',
  /// ));
  /// ```
  const factory ViewEffect.showDialog({
    required String title,
    required String message,
    String? confirmText,
    String? cancelText,
  }) = _ShowDialog;

  /// **Afficher un Bottom Sheet** (panneau depuis le bas)
  ///
  /// Panneau qui glisse depuis le bas de l'écran.
  /// Utilisé pour les options, filtres, ou formulaires.
  ///
  /// Paramètres:
  /// - `content`: Contenu du bottom sheet (widget name ou data)
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.showBottomSheet(
  ///   content: 'filter_options',
  /// ));
  /// ```
  const factory ViewEffect.showBottomSheet({
    required String content,
  }) = _ShowBottomSheet;

  // ============================================================================
  // ACTIONS SYSTÈME
  // ============================================================================

  /// **Copier dans le presse-papier**
  ///
  /// Copie du texte dans le clipboard système.
  /// Généralement suivi d'un Toast de confirmation.
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.copyToClipboard(bookingReference));
  /// emitEffect(ViewEffect.showToast('Référence copiée'));
  /// ```
  const factory ViewEffect.copyToClipboard(String text) = _CopyToClipboard;

  /// **Ouvrir une URL** (navigateur externe)
  ///
  /// Ouvre un lien dans le navigateur système ou l'app appropriée.
  ///
  /// Exemple:
  /// ```dart
  /// // Ouvrir les CGU
  /// emitEffect(ViewEffect.openUrl('https://autoloc.sn/terms'));
  ///
  /// // Ouvrir WhatsApp
  /// emitEffect(ViewEffect.openUrl('https://wa.me/221771234567'));
  /// ```
  const factory ViewEffect.openUrl(String url) = _OpenUrl;

  /// **Partager du texte** (share sheet système)
  ///
  /// Ouvre le sheet de partage natif du système.
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.shareText(
  ///   'Découvre ce véhicule sur AutoLoc: https://autoloc.sn/v/123',
  /// ));
  /// ```
  const factory ViewEffect.shareText(String text) = _ShareText;

  /// **Lancer un appel téléphonique**
  ///
  /// Ouvre le dialer avec le numéro pré-rempli.
  ///
  /// Exemple:
  /// ```dart
  /// emitEffect(ViewEffect.launchCall(owner.telephone));
  /// ```
  const factory ViewEffect.launchCall(String phone) = _LaunchCall;

  // ============================================================================
  // PERMISSIONS
  // ============================================================================

  /// **Demander une permission**
  ///
  /// Demande une permission système (caméra, localisation, etc.).
  ///
  /// Paramètres:
  /// - `permission`: Type de permission (ex: 'camera', 'location')
  ///
  /// Exemple:
  /// ```dart
  /// // Avant de capturer une photo KYC
  /// emitEffect(ViewEffect.requestPermission('camera'));
  /// ```
  const factory ViewEffect.requestPermission(String permission) = _RequestPermission;
}

/// **Types de Snackbar**
///
/// Détermine la couleur et l'icône du snackbar.
enum SnackbarType {
  /// Succès (vert) - Action réussie
  success,

  /// Erreur (rouge) - Échec d'une action
  error,

  /// Avertissement (orange) - Attention requise
  warning,

  /// Information (bleu) - Message informatif
  info,
}
