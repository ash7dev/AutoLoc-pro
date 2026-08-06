import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:go_router/go_router.dart';
import 'package:cached_network_image/cached_network_image.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../core/utils/formatters/money_formatter.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../domain/entities/vehicle.dart';
import '../providers/vehicle_providers.dart';

/// **VehicleBookingConfigScreen**
/// Écran de configuration de la réservation. Suit le même langage
/// visuel que le reste de l'app : glass sobre (blur 10), pas de glow,
/// icônes via EmeraldIconChip. Le seul accent fort reste le total
/// (bottom bar), comme le prix sur la fiche véhicule.
class VehicleBookingConfigScreen extends ConsumerStatefulWidget {
  const VehicleBookingConfigScreen({
    super.key,
    required this.vehicleId,
  });

  final String vehicleId;

  @override
  ConsumerState<VehicleBookingConfigScreen> createState() =>
      _VehicleBookingConfigScreenState();
}

class _VehicleBookingConfigScreenState
    extends ConsumerState<VehicleBookingConfigScreen> {
  DateTime? _dateDebut;
  DateTime? _dateFin;
  bool _horsDakar = false;
  bool _avecLivraison = false;
  final TextEditingController _adresseLivraisonController =
      TextEditingController();

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref
          .read(vehicleDetailsViewModelProvider.notifier)
          .initialize(widget.vehicleId);
    });
  }

  @override
  void dispose() {
    _adresseLivraisonController.dispose();
    super.dispose();
  }

  void _initDatesIfNeeded(Vehicle vehicle) {
    if (_dateDebut == null) {
      final tomorrow = DateTime.now().add(const Duration(days: 1));
      final defaultEnd =
          tomorrow.add(Duration(days: vehicle.joursMinimum.clamp(1, 365)));
      _dateDebut = tomorrow;
      _dateFin = defaultEnd;

      Future.microtask(() {
        final days = defaultEnd.difference(tomorrow).inDays;
        _triggerPriceCalculation(days);
      });
    }
  }

  int get _nbJours {
    if (_dateDebut == null || _dateFin == null) return 0;
    return _dateFin!.difference(_dateDebut!).inDays;
  }

  void _triggerPriceCalculation(int days) {
    ref.read(vehicleDetailsViewModelProvider.notifier).calculatePricing(
          days: days,
          horsDakar: _horsDakar,
        );
  }

  Future<void> _selectDate({
    required bool isStart,
    required Vehicle vehicle,
  }) async {
    final now = DateTime.now();
    final firstDate = isStart
        ? now.add(const Duration(days: 1))
        : (_dateDebut ?? now)
            .add(Duration(days: vehicle.joursMinimum.clamp(1, 365)));
    final lastDate = now.add(const Duration(days: 365));
    final initialDate = isStart
        ? (_dateDebut ?? firstDate)
        : (_dateFin ?? firstDate);

    final picked = await showDatePicker(
      context: context,
      initialDate: initialDate.isAfter(lastDate) ? lastDate : initialDate,
      firstDate: firstDate,
      lastDate: lastDate,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: kEmerald,
              onPrimary: Colors.black,
              surface: Color(0xFF1A1A1A),
              onSurface: Colors.white,
            ),
            dialogBackgroundColor: const Color(0xFF1A1A1A),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      setState(() {
        if (isStart) {
          _dateDebut = picked;
          final minFin =
              picked.add(Duration(days: vehicle.joursMinimum.clamp(1, 365)));
          if (_dateFin == null || _dateFin!.isBefore(minFin)) {
            _dateFin = minFin;
          }
        } else {
          _dateFin = picked;
        }
      });
      _triggerPriceCalculation(_nbJours);
    }
  }

  void _handleContinue(Vehicle vehicle) {
    if (_dateDebut == null || _dateFin == null) return;
    context.push(
      Routes.withParams(
        Routes.createBooking,
        {
          'vehicleId': vehicle.id,
          'dateDebut': _dateDebut!.toIso8601String(),
          'dateFin': _dateFin!.toIso8601String(),
          'horsDakar': _horsDakar.toString(),
          'avecLivraison': _avecLivraison.toString(),
          'adresse': _avecLivraison ? _adresseLivraisonController.text : '',
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleDetailsStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: const Text('Configuration'),
        centerTitle: true,
        backgroundColor: Colors.black,
        elevation: 0,
        foregroundColor: Colors.white,
        titleTextStyle: DSTypography.bodyLarge.copyWith(
          color: Colors.white,
          fontWeight: FontWeight.w800,
          letterSpacing: -0.3,
        ),
      ),
      body: state.when(
        initial: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
        loading: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
        empty: (msg) => Center(
          child: Text(msg ?? 'Véhicule introuvable', style: const TextStyle(color: Colors.white)),
        ),
        failure: (msg, code) => Center(
          child: Text('Erreur : $msg', style: const TextStyle(color: Colors.white)),
        ),
        refreshing: (data) => _buildContent(data.vehicle, data.pricingPreview),
        success: (data) => _buildContent(data.vehicle, data.pricingPreview),
      ),
    );
  }

  Widget _buildContent(Vehicle vehicle, Map<String, dynamic>? pricingPreview) {
    _initDatesIfNeeded(vehicle);

    final dateFormat = DateFormat('EEE dd MMM', 'fr_FR');
    final nbJours = _nbJours;
    final datesValid = nbJours >= vehicle.joursMinimum;

    final double totalLocataire =
        (pricingPreview?['totalLocataire'] as num?)?.toDouble() ?? 0.0;
    final double deliveryFee = _avecLivraison ? (vehicle.fraisLivraison ?? 0.0) : 0.0;
    final double finalTotal = totalLocataire + deliveryFee;

    final bool canContinue = _dateDebut != null &&
        _dateFin != null &&
        datesValid &&
        (!_avecLivraison || _adresseLivraisonController.text.trim().isNotEmpty);

    return Column(
      children: [
        Expanded(
          child: ListView(
            padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md),
            children: [
              const SizedBox(height: DSSpacing.sm),

              _VehiclePhotoStrip(vehicle: vehicle),
              const SizedBox(height: DSSpacing.lg + DSSpacing.xs),

              _SectionLabel(label: 'Période de location'),
              const SizedBox(height: DSSpacing.sm),
              Row(
                children: [
                  Expanded(
                    child: _DateSelector(
                      label: 'Départ',
                      icon: Icons.flight_takeoff_rounded,
                      date: _dateDebut,
                      dateFormat: dateFormat,
                      onTap: () => _selectDate(isStart: true, vehicle: vehicle),
                    ),
                  ),
                  const SizedBox(width: DSSpacing.sm),
                  Expanded(
                    child: _DateSelector(
                      label: 'Retour',
                      icon: Icons.flight_land_rounded,
                      date: _dateFin,
                      dateFormat: dateFormat,
                      onTap: () => _selectDate(isStart: false, vehicle: vehicle),
                    ),
                  ),
                ],
              ),

              if (datesValid) ...[
                const SizedBox(height: DSSpacing.sm),
                _InlinePill(
                  icon: Icons.timelapse_rounded,
                  label: '$nbJours jour${nbJours > 1 ? 's' : ''} de location',
                  color: kEmerald,
                ),
              ],

              if (_dateDebut != null && !datesValid) ...[
                const SizedBox(height: DSSpacing.sm),
                _InlinePill(
                  icon: Icons.info_outline_rounded,
                  label: 'Minimum ${vehicle.joursMinimum} jour${vehicle.joursMinimum > 1 ? 's' : ''} requis',
                  color: DSColors.amber400,
                ),
              ],

              const SizedBox(height: DSSpacing.lg + DSSpacing.xs),

              _SectionLabel(label: 'Options'),
              const SizedBox(height: DSSpacing.sm),

              _OptionToggle(
                icon: Icons.map_outlined,
                label: 'Voyage Hors Dakar',
                subtitle: vehicle.autoriseHorsDakar
                    ? '+ ${MoneyFormatter.format(vehicle.supplementHorsDakarParJour ?? 0)} / jour'
                    : 'Non autorisé pour ce véhicule',
                enabled: vehicle.autoriseHorsDakar,
                value: _horsDakar,
                onChanged: (val) {
                  setState(() => _horsDakar = val);
                  if (nbJours > 0) {
                    _triggerPriceCalculation(nbJours);
                  }
                },
              ),

              const SizedBox(height: DSSpacing.sm),

              _OptionToggle(
                icon: Icons.local_shipping_outlined,
                label: 'Livraison à domicile',
                subtitle: vehicle.fraisLivraison != null
                    ? '+ ${MoneyFormatter.format(vehicle.fraisLivraison!)} (frais unique)'
                    : 'Non disponible',
                enabled: vehicle.fraisLivraison != null,
                value: _avecLivraison,
                onChanged: (val) {
                  setState(() => _avecLivraison = val);
                },
              ),

              if (_avecLivraison) ...[
                const SizedBox(height: DSSpacing.sm),
                PremiumGlassCard(
                  radius: PremiumRadius.chip,
                  blur: 10,
                  padding: const EdgeInsets.symmetric(horizontal: DSSpacing.sm, vertical: 4),
                  child: Row(
                    children: [
                      EmeraldIconChip(
                        icon: Icons.location_on_outlined,
                        size: 30,
                        iconSize: 15,
                        glow: false,
                      ),
                      const SizedBox(width: DSSpacing.sm),
                      Expanded(
                        child: TextField(
                          controller: _adresseLivraisonController,
                          onChanged: (_) => setState(() {}),
                          style: DSTypography.bodyMedium.copyWith(color: Colors.white),
                          decoration: InputDecoration(
                            hintText: 'Adresse de livraison...',
                            hintStyle: DSTypography.bodyMedium.copyWith(
                              color: DSColors.darkTextTertiary,
                            ),
                            border: InputBorder.none,
                            isDense: true,
                            contentPadding: EdgeInsets.zero,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],

              const SizedBox(height: DSSpacing.lg + DSSpacing.xs),

              if (datesValid && pricingPreview != null) ...[
                _SectionLabel(label: 'Récapitulatif'),
                const SizedBox(height: DSSpacing.sm),
                _PricingSummaryCard(
                  nbJours: nbJours,
                  totalLocataire: totalLocataire,
                  deliveryFee: deliveryFee,
                  finalTotal: finalTotal,
                  supplementHorsDakar: _horsDakar && vehicle.autoriseHorsDakar
                      ? (vehicle.supplementHorsDakarParJour ?? 0) * nbJours
                      : 0,
                ),
                const SizedBox(height: DSSpacing.lg),
              ],

              const _TrustBadge(),
              const SizedBox(height: DSSpacing.lg + DSSpacing.md),
            ],
          ),
        ),

        _BottomBar(
          canContinue: canContinue,
          finalTotal: finalTotal,
          datesValid: datesValid,
          pricingAvailable: pricingPreview != null,
          onContinue: () => _handleContinue(vehicle),
        ),
      ],
    );
  }
}

// =============================================================================
// WIDGET: Galerie photos horizontale + nom véhicule
// =============================================================================

class _VehiclePhotoStrip extends StatelessWidget {
  const _VehiclePhotoStrip({required this.vehicle});
  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    final photos = vehicle.photos;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        SizedBox(
          height: 90,
          child: photos.isEmpty
              ? _buildPlaceholder()
              : ListView.separated(
                  scrollDirection: Axis.horizontal,
                  itemCount: photos.length,
                  separatorBuilder: (_, __) => const SizedBox(width: DSSpacing.xs),
                  itemBuilder: (context, index) {
                    final photo = photos[index];
                    return ClipRRect(
                      borderRadius: BorderRadius.circular(PremiumRadius.chip),
                      child: CachedNetworkImage(
                        imageUrl: photo.url,
                        width: 120,
                        height: 90,
                        fit: BoxFit.cover,
                        placeholder: (_, __) => Container(
                          width: 120,
                          height: 90,
                          color: Colors.white.withOpacity(0.05),
                        ),
                        errorWidget: (_, __, ___) => Container(
                          width: 120,
                          height: 90,
                          color: Colors.white.withOpacity(0.05),
                          child: const Icon(Icons.broken_image_outlined,
                              color: DSColors.darkTextTertiary, size: 24),
                        ),
                      ),
                    );
                  },
                ),
        ),
        const SizedBox(height: DSSpacing.sm),
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${vehicle.marque} ${vehicle.modele}',
                    style: DSTypography.h5.copyWith(
                      color: Colors.white,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const SizedBox(height: 2),
                  Text(
                    '${vehicle.annee} · ${vehicle.ville}',
                    style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
                  ),
                ],
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: DSSpacing.sm + 2, vertical: 6),
              decoration: BoxDecoration(
                gradient: DSColors.emeraldGradient,
                borderRadius: BorderRadius.circular(10),
              ),
              child: Text(
                '${vehicle.prixFormateLocataire}/j',
                style: DSTypography.labelSmall.copyWith(
                  color: Colors.white,
                  fontWeight: FontWeight.w800,
                  letterSpacing: -0.2,
                ),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildPlaceholder() {
    return Container(
      width: 120,
      height: 90,
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(PremiumRadius.chip),
      ),
      child: const Icon(Icons.directions_car_rounded, color: DSColors.darkTextTertiary, size: 32),
    );
  }
}

// =============================================================================
// WIDGET: Label de section (eyebrow, cohérent avec les autres écrans)
// =============================================================================

class _SectionLabel extends StatelessWidget {
  const _SectionLabel({required this.label});
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

// =============================================================================
// WIDGET: Pill inline (durée, alerte) — un seul composant réutilisé
// =============================================================================

class _InlinePill extends StatelessWidget {
  const _InlinePill({required this.icon, required this.label, required this.color});
  final IconData icon;
  final String label;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return PremiumGlassCard(
      radius: PremiumRadius.chip,
      blur: 10,
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: 10),
      child: Row(
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: DSSpacing.sm),
          Expanded(
            child: Text(
              label,
              style: DSTypography.bodySmall.copyWith(color: color, fontWeight: FontWeight.w700),
            ),
          ),
        ],
      ),
    );
  }
}

// =============================================================================
// WIDGET: Sélecteur de date individuel
// =============================================================================

class _DateSelector extends StatelessWidget {
  const _DateSelector({
    required this.label,
    required this.icon,
    required this.date,
    required this.dateFormat,
    required this.onTap,
  });

  final String label;
  final IconData icon;
  final DateTime? date;
  final DateFormat dateFormat;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final bool active = date != null;
    return GestureDetector(
      onTap: onTap,
      child: PremiumGlassCard(
        radius: PremiumRadius.chip,
        blur: 10,
        accent: active,
        padding: const EdgeInsets.all(DSSpacing.sm + 2),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(icon, size: 14, color: active ? kEmerald : DSColors.darkTextTertiary),
                const SizedBox(width: 6),
                Text(
                  label,
                  style: DSTypography.labelSmall.copyWith(
                    color: DSColors.darkTextTertiary,
                    fontWeight: FontWeight.w700,
                    fontSize: 11,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              active ? dateFormat.format(date!) : 'Sélectionner...',
              style: DSTypography.bodyMedium.copyWith(
                color: active ? Colors.white : DSColors.darkTextSecondary,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.2,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// WIDGET: Toggle d'option (Hors Dakar, Livraison)
// =============================================================================

class _OptionToggle extends StatelessWidget {
  const _OptionToggle({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.enabled,
    required this.value,
    required this.onChanged,
  });

  final IconData icon;
  final String label;
  final String subtitle;
  final bool enabled;
  final bool value;
  final ValueChanged<bool> onChanged;

  @override
  Widget build(BuildContext context) {
    final bool active = value && enabled;
    return Opacity(
      opacity: enabled ? 1.0 : 0.4,
      child: PremiumGlassCard(
        radius: PremiumRadius.chip,
        blur: 10,
        accent: active,
        padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.sm + 2),
        child: Row(
          children: [
            EmeraldIconChip(icon: icon, size: 36, iconSize: 18, glow: false),
            const SizedBox(width: DSSpacing.sm + 2),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label,
                    style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    subtitle,
                    style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, fontSize: 11),
                  ),
                ],
              ),
            ),
            SizedBox(
              height: 24,
              width: 44,
              child: Switch.adaptive(
                value: value,
                onChanged: enabled ? onChanged : null,
                activeColor: kEmerald,
                activeTrackColor: kEmerald.withOpacity(0.3),
                inactiveTrackColor: Colors.white.withOpacity(0.08),
                inactiveThumbColor: Colors.white.withOpacity(0.3),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// =============================================================================
// WIDGET: Carte récapitulative du prix
// =============================================================================

class _PricingSummaryCard extends StatelessWidget {
  const _PricingSummaryCard({
    required this.nbJours,
    required this.totalLocataire,
    required this.deliveryFee,
    required this.finalTotal,
    required this.supplementHorsDakar,
  });

  final int nbJours;
  final double totalLocataire;
  final double deliveryFee;
  final double finalTotal;
  final double supplementHorsDakar;

  @override
  Widget build(BuildContext context) {
    final baseLocationTotal = totalLocataire - supplementHorsDakar;
    final prixParJour = nbJours > 0 ? (baseLocationTotal / nbJours).round() : 0;

    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        children: [
          _PricingRow(
            label: '${MoneyFormatter.format(prixParJour)} × $nbJours jour${nbJours > 1 ? 's' : ''}',
            value: MoneyFormatter.format(baseLocationTotal.round()),
          ),
          if (supplementHorsDakar > 0) ...[
            const SizedBox(height: DSSpacing.sm),
            _PricingRow(
              label: 'Supplément Hors Dakar',
              value: MoneyFormatter.format(supplementHorsDakar.round()),
              icon: Icons.map_outlined,
            ),
          ],
          if (deliveryFee > 0) ...[
            const SizedBox(height: DSSpacing.sm),
            _PricingRow(
              label: 'Frais de livraison',
              value: MoneyFormatter.format(deliveryFee.round()),
              icon: Icons.local_shipping_outlined,
            ),
          ],
          const SizedBox(height: DSSpacing.sm + 2),
          Container(height: 1, color: Colors.white.withOpacity(0.08)),
          const SizedBox(height: DSSpacing.sm + 2),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total',
                style: DSTypography.bodyLarge.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
              ),
              Text(
                MoneyFormatter.format(finalTotal.round()),
                style: DSTypography.h5.copyWith(
                  color: kEmerald,
                  fontWeight: FontWeight.w900,
                  letterSpacing: -0.5,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _PricingRow extends StatelessWidget {
  const _PricingRow({required this.label, required this.value, this.icon});
  final String label;
  final String value;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (icon != null) ...[
              Icon(icon, size: 14, color: DSColors.darkTextTertiary),
              const SizedBox(width: 6),
            ],
            Text(label, style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary)),
          ],
        ),
        Text(
          value,
          style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
        ),
      ],
    );
  }
}

// =============================================================================
// WIDGET: Badge de confiance / Séquestre
// =============================================================================

class _TrustBadge extends StatelessWidget {
  const _TrustBadge();

  @override
  Widget build(BuildContext context) {
    return PremiumGlassCard(
      radius: PremiumRadius.card,
      blur: 10,
      padding: const EdgeInsets.all(DSSpacing.md),
      child: Column(
        children: [
          EmeraldIconChip(
            icon: Icons.verified_user_rounded,
            size: 44,
            iconSize: 22,
            glow: false,
          ),
          const SizedBox(height: DSSpacing.sm),
          Text(
            'Paiement sécurisé par séquestre',
            textAlign: TextAlign.center,
            style: DSTypography.bodyMedium.copyWith(
              color: Colors.white,
              fontWeight: FontWeight.w800,
              letterSpacing: -0.2,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Votre argent est conservé en toute sécurité. Le propriétaire ne reçoit le paiement qu\'après confirmation de la réservation.',
            textAlign: TextAlign.center,
            style: DSTypography.labelSmall.copyWith(
              color: DSColors.darkTextTertiary,
              height: 1.5,
              fontSize: 11,
            ),
          ),
          const SizedBox(height: DSSpacing.sm),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              _TrustMiniIcon(icon: Icons.shield_outlined, label: '100% Sécurisé'),
              const SizedBox(width: DSSpacing.md),
              _TrustMiniIcon(icon: Icons.access_time_rounded, label: 'Annulation 24h'),
              const SizedBox(width: DSSpacing.md),
              _TrustMiniIcon(icon: Icons.support_agent_rounded, label: 'Support 7/7'),
            ],
          ),
        ],
      ),
    );
  }
}

class _TrustMiniIcon extends StatelessWidget {
  const _TrustMiniIcon({required this.icon, required this.label});
  final IconData icon;
  final String label;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Icon(icon, size: 16, color: kEmerald.withOpacity(0.7)),
        const SizedBox(height: 4),
        Text(
          label,
          style: DSTypography.labelSmall.copyWith(
            color: DSColors.darkTextTertiary,
            fontSize: 9.5,
            fontWeight: FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// WIDGET: Barre du bas (Total + Bouton)
// =============================================================================

class _BottomBar extends StatelessWidget {
  const _BottomBar({
    required this.canContinue,
    required this.finalTotal,
    required this.datesValid,
    required this.pricingAvailable,
    required this.onContinue,
  });

  final bool canContinue;
  final double finalTotal;
  final bool datesValid;
  final bool pricingAvailable;
  final VoidCallback onContinue;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.fromLTRB(DSSpacing.md, DSSpacing.sm, DSSpacing.md, 0),
      decoration: BoxDecoration(
        color: Colors.black,
        border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
      ),
      child: SafeArea(
        child: Row(
          children: [
            if (datesValid && pricingAvailable) ...[
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    'Total',
                    style: DSTypography.labelSmall.copyWith(
                      color: DSColors.darkTextTertiary,
                      fontSize: 11,
                    ),
                  ),
                  Text(
                    MoneyFormatter.format(finalTotal.round()),
                    style: DSTypography.bodyLarge.copyWith(
                      color: kEmerald,
                      fontWeight: FontWeight.w900,
                      letterSpacing: -0.5,
                    ),
                  ),
                ],
              ),
              const SizedBox(width: DSSpacing.md),
            ],
            Expanded(
              child: PrimaryButton(
                label: 'Continuer',
                icon: Icons.arrow_forward_rounded,
                iconPosition: IconPosition.right,
                isDisabled: !canContinue,
                onPressed: onContinue,
                fullWidth: true,
              ),
            ),
          ],
        ),
      ),
    );
  }
}