import 'dart:io';
import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/atoms/inputs/app_text_field.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/enums/booking_status.dart';
import '../../../../shared/providers/session_providers.dart';
import '../providers/booking_providers.dart';

/// **BookingDetailsScreen**
/// Écran complet de consultation d'une réservation.
/// Gère les rôles Locataire (Tenant) / Propriétaire (Owner) et affiche les actions correspondantes
/// (Annulation, Check-in photos, Restitution Check-out, Litiges, Avis).
class BookingDetailsScreen extends ConsumerStatefulWidget {
  const BookingDetailsScreen({
    super.key,
    required this.bookingId,
  });

  final String bookingId;

  @override
  ConsumerState<BookingDetailsScreen> createState() => _BookingDetailsScreenState();
}

class _BookingDetailsScreenState extends ConsumerState<BookingDetailsScreen> {
  final ImagePicker _picker = ImagePicker();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(bookingDetailsViewModelProvider.notifier).initialize(widget.bookingId);
    });
  }

  // =========================================================================
  // ACTIONS ET DIALOGS UTILISATEURS
  // =========================================================================

  /// Ouvrir le sélecteur pour l'état des lieux (check-in / check-out)
  Future<void> _pickPhotosForEtatLieu(bool isCheckin) async {
    try {
      final List<XFile> images = await _picker.pickMultiImage(
        imageQuality: 70,
        maxWidth: 1024,
      );

      if (images.isNotEmpty) {
        final paths = images.map((img) => img.path).toList();
        if (isCheckin) {
          ref.read(bookingDetailsViewModelProvider.notifier).performCheckin(localPhotoPaths: paths);
        } else {
          ref.read(bookingDetailsViewModelProvider.notifier).performCheckout(localPhotoPaths: paths);
        }
      }
    } catch (e) {
      ref.read(bookingDetailsViewModelProvider.notifier).showError('Erreur de sélection d\'images : $e');
    }
  }

  /// Ouvrir le dialogue de motif d'annulation
  void _showCancelDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: DSColors.darkSurfaceGlass,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Annuler la réservation',
            style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Indiquez la raison de votre annulation. Cette action est irréversible.',
                style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary),
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: controller,
                label: 'Motif',
                hint: 'Ex: empêchement de dernière minute...',
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Retour', style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextTertiary)),
            ),
            TextButton(
              onPressed: () {
                final raison = controller.text.trim();
                if (raison.isNotEmpty) {
                  Navigator.pop(context);
                  ref.read(bookingDetailsViewModelProvider.notifier).cancel(raison: raison);
                }
              },
              child: Text(
                'Confirmer l\'annulation',
                style: DSTypography.bodyMedium.copyWith(color: DSColors.red500, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }

  /// Ouvrir le dialogue pour refuser le check-in (Litige)
  void _showDisputeDialog() {
    final motifController = TextEditingController();
    final descController = TextEditingController();
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: DSColors.darkSurfaceGlass,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Signaler un problème / Refuser',
            style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Si le véhicule n\'est pas conforme, vous pouvez refuser de le prendre. Un litige sera ouvert.',
                style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary),
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: motifController,
                label: 'Motif court',
                hint: 'Ex: Propreté, dysfonctionnement...',
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: descController,
                label: 'Description détaillée',
                hint: 'Décrivez précisément le problème constaté...',
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Annuler', style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextTertiary)),
            ),
            TextButton(
              onPressed: () {
                final motif = motifController.text.trim();
                final desc = descController.text.trim();
                if (motif.isNotEmpty && desc.isNotEmpty) {
                  Navigator.pop(context);
                  ref.read(bookingDetailsViewModelProvider.notifier).refuseCheckin(
                        motif: motif,
                        commentaire: desc,
                      );
                }
              },
              child: Text(
                'Ouvrir un litige',
                style: DSTypography.bodyMedium.copyWith(color: Colors.orange, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }

  /// Dialogue de confirmation pour le propriétaire
  void _showOwnerConfirmDialog() {
    final timeController = TextEditingController(text: '10:00');
    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          backgroundColor: DSColors.darkSurfaceGlass,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Text(
            'Confirmer la réservation',
            style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
          ),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                'Indiquez l\'heure prévue pour la remise des clés afin d\'officialiser la réservation.',
                style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary),
              ),
              const SizedBox(height: 16),
              AppTextField(
                controller: timeController,
                label: 'Heure de remise des clés',
                hint: 'Ex: 10:00 ou 14:30',
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: Text('Annuler', style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextTertiary)),
            ),
            TextButton(
              onPressed: () {
                final heure = timeController.text.trim();
                if (heure.isNotEmpty) {
                  Navigator.pop(context);
                  ref.read(bookingDetailsViewModelProvider.notifier).confirm(heureDebut: heure);
                }
              },
              child: Text(
                'Confirmer',
                style: DSTypography.bodyMedium.copyWith(color: DSColors.emerald500, fontWeight: FontWeight.bold),
              ),
            ),
          ],
        );
      },
    );
  }

  // =========================================================================
  // INTERFACE ET AFFICHAGES
  // =========================================================================

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(bookingDetailsStateProvider);
    final currentUserId = ref.watch(currentUserProvider);
    final dateFormat = DateFormat('dd MMMM yyyy à HH:mm', 'fr_FR');

    return Scaffold(
      backgroundColor: Colors.black,
      body: state.when(
        initial: () => const Center(child: CircularProgressIndicator(color: DSColors.emerald500)),
        loading: () => const Center(child: CircularProgressIndicator(color: DSColors.emerald500)),
        refreshing: (data) => _buildContent(data.booking, currentUserId, dateFormat, data.isUploadingPhotos),
        empty: (msg) => Center(child: Text(msg ?? 'Réservation introuvable', style: const TextStyle(color: Colors.white))),
        failure: (msg, code) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline_rounded, color: DSColors.red500, size: 48),
              const SizedBox(height: 16),
              Text(msg, style: const TextStyle(color: Colors.white)),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Réessayer',
                onPressed: () => ref.read(bookingDetailsViewModelProvider.notifier).load(),
              ),
            ],
          ),
        ),
        success: (data) => _buildContent(data.booking, currentUserId, dateFormat, data.isUploadingPhotos),
      ),
    );
  }

  Widget _buildContent(dynamic booking, String? currentUserId, DateFormat dateFormat, bool isUploading) {
    final isOwner = currentUserId == booking.proprietaireId;
    final otherPartyName = isOwner 
        ? '${booking.locataire?.prenom} ${booking.locataire?.nom}'
        : '${booking.proprietaire?.prenom} ${booking.proprietaire?.nom}';
    final otherPartyPhone = isOwner ? booking.locataire?.telephone : booking.proprietaire?.telephone;
    final otherPartyEmail = isOwner ? booking.locataire?.email : booking.proprietaire?.email;

    final days = booking.dateFin.difference(booking.dateDebut).inDays;
    final totalMoney = booking.totalLocataire;

    // Timeline steps mapping
    final timelineItems = [
      _TimelineItem(title: 'Réservation créée', date: booking.creeLe),
      if (booking.confirmeeLe != null) _TimelineItem(title: 'Confirmée par le propriétaire', date: booking.confirmeeLe),
      if (booking.checkinLe != null) _TimelineItem(title: 'Prise en charge effectuée', date: booking.checkinLe),
      if (booking.checkoutLe != null) _TimelineItem(title: 'Restitution effectuée', date: booking.checkoutLe),
      if (booking.annuleLe != null) _TimelineItem(title: 'Annulée', date: booking.annuleLe, isNegative: true),
    ];

    return Stack(
      children: [
        CustomScrollView(
          slivers: [
            // Sliver AppBar with transparent dark overlay
            SliverAppBar(
              backgroundColor: Colors.black,
              pinned: true,
              expandedHeight: 180.0,
              leading: IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
                onPressed: () => context.pop(),
              ),
              flexibleSpace: FlexibleSpaceBar(
                title: Text(
                  'Détails de location',
                  style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                ),
                background: Stack(
                  fit: StackFit.expand,
                  children: [
                    Image.network(
                      booking.paymentUrl != null ? 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600' : 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=600',
                      fit: BoxFit.cover,
                    ),
                    Container(
                      decoration: const BoxDecoration(
                        gradient: LinearGradient(
                          begin: Alignment.topCenter,
                          end: Alignment.bottomCenter,
                          colors: [Colors.black54, Colors.black],
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),

            // Content body list
            SliverPadding(
              padding: const EdgeInsets.all(DSSpacing.md),
              sliver: SliverList(
                delegate: SliverChildListDelegate([
                  // 1. Status Indicator Header Card
                  _buildStatusHeaderCard(booking.statut),
                  const SizedBox(height: DSSpacing.md),

                  // 2. Pricing Summary Card
                  _buildPricingCard(totalMoney, days),
                  const SizedBox(height: DSSpacing.md),

                  // 3. Rental Details Card (Dates / Deliveries)
                  _buildRentalPeriodCard(booking, dateFormat),
                  const SizedBox(height: DSSpacing.md),

                  // 4. Other Party Contact Information
                  _buildContactCard(otherPartyName, otherPartyPhone, otherPartyEmail, isOwner ? 'Locataire' : 'Propriétaire'),
                  const SizedBox(height: DSSpacing.md),

                  // 5. Timeline history steps
                  _buildTimelineCard(timelineItems, dateFormat),
                  const SizedBox(height: DSSpacing.lg),

                  // 6. Action panels according to state
                  _buildActionControls(booking, isOwner),
                  const SizedBox(height: 80), // spacer for bottom action bar
                ]),
              ),
            ),
          ],
        ),

        // Photo uploading screen blocker overlay
        if (isUploading)
          Positioned.fill(
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 5, sigmaY: 5),
              child: Container(
                color: Colors.black54,
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const CircularProgressIndicator(color: DSColors.emerald500),
                      const SizedBox(height: 16),
                      Text(
                        'Téléversement des photos en cours...',
                        style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Ne quittez pas l\'application',
                        style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }

  // =========================================================================
  // SUB-CARD WIDGET IMPLEMENTATIONS
  // =========================================================================

  Widget _buildStatusHeaderCard(BookingStatus status) {
    Color statusColor;
    String statusText;
    String descriptionText;
    IconData icon;

    switch (status) {
      case BookingStatus.waitingPayment:
        statusColor = Colors.amber;
        statusText = 'En attente de paiement';
        descriptionText = 'La réservation est enregistrée. Effectuez le règlement pour bloquer le véhicule.';
        icon = Icons.payment_rounded;
        break;
      case BookingStatus.paid:
        statusColor = Colors.blue;
        statusText = 'Paiement confirmé';
        descriptionText = 'Paiement reçu. La réservation attend confirmation par le propriétaire.';
        icon = Icons.check_circle_rounded;
        break;
      case BookingStatus.confirmed:
        statusColor = DSColors.emerald500;
        statusText = 'Confirmée';
        descriptionText = 'La location est officiellement validée. Les coordonnées complètes sont désormais partagées.';
        icon = Icons.done_all_rounded;
        break;
      case BookingStatus.inProgress:
        statusColor = DSColors.emerald500;
        statusText = 'En cours';
        descriptionText = 'La location a démarré. Profitez bien de votre trajet en toute sécurité.';
        icon = Icons.directions_car_rounded;
        break;
      case BookingStatus.completed:
        statusColor = Colors.grey;
        statusText = 'Terminée';
        descriptionText = 'Le trajet s\'est achevé avec succès. Merci d\'avoir choisi AutoLoc !';
        icon = Icons.lock_clock_rounded;
        break;
      case BookingStatus.cancelled:
        statusColor = DSColors.red500;
        statusText = 'Annulée';
        descriptionText = 'Cette réservation a été annulée conformément à nos CGU.';
        icon = Icons.cancel_outlined;
        break;
      case BookingStatus.dispute:
        statusColor = Colors.orange;
        statusText = 'Litige ouvert';
        descriptionText = 'Un signalement ou litige a été ouvert. Nos équipes étudient le dossier.';
        icon = Icons.gavel_rounded;
        break;
      default:
        statusColor = Colors.grey;
        statusText = 'En attente';
        descriptionText = 'Traitement en cours...';
        icon = Icons.hourglass_empty_rounded;
    }

    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        color: statusColor.withOpacity(0.04),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: statusColor.withOpacity(0.12), width: 1.5),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: statusColor.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(icon, color: statusColor, size: 24),
          ),
          const SizedBox(width: DSSpacing.md),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  statusText,
                  style: DSTypography.bodyLarge.copyWith(color: statusColor, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 4),
                Text(
                  descriptionText,
                  style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextSecondary, height: 1.4),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPricingCard(double total, int days) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'MONTANT DE LA LOCATION',
                style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, letterSpacing: 1.2),
              ),
              const SizedBox(height: 6),
              Text(
                '$days jour${days > 1 ? 's' : ''} de location',
                style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
              ),
            ],
          ),
          Text(
            '${total.round()} FCFA',
            style: DSTypography.h5.copyWith(color: DSColors.emerald500, fontWeight: FontWeight.w900),
          ),
        ],
      ),
    );
  }

  Widget _buildRentalPeriodCard(dynamic booking, DateFormat dateFormat) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'PÉRIODE ET MODALITÉS',
            style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 16),
          _buildDetailRow(
            icon: Icons.calendar_month_rounded,
            label: 'Début',
            value: dateFormat.format(booking.dateDebut),
          ),
          const SizedBox(height: 12),
          _buildDetailRow(
            icon: Icons.event_busy_rounded,
            label: 'Restitution',
            value: dateFormat.format(booking.dateFin),
          ),
          if (booking.adresseLivraison != null) ...[
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 12),
              child: Divider(color: Colors.white10),
            ),
            _buildDetailRow(
              icon: Icons.local_shipping_rounded,
              label: 'Livraison',
              value: booking.adresseLivraison!,
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailRow({required IconData icon, required String label, required String value}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: DSColors.emerald500, size: 18),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label, style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary)),
              const SizedBox(height: 2),
              Text(value, style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
            ],
          ),
        ),
      ],
    );
  }

  Widget _buildContactCard(String name, String? phone, String? email, String role) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'COORDONNÉES DU $role'.toUpperCase(),
            style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              CircleAvatar(
                radius: 20,
                backgroundColor: Colors.white10,
                child: Text(name.isNotEmpty ? name[0] : 'U', style: const TextStyle(color: Colors.white)),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(name, style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                    const SizedBox(height: 2),
                    Text(email ?? 'Pas d\'email partagé', style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary)),
                  ],
                ),
              ),
              if (phone != null && phone.isNotEmpty)
                IconButton(
                  icon: const Icon(Icons.call_rounded, color: DSColors.emerald500),
                  onPressed: () {
                    ref.read(bookingDetailsViewModelProvider.notifier).launchCall(phone);
                  },
                ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildTimelineCard(List<_TimelineItem> items, DateFormat dateFormat) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.03),
        borderRadius: BorderRadius.circular(24),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'HISTORIQUE DES ÉTAPES',
            style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, letterSpacing: 1.2),
          ),
          const SizedBox(height: 20),
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: items.length,
            itemBuilder: (context, index) {
              final it = items[index];
              final isLast = index == items.length - 1;
              final dotColor = it.isNegative ? DSColors.red500 : DSColors.emerald500;

              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Column(
                    children: [
                      Container(
                        width: 12,
                        height: 12,
                        decoration: BoxDecoration(
                          shape: BoxShape.circle,
                          color: dotColor,
                        ),
                      ),
                      if (!isLast)
                        Container(
                          width: 2,
                          height: 40,
                          color: Colors.white12,
                        ),
                    ],
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(it.title, style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 2),
                        Text(dateFormat.format(it.date), style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary)),
                        const SizedBox(height: 20),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildActionControls(dynamic booking, bool isOwner) {
    final status = booking.statut;

    // ═══ CAS 1 : LOCATAIRE (Tenant) ═══
    if (!isOwner) {
      if (status == BookingStatus.confirmed) {
        // En attente de check-in par le locataire
        return Column(
          children: [
            PrimaryButton(
              label: 'Effectuer mon Check-in (Photos)',
              onPressed: () => _pickPhotosForEtatLieu(true),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: _showDisputeDialog,
              child: Text(
                'Signaler un problème avec le véhicule',
                style: DSTypography.bodyMedium.copyWith(color: Colors.orange, decoration: TextDecoration.underline),
              ),
            ),
          ],
        );
      }

      if (status == BookingStatus.waitingPayment) {
        return PrimaryButton(
          label: 'Effectuer le paiement',
          onPressed: () {
            context.push(
              Routes.withParams(
                Routes.createBooking,
                {
                  'vehicleId': booking.vehiculeId,
                  'dateDebut': booking.dateDebut.toIso8601String(),
                  'dateFin': booking.dateFin.toIso8601String(),
                  'horsDakar': booking.horsDakar.toString(),
                  'avecLivraison': (booking.adresseLivraison != null).toString(),
                  'adresse': booking.adresseLivraison ?? '',
                },
              ),
            );
          },
        );
      }

      if (status == BookingStatus.completed) {
        return _buildReviewFormSection();
      }
    }

    // ═══ CAS 2 : PROPRIÉTAIRE (Owner) ═══
    if (isOwner) {
      if (status == BookingStatus.paid) {
        return PrimaryButton(
          label: 'Accepter & Confirmer la réservation',
          onPressed: _showOwnerConfirmDialog,
        );
      }

      if (status == BookingStatus.confirmed) {
        return Column(
          children: [
            PrimaryButton(
              label: 'Valider le Check-in (Remise des clés)',
              onPressed: () => _pickPhotosForEtatLieu(true),
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                showDialog(
                  context: context,
                  builder: (context) {
                    final comments = TextEditingController();
                    return AlertDialog(
                      backgroundColor: DSColors.darkSurfaceGlass,
                      title: const Text('Signaler absence locataire', style: TextStyle(color: Colors.white)),
                      content: AppTextField(controller: comments, label: 'Commentaires'),
                      actions: [
                        TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
                        TextButton(
                          onPressed: () {
                            Navigator.pop(context);
                            ref.read(bookingDetailsViewModelProvider.notifier).signalNoShow(commentaire: comments.text);
                          },
                          child: const Text('Confirmer', style: TextStyle(color: Colors.orange)),
                        ),
                      ],
                    );
                  },
                );
              },
              child: Text(
                'Locataire absent ? Signaler No-Show',
                style: DSTypography.bodyMedium.copyWith(color: Colors.orange, decoration: TextDecoration.underline),
              ),
            ),
          ],
        );
      }

      if (status == BookingStatus.inProgress) {
        return PrimaryButton(
          label: 'Valider la Restitution (Check-out)',
          onPressed: () => _pickPhotosForEtatLieu(false),
        );
      }
    }

    // Bouton d'annulation générique (disponible pour les deux rôles si éligible)
    final canCancel = status == BookingStatus.waitingPayment || status == BookingStatus.confirmed;
    if (canCancel) {
      return Padding(
        padding: const EdgeInsets.only(top: 8.0),
        child: OutlinedButton(
          style: OutlinedButton.styleFrom(
            side: const BorderSide(color: DSColors.red500),
            padding: const EdgeInsets.symmetric(vertical: 16),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            minimumSize: const Size(double.infinity, 50),
          ),
          onPressed: _showCancelDialog,
          child: Text(
            'Annuler la location',
            style: DSTypography.bodyMedium.copyWith(color: DSColors.red500, fontWeight: FontWeight.bold),
          ),
        ),
      );
    }

    return const SizedBox.shrink();
  }

  Widget _buildReviewFormSection() {
    int note = 5;
    final commentController = TextEditingController();

    return StatefulBuilder(
      builder: (context, setStateBuilder) {
        return Container(
          padding: const EdgeInsets.all(DSSpacing.md),
          decoration: BoxDecoration(
            color: DSColors.emerald500.withOpacity(0.04),
            borderRadius: BorderRadius.circular(24),
            border: Border.all(color: DSColors.emerald500.withOpacity(0.1)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'LAISSER UN AVIS',
                style: DSTypography.labelSmall.copyWith(color: DSColors.emerald500, letterSpacing: 1.2),
              ),
              const SizedBox(height: 12),
              Text(
                'Partagez votre expérience globale sur cette location pour guider les prochains locataires.',
                style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextSecondary, height: 1.4),
              ),
              const SizedBox(height: 16),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) {
                  final starIndex = index + 1;
                  return IconButton(
                    icon: Icon(
                      starIndex <= note ? Icons.star_rounded : Icons.star_border_rounded,
                      color: Colors.amber,
                      size: 32,
                    ),
                    onPressed: () {
                      setStateBuilder(() {
                        note = starIndex;
                      });
                    },
                  );
                }),
              ),
              const SizedBox(height: 12),
              AppTextField(
                controller: commentController,
                label: 'Commentaire libre',
                hint: 'Dites-nous ce que vous avez pensé du véhicule et de l\'accueil...',
              ),
              const SizedBox(height: 16),
              PrimaryButton(
                label: 'Soumettre l\'avis',
                onPressed: () {
                  final comments = commentController.text.trim();
                  ref.read(bookingDetailsViewModelProvider.notifier).showSuccess('Avis soumis avec succès !');
                  ref.read(bookingDetailsViewModelProvider.notifier).load(); // reload state
                },
              ),
            ],
          ),
        );
      },
    );
  }
}

class _TimelineItem {
  final String title;
  final DateTime date;
  final bool isNegative;

  _TimelineItem({
    required this.title,
    required this.date,
    this.isNegative = false,
  });
}
