import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/atoms/inputs/app_text_field.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/enums/payment_provider.dart';
import '../../../../shared/enums/payment_status.dart';
import '../../../vehicle/presentation/providers/vehicle_providers.dart';
import '../providers/booking_providers.dart';

/// **BookingPaymentScreen**
/// Checkout final. Même système visuel : glass sobre (blur 10),
/// icônes via EmeraldIconChip, un seul badge réutilisé (`_Eyebrow`).
/// Les couleurs Wave/Orange Money restent des couleurs de marque —
/// seule exception volontaire à la palette émeraude.
class BookingPaymentScreen extends ConsumerStatefulWidget {
  const BookingPaymentScreen({
    super.key,
    required this.vehicleId,
    required this.dateDebut,
    required this.dateFin,
    required this.horsDakar,
    required this.avecLivraison,
    required this.adresse,
  });

  final String vehicleId;
  final DateTime dateDebut;
  final DateTime dateFin;
  final bool horsDakar;
  final bool avecLivraison;
  final String adresse;

  @override
  ConsumerState<BookingPaymentScreen> createState() => _BookingPaymentScreenState();
}

class _BookingPaymentScreenState extends ConsumerState<BookingPaymentScreen> {
  PaymentProvider _selectedProvider = PaymentProvider.wave;
  final TextEditingController _phoneController = TextEditingController();
  bool _contractAccepted = false;
  String? _localError;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(bookingPaymentViewModelProvider.notifier).initialize(
            vehiculeId: widget.vehicleId,
            dateDebut: widget.dateDebut,
            dateFin: widget.dateFin,
            horsDakar: widget.horsDakar,
            adresseLivraison: widget.avecLivraison && widget.adresse.isNotEmpty ? widget.adresse : null,
          );

      ref.read(vehicleDetailsViewModelProvider.notifier).initialize(widget.vehicleId);
    });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  void _handlePaymentSubmit() {
    setState(() => _localError = null);

    final phone = _phoneController.text.trim();
    if (phone.replaceAll(' ', '').replaceAll('-', '').length < 8) {
      setState(() => _localError = 'Veuillez saisir un numéro de téléphone mobile valide.');
      return;
    }

    ref.read(bookingPaymentViewModelProvider.notifier).confirmAndPay(
          provider: _selectedProvider,
          payerPhone: phone,
        );
  }

  @override
  Widget build(BuildContext context) {
    final paymentState = ref.watch(bookingPaymentStateProvider);
    final vehicleState = ref.watch(vehicleDetailsStateProvider);
    final dateFormat = DateFormat('dd MMMM yyyy', 'fr_FR');

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white),
          onPressed: () => context.pop(),
        ),
        title: Text(
          'Finaliser la réservation',
          style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
        ),
      ),
      body: paymentState.when(
        initial: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
        loading: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
        refreshing: (data) => _buildProcessingState(data.paymentStatus, _selectedProvider),
        empty: (msg) => Center(child: Text(msg ?? 'Données indisponibles', style: const TextStyle(color: Colors.white))),
        failure: (msg, code) => _buildErrorState(msg),
        success: (paymentData) {
          if (paymentData.paymentStatus == PaymentStatus.pending) {
            return _buildWaitingState(
              paymentData.booking?.totalLocataire ?? 0,
              paymentData.booking?.id ?? '',
            );
          }

          return vehicleState.maybeWhen(
            success: (vehicleData) {
              final vehicle = vehicleData.vehicle;
              final costMap = paymentData.calculatedCost;

              final baseCost = costMap != null ? (costMap['totalBase'] as num?)?.toDouble() ?? 0.0 : 0.0;
              final commission = costMap != null ? (costMap['montantCommission'] as num?)?.toDouble() ?? 0.0 : 0.0;
              final deliveryFee = (widget.avecLivraison && vehicle.fraisLivraison != null) ? vehicle.fraisLivraison! : 0.0;
              final supplementDakar = costMap != null ? (costMap['supplementHorsDakar'] as num?)?.toDouble() ?? 0.0 : 0.0;
              final totalCost = costMap != null ? (costMap['totalLocataire'] as num?)?.toDouble() ?? 0.0 : 0.0;
              final grandTotal = totalCost + deliveryFee;

              final days = widget.dateFin.difference(widget.dateDebut).inDays;

              return Column(
                children: [
                  Expanded(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.sm),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          _buildVehicleRecapCard(vehicle, days, dateFormat),
                          const SizedBox(height: DSSpacing.md),
                          _buildPriceDetailsCard(baseCost, days, commission, deliveryFee, supplementDakar, grandTotal),
                          const SizedBox(height: DSSpacing.md),
                          _buildPaymentMethodCard(),
                          const SizedBox(height: DSSpacing.md),
                          _buildPhoneInputCard(),
                          const SizedBox(height: DSSpacing.md),
                          _buildTermsCard(),
                          const SizedBox(height: DSSpacing.lg),
                        ],
                      ),
                    ),
                  ),
                  _buildBottomBar(grandTotal),
                ],
              );
            },
            loading: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
            orElse: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
          );
        },
      ),
    );
  }

  // =========================================================================
  // SUB-WIDGETS
  // =========================================================================

  Widget _buildVehicleRecapCard(dynamic vehicle, int days, DateFormat dateFormat) {
    final photoUrl = vehicle.photoPrincipale ?? '';

    return PremiumGlassCard(
      radius: PremiumRadius.hero,
      blur: 10,
      padding: EdgeInsets.zero,
      child: Column(
        children: [
          if (photoUrl.isNotEmpty)
            ClipRRect(
              borderRadius: BorderRadius.vertical(top: Radius.circular(PremiumRadius.hero)),
              child: SizedBox(
                height: 140,
                width: double.infinity,
                child: CachedNetworkImage(
                  imageUrl: photoUrl,
                  fit: BoxFit.cover,
                  errorWidget: (context, url, err) => Container(color: Colors.grey.shade900),
                ),
              ),
            ),
          Padding(
            padding: const EdgeInsets.all(DSSpacing.md),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            vehicle.nomComplet,
                            style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '${vehicle.ville} · ${vehicle.annee}',
                            style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary),
                          ),
                        ],
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                      decoration: BoxDecoration(
                        color: kEmerald.withOpacity(0.14),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: kEmerald.withOpacity(0.3)),
                      ),
                      child: Text(
                        '$days j',
                        style: DSTypography.bodySmall.copyWith(color: kEmerald, fontWeight: FontWeight.w800),
                      ),
                    ),
                  ],
                ),
                const Padding(
                  padding: EdgeInsets.symmetric(vertical: 12),
                  child: Divider(color: Colors.white10),
                ),
                Row(
                  children: [
                    EmeraldIconChip(
                      icon: Icons.calendar_today_rounded,
                      size: 30,
                      iconSize: 15,
                      glow: false,
                    ),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: Text(
                        'Du ${dateFormat.format(widget.dateDebut)} au ${dateFormat.format(widget.dateFin)}',
                        style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPriceDetailsCard(
    double baseCost,
    int days,
    double commission,
    double deliveryFee,
    double supplementDakar,
    double grandTotal,
  ) {
    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Eyebrow(label: 'Récapitulatif du prix'),
          const SizedBox(height: 16),
          _buildPriceRow(label: 'Location de base ($days jours)', value: '${baseCost.round()} FCFA'),
          const SizedBox(height: 12),
          _buildPriceRow(label: 'Frais de service AutoLoc', value: '${commission.round()} FCFA'),
          if (supplementDakar > 0) ...[
            const SizedBox(height: 12),
            _buildPriceRow(label: 'Option Voyage Hors Dakar', value: '${supplementDakar.round()} FCFA'),
          ],
          if (deliveryFee > 0) ...[
            const SizedBox(height: 12),
            _buildPriceRow(label: 'Livraison à domicile', value: '${deliveryFee.round()} FCFA'),
          ],
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 16),
            child: Divider(color: Colors.white10),
          ),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total à payer',
                style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
              ),
              Text(
                '${grandTotal.round()} FCFA',
                style: DSTypography.h5.copyWith(color: kEmerald, fontWeight: FontWeight.w900),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildPriceRow({required String label, required String value}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(label, style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary)),
        Text(value, style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w700)),
      ],
    );
  }

  Widget _buildPaymentMethodCard() {
    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Eyebrow(label: 'Moyen de paiement'),
          const SizedBox(height: 16),
          _buildPaymentOption(
            provider: PaymentProvider.wave,
            logoPath: 'assets/images/logowave.png',
            label: 'Wave',
            sublabel: 'Notification push instantanée dans l\'app Wave',
            selectedColor: const Color(0xFF1B68F9),
          ),
          const SizedBox(height: 12),
          _buildPaymentOption(
            provider: PaymentProvider.orangeMoney,
            logoPath: 'assets/images/logoOm.png',
            label: 'Orange Money',
            sublabel: 'Validation rapide Orange Money / Maxit',
            selectedColor: const Color(0xFFFF6600),
          ),
        ],
      ),
    );
  }

  Widget _buildPaymentOption({
    required PaymentProvider provider,
    required String logoPath,
    required String label,
    required String sublabel,
    required Color selectedColor,
  }) {
    final isSelected = _selectedProvider == provider;

    return InkWell(
      onTap: () => setState(() => _selectedProvider = provider),
      borderRadius: BorderRadius.circular(PremiumRadius.chip),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.all(DSSpacing.md),
        decoration: BoxDecoration(
          color: isSelected ? selectedColor.withOpacity(0.08) : Colors.white.withOpacity(0.03),
          borderRadius: BorderRadius.circular(PremiumRadius.chip),
          border: Border.all(
            color: isSelected ? selectedColor : Colors.white.withOpacity(0.1),
            width: isSelected ? 1.6 : 1,
          ),
        ),
        child: Row(
          children: [
            ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: Image.asset(logoPath, width: 44, height: 44, fit: BoxFit.cover),
            ),
            const SizedBox(width: DSSpacing.md),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(label, style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text(sublabel, style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary)),
                ],
              ),
            ),
            Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: isSelected ? selectedColor : Colors.white24, width: 2),
                color: isSelected ? selectedColor : Colors.transparent,
              ),
              child: isSelected ? const Icon(Icons.check_rounded, color: Colors.white, size: 14) : null,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPhoneInputCard() {
    final phonePlaceholder = _selectedProvider == PaymentProvider.wave
        ? 'Numéro Wave (ex: 77 000 00 00)'
        : 'Numéro Orange (ex: 77 000 00 00)';

    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _Eyebrow(label: 'Numéro de téléphone'),
          const SizedBox(height: 16),
          AppTextField(
            controller: _phoneController,
            keyboardType: TextInputType.phone,
            hint: phonePlaceholder,
            prefixIcon: const Icon(Icons.phone_iphone_rounded, color: Colors.white54),
            onChanged: (val) {
              if (_localError != null) setState(() => _localError = null);
            },
          ),
          if (_localError != null) ...[
            const SizedBox(height: DSSpacing.xs),
            Row(
              children: [
                const Icon(Icons.warning_amber_rounded, color: DSColors.red500, size: 16),
                const SizedBox(width: 6),
                Expanded(
                  child: Text(_localError!, style: DSTypography.bodySmall.copyWith(color: DSColors.red500)),
                ),
              ],
            ),
          ],
          const SizedBox(height: 12),
          Align(
            alignment: Alignment.center,
            child: Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(Icons.lock_rounded, size: 12, color: Colors.white.withOpacity(0.3)),
                const SizedBox(width: 4),
                Text(
                  'Paiement crypté et 100% sécurisé',
                  style: TextStyle(color: Colors.white.withOpacity(0.3), fontSize: 11),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTermsCard() {
    return InkWell(
      onTap: () => setState(() => _contractAccepted = !_contractAccepted),
      borderRadius: BorderRadius.circular(PremiumRadius.card),
      child: PremiumGlassCard(
        radius: PremiumRadius.card,
        blur: 10,
        accent: _contractAccepted,
        padding: const EdgeInsets.all(DSSpacing.md),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Checkbox(
              value: _contractAccepted,
              onChanged: (val) => setState(() => _contractAccepted = val ?? false),
              activeColor: kEmerald,
              checkColor: Colors.black,
            ),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Accepter les conditions',
                    style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'J\'accepte les conditions générales et le contrat de réservation d\'AutoLoc. Je comprends que l\'annulation est soumise à la politique de remboursement.',
                    style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, height: 1.4),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBottomBar(double grandTotal) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        color: DSColors.darkSurfaceGlass,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: SafeArea(
        top: false,
        child: PrimaryButton(
          label: 'Payer ${grandTotal.round()} FCFA',
          isDisabled: !_contractAccepted,
          onPressed: _handlePaymentSubmit,
        ),
      ),
    );
  }

  // =========================================================================
  // STATES: processing / waiting / error
  // =========================================================================

  Widget _buildProcessingState(PaymentStatus? status, PaymentProvider provider) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Stack(
            alignment: Alignment.center,
            children: [
              EmeraldIconChip(
                icon: Icons.sync_rounded,
                size: 72,
                iconSize: 0, // masqué, on affiche le loader par-dessus
                glow: false,
              ),
              const CircularProgressIndicator(color: kEmerald),
            ],
          ),
          const SizedBox(height: DSSpacing.lg),
          Text(
            'Envoi de la demande...',
            style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text(
            'Connexion sécurisée à ${provider == PaymentProvider.wave ? 'Wave' : 'Orange Money'}',
            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
          ),
        ],
      ),
    );
  }

  Widget _buildWaitingState(double montant, String reservationId) {
    final providerLabel = _selectedProvider == PaymentProvider.wave ? 'Wave' : 'Orange Money';

    return Center(
      child: SingleChildScrollView(
        padding: const EdgeInsets.all(DSSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            EmeraldIconChip(
              icon: Icons.smartphone_rounded,
              size: 90,
              iconSize: 40,
              glow: false,
            ),
            const SizedBox(height: DSSpacing.lg),
            Text(
              'Vérifiez votre téléphone',
              style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: DSSpacing.md),
            RichText(
              textAlign: TextAlign.center,
              text: TextSpan(
                style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary, height: 1.5),
                children: [
                  const TextSpan(text: 'Une demande de paiement de '),
                  TextSpan(
                    text: '${montant.round()} FCFA',
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                  const TextSpan(text: ' a été envoyée sur votre mobile via '),
                  TextSpan(
                    text: providerLabel,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w800),
                  ),
                  const TextSpan(text: '. Approuvez la transaction pour valider votre réservation.'),
                ],
              ),
            ),
            const SizedBox(height: DSSpacing.lg),
            PremiumGlassCard(
              radius: 100,
              blur: 10,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(
                    width: 14,
                    height: 14,
                    child: CircularProgressIndicator(color: Colors.white70, strokeWidth: 2),
                  ),
                  const SizedBox(width: 10),
                  Text(
                    'En attente de confirmation...',
                    style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
                  ),
                ],
              ),
            ),
            const SizedBox(height: DSSpacing.xl),
            PrimaryButton(
              label: 'Vérifier mon paiement',
              onPressed: () {
                ref.read(bookingPaymentViewModelProvider.notifier).verifyPaymentStatus(reservationId);
              },
            ),
            const SizedBox(height: 12),
            TextButton(
              onPressed: () {
                ref.read(bookingPaymentViewModelProvider.notifier).stopStatusPolling();
                context.pushReplacement(Routes.myBookings);
              },
              child: Text(
                'Voir mes réservations',
                style: DSTypography.bodyMedium.copyWith(
                  color: DSColors.darkTextTertiary,
                  decoration: TextDecoration.underline,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildErrorState(String message) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(DSSpacing.lg),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Container(
              width: 70,
              height: 70,
              decoration: BoxDecoration(
                color: DSColors.red500.withOpacity(0.12),
                shape: BoxShape.circle,
                border: Border.all(color: DSColors.red500.withOpacity(0.25)),
              ),
              child: const Icon(Icons.shield_outlined, color: DSColors.red500, size: 36),
            ),
            const SizedBox(height: DSSpacing.lg),
            Text(
              'Erreur lors du paiement',
              style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 8),
            Text(
              message,
              textAlign: TextAlign.center,
              style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextTertiary),
            ),
            const SizedBox(height: DSSpacing.lg),
            PrimaryButton(
              label: 'Réessayer',
              onPressed: () {
                ref.read(bookingPaymentViewModelProvider.notifier).initialize(
                      vehiculeId: widget.vehicleId,
                      dateDebut: widget.dateDebut,
                      dateFin: widget.dateFin,
                      horsDakar: widget.horsDakar,
                      adresseLivraison: widget.avecLivraison && widget.adresse.isNotEmpty ? widget.adresse : null,
                    );
              },
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// SUB-COMPONENT: Eyebrow — remplace les 4 Text 'LETTRES.SPACÉES' dupliqués
// =============================================================================

class _Eyebrow extends StatelessWidget {
  const _Eyebrow({required this.label});
  final String label;

  @override
  Widget build(BuildContext context) {
    return Text(
      label.toUpperCase(),
      style: DSTypography.labelSmall.copyWith(
        color: DSColors.darkTextTertiary,
        fontWeight: FontWeight.w800,
        letterSpacing: 1.1,
      ),
    );
  }
}