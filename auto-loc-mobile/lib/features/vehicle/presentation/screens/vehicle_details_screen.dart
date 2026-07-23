import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import '../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/providers/session_providers.dart';
import '../../../../shared/enums/kyc_status.dart';
import '../../../user/di/user_injection.dart';
import '../../../user/domain/entities/user.dart';
import '../../domain/entities/vehicle.dart';
import '../providers/vehicle_providers.dart';
import '../widgets/vehicle_image_carousel.dart';
import '../widgets/vehicle_info_header.dart';
import '../widgets/vehicle_specs_grid.dart';
import '../widgets/vehicle_detail_specs.dart';
import '../widgets/vehicle_rules_card.dart';
import '../widgets/vehicle_equipments_list.dart';
import '../widgets/vehicle_pricing_table.dart';
import '../widgets/vehicle_owner_card.dart';
import '../widgets/vehicle_reviews.dart';
import '../widgets/similar_vehicles.dart';
import '../widgets/vehicle_details_bottom_bar.dart';
import '../widgets/vehicle_details_shimmer.dart';
import '../widgets/reservation_gate_bottom_sheet.dart';

/// **VehicleDetailsScreen**
/// Page de détails du véhicule côté locataire avec affichage des informations
/// techniques, des règles et d'un bouton fixe pour ouvrir la sélection des dates.
class VehicleDetailsScreen extends ConsumerStatefulWidget {
  const VehicleDetailsScreen({
    super.key,
    required this.vehicleId,
  });

  final String vehicleId;

  @override
  ConsumerState<VehicleDetailsScreen> createState() => _VehicleDetailsScreenState();
}

class _VehicleDetailsScreenState extends ConsumerState<VehicleDetailsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      ref.read(vehicleDetailsViewModelProvider.notifier).initialize(widget.vehicleId);
    });
  }

  int _calculateAge(DateTime birthDate) {
    final today = DateTime.now();
    int age = today.year - birthDate.year;
    if (today.month < birthDate.month ||
        (today.month == birthDate.month && today.day < birthDate.day)) {
      age--;
    }
    return age;
  }

  String _resolveGate(User user, Vehicle vehicle) {
    final isProfileIncomplete = !user.profileCompleted || user.prenom.isEmpty || user.nom.isEmpty;
    if (isProfileIncomplete) return "create_profile";

    final phoneMissing = !user.phoneVerified || user.telephone.isEmpty;

    if (vehicle.ageMinimum > 0) {
      final ageDateMissing = user.dateNaissance == null;
      final userAge = ageDateMissing ? null : _calculateAge(user.dateNaissance!);
      final ageInsuffisant = !ageDateMissing && userAge != null && userAge < vehicle.ageMinimum;

      if (ageDateMissing) {
        if (phoneMissing) return "age_phone";
        return "age";
      }

      if (ageInsuffisant) return "age";
    }

    if (phoneMissing) return "phone";

    final kyc = user.statutKyc;
    if (kyc == KycStatus.notVerified || kyc == KycStatus.rejected) return "kyc";

    if (user.permisUrl == null || user.permisUrl!.isEmpty) return "permis";

    return "ready";
  }

  Future<void> _handleReservationPressed(Vehicle vehicle) async {
    // 1. Vérifier si l'utilisateur est connecté
    final isAuthenticated = ref.read(isAuthenticatedProvider);
    if (!isAuthenticated) {
      context.push(Routes.login);
      return;
    }

    // Afficher un indicateur de chargement
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(color: DSColors.emerald500),
      ),
    );

    try {
      final getProfile = ref.read(getProfileProvider);
      final profileResult = await getProfile();

      // Fermer l'indicateur de chargement
      if (mounted) Navigator.pop(context);

      profileResult.fold(
        (failure) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Erreur : ${failure.message}')),
          );
        },
        (user) {
          final gate = _resolveGate(user, vehicle);
          if (gate == "ready") {
            // L'utilisateur respecte tout -> Navigation vers la page de configuration de réservation
            context.push(
              Routes.withParams(
                Routes.configureBooking,
                {'vehicleId': vehicle.id},
              ),
            );
          } else {
            // L'utilisateur ne respecte pas tout -> Ouverture du bottom sheet de validation de gate
            _showGateBottomSheet(vehicle);
          }
        },
      );
    } catch (e) {
      if (mounted) Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Une erreur est survenue : $e')),
      );
    }
  }

  void _showGateBottomSheet(Vehicle vehicle) {
    showDialog(
      context: context,
      barrierDismissible: true,
      builder: (context) {
        return ReservationGateBottomSheet(
          vehicle: vehicle,
          onProceed: () {
            context.pop(); // Fermer la gate
            context.push(
              Routes.withParams(
                Routes.configureBooking,
                {'vehicleId': vehicle.id},
              ),
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final state = ref.watch(vehicleDetailsStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      body: state.when(
        initial: () => const VehicleDetailsShimmer(),
        loading: () => const VehicleDetailsShimmer(),
        empty: (message) => Center(
          child: Text(
            message ?? 'Véhicule introuvable',
            style: DSTypography.bodyMedium.copyWith(color: Colors.white),
          ),
        ),
        failure: (message, code) => Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(
                Icons.error_outline_rounded,
                color: DSColors.red600,
                size: 48,
              ),
              const SizedBox(height: DSSpacing.md),
              Text(
                message,
                style: DSTypography.bodyMedium.copyWith(color: Colors.white),
              ),
              const SizedBox(height: DSSpacing.md),
              PrimaryButton(
                label: 'Réessayer',
                onPressed: () {
                  ref.read(vehicleDetailsViewModelProvider.notifier).load();
                },
              ),
            ],
          ),
        ),
        refreshing: (data) => _buildContent(data.vehicle),
        success: (data) => _buildContent(data.vehicle),
      ),
    );
  }

  Widget _buildContent(Vehicle vehicle) {
    return Column(
      children: [
        Expanded(
          child: SingleChildScrollView(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Carrousel d'images avec bouton retour
                VehicleImageCarousel(
                  photos: vehicle.photos,
                  photoPrincipale: vehicle.photoPrincipale,
                  onBack: () => context.pop(),
                ),

                Padding(
                  padding: const EdgeInsets.all(DSSpacing.md),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Titre & Prix & Note globale du véhicule
                      VehicleInfoHeader(
                        nomComplet: vehicle.nomComplet,
                        ville: vehicle.ville,
                        adresse: vehicle.adresse,
                        note: vehicle.note,
                        prixFormateLocataire: vehicle.prixFormateLocataire,
                      ),
                      const SizedBox(height: DSSpacing.xl),

                      // Titre section Caractéristiques
                      Row(
                        children: [
                          const EmeraldIconChip(
                            icon: Icons.drive_eta_rounded,
                            size: 28,
                            iconSize: 15,
                            glow: false,
                          ),
                          const SizedBox(width: DSSpacing.xs),
                          Text(
                            'Caractéristiques',
                            style: DSTypography.h5.copyWith(
                              color: Colors.white,
                              fontWeight: FontWeight.w900,
                            ),
                          ),
                          const SizedBox(width: DSSpacing.sm),
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
                      const SizedBox(height: DSSpacing.sm),

                      // Grille de spécifications
                      VehicleSpecsGrid(
                        carburant: vehicle.carburant?.name,
                        transmission: vehicle.transmission?.name,
                        nombrePlaces: vehicle.nombrePlaces,
                        joursMinimum: vehicle.joursMinimum,
                        ageMinimum: vehicle.ageMinimum,
                      ),
                      const SizedBox(height: DSSpacing.md),

                      // Spécifications détaillées (Catégorie, Localisation, etc.)
                      VehicleDetailSpecs(vehicle: vehicle),
                      const SizedBox(height: DSSpacing.lg),

                      // Liste des équipements
                      if (vehicle.equipements.isNotEmpty) ...[
                        VehicleEquipmentsList(equipements: vehicle.equipements),
                        const SizedBox(height: DSSpacing.lg),
                      ],

                      // Tarifs progressifs / dégressifs
                      if (vehicle.tarifs.isNotEmpty) ...[
                        VehiclePricingTable(
                          prixParJour: vehicle.prixParJour,
                          tarifs: vehicle.tarifs,
                        ),
                        const SizedBox(height: DSSpacing.lg),
                      ],

                      // Règles spécifiques du propriétaire
                      VehicleRulesCard(
                        reglesSpecifiques: vehicle.reglesSpecifiques,
                      ),
                      const SizedBox(height: DSSpacing.lg),

                      // Carte du propriétaire avec KYC
                      VehicleOwnerCard(vehicle: vehicle),
                      const SizedBox(height: DSSpacing.lg),

                      // Avis sur le propriétaire
                      VehicleReviews(
                        ownerNote: vehicle.note,
                        totalReviews: vehicle.totalAvis,
                        reviews: const [], // TODO: Charger les avis depuis l'API
                      ),
                      const SizedBox(height: DSSpacing.lg),

                      // Véhicules similaires
                      SimilarVehicles(
                        currentVehicle: vehicle,
                        similarVehicles: const [], // TODO: Charger depuis l'API
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),

        // Barre d'action fixe en bas
        VehicleDetailsBottomBar(
          formattedPrice: vehicle.prixFormateLocataire,
          onReservePressed: () => _handleReservationPressed(vehicle),
        ),
      ],
    );
  }
}
