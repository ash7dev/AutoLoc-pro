import 'package:flutter/material.dart';

import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/enums/vehicle_type.dart';
import '../../domain/entities/vehicle.dart';

/// **VehicleDetailSpecs**
/// Spécifications détaillées. Même langage visuel que VehicleSpecsGrid
/// et VehicleEquipmentsList : glass sobre (blur 10, pas de glow), icônes
/// discrètes. Les lignes "highlight" se distinguent uniquement par la
/// couleur (fond icône + texte émeraude), sans effet lumineux — la seule
/// zone de glow de l'écran reste la carte prix du header.
class VehicleDetailSpecs extends StatelessWidget {
  const VehicleDetailSpecs({
    super.key,
    required this.vehicle,
  });

  final Vehicle vehicle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Titre avec ligne décorative
        Row(
          children: [
            const EmeraldIconChip(
              icon: Icons.info_outline_rounded,
              size: 28,
              iconSize: 15,
              glow: false,
            ),
            const SizedBox(width: DSSpacing.xs),
            Text(
              'Informations détaillées',
              style: DSTypography.h5.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(width: DSSpacing.xs),
            Expanded(
              child: Container(
                height: 2,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      kEmerald.withOpacity(0.5),
                      Colors.transparent,
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.md),

        // Card principale — glass sobre, comme les autres blocs secondaires
        PremiumGlassCard(
          radius: PremiumRadius.card,
          blur: 10,
          padding: EdgeInsets.zero,
          child: Column(
            children: [
              if (vehicle.type != null)
                _SpecRow(
                  icon: Icons.layers_rounded,
                  label: 'Catégorie',
                  value: _getTypeLabel(vehicle.type!),
                  highlight: true,
                ),

              if (vehicle.ville != null)
                _SpecRow(
                  icon: Icons.location_on_rounded,
                  label: 'Localisation',
                  value: _getZoneLabel(vehicle.ville!),
                ),

              if (vehicle.immatriculation != null && vehicle.immatriculation!.isNotEmpty)
                _SpecRow(
                  icon: Icons.tag_rounded,
                  label: 'Immatriculation',
                  value: vehicle.immatriculation!,
                ),

              if (vehicle.fraisLivraison != null && vehicle.fraisLivraison! > 0)
                _SpecRow(
                  icon: Icons.local_shipping_rounded,
                  label: 'Livraison disponible',
                  value: '+${vehicle.fraisLivraison!.toStringAsFixed(0)} FCFA',
                  highlight: true,
                ),

              _SpecRow(
                icon: Icons.public_rounded,
                label: 'Zone de conduite',
                value: vehicle.autoriseHorsDakar == true
                    ? 'Hors Dakar autorisé${vehicle.supplementHorsDakarParJour != null && vehicle.supplementHorsDakarParJour! > 0 ? ' (+${vehicle.supplementHorsDakarParJour!.toStringAsFixed(0)} FCFA/j)' : ''}'
                    : vehicle.zoneConduite ?? 'Dakar uniquement',
                highlight: vehicle.autoriseHorsDakar == true,
              ),

              if (vehicle.tarifs.isNotEmpty)
                _SpecRow(
                  icon: Icons.trending_down_rounded,
                  label: 'Tarification',
                  value:
                      '${vehicle.tarifs.length} palier${vehicle.tarifs.length > 1 ? 's' : ''} dégressif${vehicle.tarifs.length > 1 ? 's' : ''}',
                ),

              if ((vehicle.carteGriseUrl != null && vehicle.carteGriseUrl!.isNotEmpty) ||
                  (vehicle.assuranceDocUrl != null && vehicle.assuranceDocUrl!.isNotEmpty))
                _SpecRow(
                  icon: Icons.verified_rounded,
                  label: 'Documents vérifiés',
                  value: _getDocumentsLabel(vehicle),
                  highlight: true,
                ),

              if (vehicle.assurance != null && vehicle.assurance!.isNotEmpty)
                _SpecRow(
                  icon: Icons.shield_rounded,
                  label: 'Assurance',
                  value: vehicle.assurance!,
                ),

              if (vehicle.carburantCondition != null && vehicle.carburantCondition!.isNotEmpty)
                _SpecRow(
                  icon: Icons.local_gas_station_rounded,
                  label: 'Politique carburant',
                  value: vehicle.carburantCondition!,
                  isLast: true,
                ),
            ],
          ),
        ),
      ],
    );
  }

  String _getTypeLabel(VehicleType type) => type.label;

  String _getZoneLabel(String ville) {
    const zoneLabels = {
      'almadies-ngor-mamelles': 'Almadies – Ngor – Mamelles',
      'ouakam-yoff': 'Ouakam – Yoff',
      'mermoz-sacrecoeur-ckg': 'Mermoz – Sacré-Cœur – CKG',
      'plateau-medina-gueuletapee': 'Plateau – Médina',
      'liberte-sicap-granddakar': 'Liberté – Sicap',
      'parcelles-grandyoff': 'Parcelles Assainies – Grand Yoff',
      'pikine-guediawaye': 'Pikine – Guédiawaye',
      'keurmassar-rufisque': 'Keur Massar – Rufisque',
    };
    return zoneLabels[ville] ?? ville;
  }

  String _getDocumentsLabel(Vehicle vehicle) {
    final docs = <String>[];
    if (vehicle.carteGriseUrl != null && vehicle.carteGriseUrl!.isNotEmpty) {
      docs.add('Carte grise');
    }
    if (vehicle.assuranceDocUrl != null && vehicle.assuranceDocUrl!.isNotEmpty) {
      docs.add('Assurance');
    }
    return docs.join(' + ');
  }
}

/// Row interne — icône sobre (pas de glow), label, valeur.
/// `highlight` ne change que la couleur, jamais l'intensité lumineuse.
class _SpecRow extends StatelessWidget {
  const _SpecRow({
    required this.icon,
    required this.label,
    required this.value,
    this.highlight = false,
    this.isLast = false,
  });

  final IconData icon;
  final String label;
  final String value;
  final bool highlight;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(DSSpacing.md),
      decoration: BoxDecoration(
        border: isLast
            ? null
            : Border(
                bottom: BorderSide(
                  color: Colors.white.withOpacity(0.08),
                  width: 1,
                ),
              ),
      ),
      child: Row(
        children: [
          EmeraldIconChip(
            icon: icon,
            size: 34,
            iconSize: 17,
            glow: false,
          ),
          const SizedBox(width: DSSpacing.md),

          Expanded(
            flex: 2,
            child: Text(
              label,
              style: DSTypography.bodySmall.copyWith(
                color: Colors.white.withOpacity(0.55),
                fontWeight: FontWeight.w600,
              ),
            ),
          ),

          Expanded(
            flex: 3,
            child: Text(
              value,
              style: DSTypography.bodySmall.copyWith(
                color: highlight ? kEmerald : Colors.white,
                fontWeight: FontWeight.w800,
              ),
              textAlign: TextAlign.right,
              maxLines: 2,
              overflow: TextOverflow.ellipsis,
            ),
          ),
        ],
      ),
    );
  }
}