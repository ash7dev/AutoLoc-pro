import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../design_system/components/premium_glass.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../../../design_system/tokens/ds_spacing.dart';
import '../../../../design_system/tokens/ds_typography.dart';
import '../../../../shared/enums/fuel_type.dart';
import '../../../../shared/enums/transmission.dart';
import '../../../../shared/enums/vehicle_type.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../providers/vehicle_providers.dart';
import '../states/vehicle_form_state.dart';
import '../widgets/equipment_chip_selector.dart';
import '../widgets/vehicle_document_uploader.dart';
import '../widgets/vehicle_photo_uploader.dart';

/// **VehicleCreateWizardScreen**
/// Assistant de publication d'annonce, entièrement repris sur le socle
/// premium_glass : fond noir uni (comme tout le reste de l'app, plus
/// de toggle light/dark local), glass sobre blur 10, kEmerald/kEmeraldDeep,
/// champs de saisie et zones d'upload dans le même langage que les gates
/// KYC (PremiumGlassCard + EmeraldIconChip + InlineErrorBanner).
class VehicleCreateWizardScreen extends ConsumerStatefulWidget {
  const VehicleCreateWizardScreen({super.key});

  @override
  ConsumerState<VehicleCreateWizardScreen> createState() => _VehicleCreateWizardScreenState();
}

class _VehicleCreateWizardScreenState extends ConsumerState<VehicleCreateWizardScreen> {
  int _currentStep = 1;
  final _scrollController = ScrollController();

  final _marqueController = TextEditingController();
  final _modeleController = TextEditingController();
  final _anneeController = TextEditingController();
  final _immatController = TextEditingController();
  final _placesController = TextEditingController();
  final _adresseController = TextEditingController();

  final _prixController = TextEditingController();
  final _joursMinController = TextEditingController();
  final _livraisonController = TextEditingController();
  final _suppHorsDakarController = TextEditingController();

  final _ageMinController = TextEditingController();
  final _rulesController = TextEditingController();

  static const List<String> _stepTitles = [
    'Véhicule',
    'Tarifs',
    'Conditions',
    'Photos',
    'Documents',
    'Vérification',
  ];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(vehicleFormViewModelProvider.notifier).load();
    });
  }

  @override
  void dispose() {
    _marqueController.dispose();
    _modeleController.dispose();
    _anneeController.dispose();
    _immatController.dispose();
    _placesController.dispose();
    _adresseController.dispose();
    _prixController.dispose();
    _joursMinController.dispose();
    _livraisonController.dispose();
    _suppHorsDakarController.dispose();
    _ageMinController.dispose();
    _rulesController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _scrollToTop() {
    _scrollController.animateTo(
      0.0,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  bool _validateStep(VehicleFormData data) {
    switch (_currentStep) {
      case 1:
        if (_marqueController.text.trim().isEmpty) return _showError('Marque est requise');
        if (_modeleController.text.trim().isEmpty) return _showError('Modèle est requis');
        final annee = int.tryParse(_anneeController.text) ?? 0;
        if (annee < 1990 || annee > DateTime.now().year + 1) return _showError('Année invalide');
        if (_immatController.text.trim().isEmpty) return _showError('Plaque d\'immatriculation requise');
        if (data.type == null) return _showError('Type de véhicule requis');
        if (data.ville.trim().isEmpty) return _showError('Zone / Ville requise');
        if (_adresseController.text.trim().isEmpty) return _showError('Adresse de récupération requise');
        return true;
      case 2:
        final prix = double.tryParse(_prixController.text) ?? 0.0;
        if (prix < 1000) return _showError('Prix journalier minimum requis (1 000 FCFA)');
        final joursMin = int.tryParse(_joursMinController.text) ?? 0;
        if (joursMin < 1) return _showError('Durée minimum de 1 jour requise');
        if (data.autoriseHorsDakar) {
          final supp = double.tryParse(_suppHorsDakarController.text) ?? 0.0;
          if (supp < 0) return _showError('Le supplément hors Dakar doit être positif');
        }
        return true;
      case 3:
        final age = int.tryParse(_ageMinController.text) ?? 0;
        if (age < 18) return _showError('L\'âge minimum requis doit être d\'au moins 18 ans');
        if (data.assurance == null || data.assurance!.isEmpty) return _showError('L\'assurance est obligatoire');
        return true;
      case 4:
        if (data.photos.isEmpty) return _showError('Veuillez ajouter au moins une photo du véhicule');
        return true;
      case 5:
        if (data.carteGriseUrl == null || data.carteGriseUrl!.isEmpty) return _showError('Carte Grise est obligatoire');
        if (data.assuranceDocUrl == null || data.assuranceDocUrl!.isEmpty) return _showError('Attestation d\'Assurance est obligatoire');
        return true;
      default:
        return true;
    }
  }

  bool _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message, style: const TextStyle(fontWeight: FontWeight.w600)),
        backgroundColor: DSColors.red500,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(PremiumRadius.chip)),
        margin: const EdgeInsets.all(DSSpacing.md),
      ),
    );
    return false;
  }

  void _syncInputsToState(WidgetRef ref) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);
    if (_currentStep == 1) {
      notifier.updateMarque(_marqueController.text.trim());
      notifier.updateModele(_modeleController.text.trim());
      notifier.updateAnnee(int.tryParse(_anneeController.text) ?? 2020);
      notifier.updateImmatriculation(_immatController.text.trim().toUpperCase());
      notifier.updateNombrePlaces(int.tryParse(_placesController.text) ?? 5);
      notifier.updateAdresse(_adresseController.text.trim());
    } else if (_currentStep == 2) {
      notifier.updatePrixParJour(double.tryParse(_prixController.text) ?? 0.0);
      notifier.updateJoursMinimum(int.tryParse(_joursMinController.text) ?? 1);
      final livraison = double.tryParse(_livraisonController.text);
      notifier.updateFraisLivraison(livraison != null && livraison > 0 ? livraison : null);
      if (ref.read(vehicleFormStateProvider).dataOrNull?.autoriseHorsDakar == true) {
        notifier.updateSupplementHorsDakarParJour(double.tryParse(_suppHorsDakarController.text) ?? 0.0);
      }
    } else if (_currentStep == 3) {
      notifier.updateAgeMinimum(int.tryParse(_ageMinController.text) ?? 18);
      notifier.updateReglesSpecifiques(_rulesController.text.trim().isNotEmpty ? _rulesController.text.trim() : null);
    }
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(vehicleFormStateProvider);

    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: Colors.black,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded, color: Colors.white, size: 18),
          onPressed: () {
            if (_currentStep > 1) {
              setState(() => _currentStep--);
              _scrollToTop();
            } else {
              context.pop();
            }
          },
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Créer une annonce',
              style: DSTypography.bodyLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              'Étape $_currentStep sur 6 · ${_stepTitles[_currentStep - 1]}',
              style: DSTypography.labelSmall.copyWith(
                color: kEmerald,
                fontWeight: FontWeight.w700,
              ),
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded, color: Colors.white70),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AlertDialog(
                  backgroundColor: const Color(0xFF141414),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(PremiumRadius.card)),
                  title: const Text('Abandonner ?', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
                  content: Text(
                    'Voulez-vous vraiment quitter ? Toutes les modifications seront perdues.',
                    style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary),
                  ),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context),
                      child: Text('Annuler', style: TextStyle(color: DSColors.darkTextSecondary)),
                    ),
                    TextButton(
                      onPressed: () {
                        Navigator.pop(context);
                        context.pop();
                      },
                      child: const Text('Quitter', style: TextStyle(color: DSColors.red500, fontWeight: FontWeight.w800)),
                    ),
                  ],
                ),
              );
            },
          ),
        ],
      ),
      body: formState.maybeWhen(
        loading: () => const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: kEmerald),
              SizedBox(height: DSSpacing.md),
              Text(
                'Publication de votre annonce en cours...',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.w700),
              ),
            ],
          ),
        ),
        failure: (message, code) => Center(
          child: Text(message, style: const TextStyle(color: Colors.white)),
        ),
        success: (formData) {
          if (_marqueController.text.isEmpty && formData.marque.isNotEmpty) {
            _marqueController.text = formData.marque;
            _modeleController.text = formData.modele;
            _anneeController.text = formData.annee.toString();
            _immatController.text = formData.immatriculation;
            _placesController.text = formData.nombrePlaces.toString();
            _adresseController.text = formData.adresse;
            _prixController.text = formData.prixParJour > 0 ? formData.prixParJour.toStringAsFixed(0) : '';
            _joursMinController.text = formData.joursMinimum.toString();
            _livraisonController.text = formData.fraisLivraison != null ? formData.fraisLivraison!.toStringAsFixed(0) : '';
            _suppHorsDakarController.text = formData.supplementHorsDakarParJour != null ? formData.supplementHorsDakarParJour!.toStringAsFixed(0) : '';
            _ageMinController.text = formData.ageMinimum.toString();
            _rulesController.text = formData.reglesSpecifiques ?? '';
          }

          return Column(
            children: [
              // Barre de progression premium — segments plutôt que linéaire
              _StepProgressBar(currentStep: _currentStep, totalSteps: 6),

              Expanded(
                child: SingleChildScrollView(
                  controller: _scrollController,
                  padding: const EdgeInsets.fromLTRB(DSSpacing.md, DSSpacing.md, DSSpacing.md, DSSpacing.xl),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      if (_currentStep == 1) _buildStep1(formData),
                      if (_currentStep == 2) _buildStep2(formData),
                      if (_currentStep == 3) _buildStep3(formData),
                      if (_currentStep == 4) _buildStep4(formData),
                      if (_currentStep == 5) _buildStep5(formData),
                      if (_currentStep == 6) _buildStep6(formData),
                    ],
                  ),
                ),
              ),

              // Bottom actions
              Container(
                padding: const EdgeInsets.fromLTRB(DSSpacing.md, DSSpacing.sm, DSSpacing.md, 0),
                decoration: BoxDecoration(
                  color: Colors.black,
                  border: Border(top: BorderSide(color: Colors.white.withOpacity(0.08))),
                ),
                child: SafeArea(
                  top: false,
                  child: Row(
                    children: [
                      if (_currentStep > 1) ...[
                        Expanded(
                          child: _SecondaryWizardButton(
                            label: 'Précédent',
                            onTap: () {
                              setState(() => _currentStep--);
                              _scrollToTop();
                            },
                          ),
                        ),
                        const SizedBox(width: DSSpacing.sm),
                      ],
                      Expanded(
                        flex: _currentStep > 1 ? 1 : 2,
                        child: _PrimaryWizardButton(
                          label: _currentStep == 6 ? 'Publier l\'annonce' : 'Suivant',
                          icon: _currentStep == 6 ? Icons.check_rounded : Icons.arrow_forward_rounded,
                          onTap: () async {
                            _syncInputsToState(ref);
                            if (_validateStep(formData)) {
                              if (_currentStep < 6) {
                                setState(() => _currentStep++);
                                _scrollToTop();
                              } else {
                                final notifier = ref.read(vehicleFormViewModelProvider.notifier);
                                await notifier.submit();
                              }
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        orElse: () => const Center(child: CircularProgressIndicator(color: kEmerald)),
      ),
    );
  }

  // =========================================================================
  // STEPS
  // =========================================================================

  Widget _buildStep1(VehicleFormData data) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);
    final selectedType = data.type;
    const cities = ['Almadies', 'Ngor', 'Ouakam', 'Plateau', 'Mermoz', 'Parcelles Assainies', 'Pikine', 'Guediawaye', 'Rufisque'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SectionHeader(title: 'Identité du véhicule', subtitle: 'Marque, modèle, année et immatriculation'),
        const SizedBox(height: DSSpacing.md),
        _PremiumTextField(controller: _marqueController, label: 'Marque *', hint: 'Toyota, BMW, Peugeot...'),
        const SizedBox(height: DSSpacing.sm + 4),
        _PremiumTextField(controller: _modeleController, label: 'Modèle *', hint: 'Corolla, X5, 3008...'),
        const SizedBox(height: DSSpacing.sm + 4),
        Row(
          children: [
            Expanded(
              child: _PremiumTextField(
                controller: _anneeController,
                label: 'Année *',
                hint: '2023',
                keyboardType: TextInputType.number,
              ),
            ),
            const SizedBox(width: DSSpacing.sm + 4),
            Expanded(
              child: _PremiumTextField(
                controller: _placesController,
                label: 'Places',
                hint: '5',
                keyboardType: TextInputType.number,
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.sm + 4),
        _PremiumTextField(
          controller: _immatController,
          label: 'Immatriculation *',
          hint: 'DK 1234 AB',
          capitalization: TextCapitalization.characters,
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Type de véhicule', subtitle: 'Choisissez la catégorie *'),
        const SizedBox(height: DSSpacing.sm),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: VehicleType.values.map((t) {
            final isSelected = selectedType == t;
            return _PremiumChoiceChip(
              label: t.name,
              selected: isSelected,
              onTap: () => notifier.updateType(t),
            );
          }).toList(),
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Motorisation', subtitle: 'Carburant et transmission'),
        const SizedBox(height: DSSpacing.sm),
        Row(
          children: [
            Expanded(
              child: _PremiumDropdown<FuelType>(
                label: 'Carburant',
                value: data.carburant,
                items: FuelType.values,
                onChanged: notifier.updateCarburant,
              ),
            ),
            const SizedBox(width: DSSpacing.sm + 4),
            Expanded(
              child: _PremiumDropdown<Transmission>(
                label: 'Transmission',
                value: data.transmission,
                items: Transmission.values,
                onChanged: notifier.updateTransmission,
              ),
            ),
          ],
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Localisation', subtitle: 'Où se situe le véhicule *'),
        const SizedBox(height: DSSpacing.sm),
        _PremiumDropdown<String>(
          label: 'Zone / Ville *',
          value: data.ville.isEmpty ? null : data.ville,
          items: cities,
          onChanged: (val) => notifier.updateVille(val ?? ''),
        ),
        const SizedBox(height: DSSpacing.sm + 4),
        _PremiumTextField(controller: _adresseController, label: 'Adresse de récupération *', hint: 'Rue, quartier...'),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Équipements', subtitle: 'Sélectionnez les options disponibles'),
        const SizedBox(height: DSSpacing.sm),
        EquipmentChipSelector(
          selected: data.equipements,
          onToggle: notifier.toggleEquipement,
        ),
      ],
    );
  }

  Widget _buildStep2(VehicleFormData data) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SectionHeader(title: 'Prix de base', subtitle: 'Tarif journalier par défaut *'),
        const SizedBox(height: DSSpacing.md),
        _PremiumTextField(
          controller: _prixController,
          label: 'Prix par jour *',
          hint: '25 000',
          keyboardType: TextInputType.number,
          suffixText: 'FCFA',
        ),
        const SizedBox(height: DSSpacing.sm + 4),
        _PremiumTextField(
          controller: _joursMinController,
          label: 'Durée minimum (jours) *',
          hint: '1',
          keyboardType: TextInputType.number,
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Tarifs dégressifs', subtitle: 'Réductions longue durée (optionnel)'),
        const SizedBox(height: DSSpacing.sm),
        if (data.tarifs.isEmpty)
          PremiumGlassCard(
            radius: PremiumRadius.chip,
            blur: 10,
            padding: const EdgeInsets.all(DSSpacing.md),
            child: Row(
              children: [
                EmeraldIconChip(icon: Icons.trending_down_rounded, size: 34, iconSize: 17, glow: false),
                const SizedBox(width: DSSpacing.sm),
                Expanded(
                  child: Text(
                    'Aucun palier ajouté pour le moment',
                    style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
                  ),
                ),
              ],
            ),
          )
        else
          ListView.separated(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: data.tarifs.length,
            separatorBuilder: (_, __) => const SizedBox(height: DSSpacing.sm),
            itemBuilder: (context, idx) {
              final t = data.tarifs[idx];
              return PremiumGlassCard(
                radius: PremiumRadius.chip,
                blur: 10,
                padding: const EdgeInsets.all(DSSpacing.md),
                child: Row(
                  children: [
                    EmeraldIconChip(icon: Icons.access_time_filled_rounded, size: 34, iconSize: 17, glow: false),
                    const SizedBox(width: DSSpacing.sm),
                    Expanded(
                      child: Text(
                        'De ${t['joursMin']} à ${t['joursMax'] ?? '∞'} jours',
                        style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
                      ),
                    ),
                    Text(
                      '${t['prix']} FCFA/j',
                      style: DSTypography.bodyMedium.copyWith(color: kEmerald, fontWeight: FontWeight.w900),
                    ),
                    const SizedBox(width: 4),
                    IconButton(
                      icon: const Icon(Icons.delete_outline_rounded, color: DSColors.red500, size: 20),
                      onPressed: () => notifier.removeTarif(idx),
                    ),
                  ],
                ),
              );
            },
          ),
        const SizedBox(height: DSSpacing.sm),
        InkWell(
          onTap: () => _showAddTarifDialog(notifier),
          borderRadius: BorderRadius.circular(PremiumRadius.chip),
          child: PremiumGlassCard(
            radius: PremiumRadius.chip,
            blur: 10,
            padding: const EdgeInsets.symmetric(vertical: 14),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.add_rounded, color: kEmerald, size: 20),
                const SizedBox(width: 8),
                Text(
                  'Ajouter un palier dégressif',
                  style: DSTypography.bodyMedium.copyWith(color: kEmerald, fontWeight: FontWeight.w800),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Livraison', subtitle: 'Optionnel'),
        const SizedBox(height: DSSpacing.sm),
        _PremiumTextField(
          controller: _livraisonController,
          label: 'Frais de livraison',
          hint: 'Laisser vide si pas proposé',
          keyboardType: TextInputType.number,
          suffixText: 'FCFA',
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Voyages Hors Dakar', subtitle: 'Optionnel'),
        const SizedBox(height: DSSpacing.sm),
        PremiumGlassCard(
          radius: PremiumRadius.chip,
          blur: 10,
          accent: data.autoriseHorsDakar,
          padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: 6),
          child: SwitchListTile(
            contentPadding: EdgeInsets.zero,
            title: Text(
              'Autoriser Hors Dakar ?',
              style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w700),
            ),
            subtitle: Text(
              'Permet de voyager hors de Dakar avec un supplément journalier',
              style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary),
            ),
            value: data.autoriseHorsDakar,
            onChanged: notifier.updateAutoriseHorsDakar,
            activeColor: kEmerald,
            activeTrackColor: kEmerald.withOpacity(0.3),
            inactiveTrackColor: Colors.white.withOpacity(0.08),
          ),
        ),
        if (data.autoriseHorsDakar) ...[
          const SizedBox(height: DSSpacing.sm + 4),
          _PremiumTextField(
            controller: _suppHorsDakarController,
            label: 'Supplément Hors Dakar / Jour *',
            hint: '5 000',
            keyboardType: TextInputType.number,
            suffixText: 'FCFA',
          ),
        ],
      ],
    );
  }

  void _showAddTarifDialog(dynamic notifier) {
    final jMinCtrl = TextEditingController();
    final jMaxCtrl = TextEditingController();
    final pCtrl = TextEditingController();

    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF141414),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(PremiumRadius.card)),
        title: const Text('Nouveau palier tarifaire', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w800)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _PremiumTextField(controller: jMinCtrl, label: 'Jours Min *', hint: '3', keyboardType: TextInputType.number),
            const SizedBox(height: DSSpacing.sm),
            _PremiumTextField(controller: jMaxCtrl, label: 'Jours Max (vide = infini)', hint: '7', keyboardType: TextInputType.number),
            const SizedBox(height: DSSpacing.sm),
            _PremiumTextField(controller: pCtrl, label: 'Prix / Jour *', hint: '20 000', keyboardType: TextInputType.number, suffixText: 'FCFA'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: Text('Annuler', style: TextStyle(color: DSColors.darkTextSecondary)),
          ),
          TextButton(
            onPressed: () {
              final min = int.tryParse(jMinCtrl.text) ?? 0;
              final max = int.tryParse(jMaxCtrl.text);
              final p = double.tryParse(pCtrl.text) ?? 0.0;
              if (min > 0 && p > 0) {
                notifier.addTarif({'joursMin': min, 'joursMax': max, 'prix': p});
              }
              Navigator.pop(context);
            },
            child: const Text('Ajouter', style: TextStyle(color: kEmerald, fontWeight: FontWeight.w800)),
          ),
        ],
      ),
    );
  }

  Widget _buildStep3(VehicleFormData data) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);
    const assurances = ['Locataire responsable', 'Incluse (tous risques)'];
    const carburantConditions = ['Plein à plein', 'Niveau identique'];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SectionHeader(title: 'Exigences locataire', subtitle: 'Âge minimum requis *'),
        const SizedBox(height: DSSpacing.md),
        _PremiumTextField(controller: _ageMinController, label: 'Âge minimum *', hint: '21', keyboardType: TextInputType.number),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Assurance & Dommages', subtitle: 'Comment le véhicule est protégé *'),
        const SizedBox(height: DSSpacing.sm),
        ...assurances.map((opt) {
          final isSelected = data.assurance == opt;
          return Padding(
            padding: const EdgeInsets.only(bottom: DSSpacing.sm),
            child: InkWell(
              onTap: () => notifier.updateAssurance(opt),
              borderRadius: BorderRadius.circular(PremiumRadius.card),
              child: PremiumGlassCard(
                radius: PremiumRadius.card,
                blur: 10,
                accent: isSelected,
                padding: const EdgeInsets.all(DSSpacing.md),
                child: Row(
                  children: [
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: isSelected ? kEmerald : Colors.white24, width: 2),
                        color: isSelected ? kEmerald : Colors.transparent,
                      ),
                      child: isSelected ? const Icon(Icons.check_rounded, color: Colors.black, size: 14) : null,
                    ),
                    const SizedBox(width: DSSpacing.md),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(opt, style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800)),
                          const SizedBox(height: 2),
                          Text(
                            opt == 'Locataire responsable'
                                ? 'Le locataire prend en charge les frais en cas de sinistre.'
                                : 'Le véhicule dispose d\'une assurance tous risques.',
                            style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
          );
        }),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Politique Carburant', subtitle: 'Consigne de restitution'),
        const SizedBox(height: DSSpacing.sm),
        Row(
          children: carburantConditions.map((opt) {
            final isSelected = data.carburantCondition == opt;
            return Expanded(
              child: Padding(
                padding: const EdgeInsets.symmetric(horizontal: 4),
                child: InkWell(
                  onTap: () => notifier.updateCarburantCondition(opt),
                  borderRadius: BorderRadius.circular(PremiumRadius.card),
                  child: PremiumGlassCard(
                    radius: PremiumRadius.card,
                    blur: 10,
                    accent: isSelected,
                    padding: const EdgeInsets.all(DSSpacing.md),
                    child: Column(
                      children: [
                        EmeraldIconChip(icon: Icons.local_gas_station_rounded, size: 36, iconSize: 18, glow: false),
                        const SizedBox(height: DSSpacing.xs),
                        Text(
                          opt,
                          textAlign: TextAlign.center,
                          style: DSTypography.bodySmall.copyWith(
                            color: isSelected ? kEmerald : Colors.white,
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
        const SizedBox(height: DSSpacing.lg),

        _SectionHeader(title: 'Règles & Remarques', subtitle: 'Consignes à bord du véhicule'),
        const SizedBox(height: DSSpacing.sm),
        _PremiumTextField(
          controller: _rulesController,
          label: 'Règles spécifiques',
          hint: 'Ex : Non-fumeur, pas d\'animaux, restitution propre...',
          maxLines: 3,
        ),
      ],
    );
  }

  Widget _buildStep4(VehicleFormData data) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SectionHeader(
          title: 'Photos du véhicule',
          subtitle: 'Ajoutez jusqu\'à 8 photos. La première sera la photo principale.',
        ),
        const SizedBox(height: DSSpacing.md),
        VehiclePhotoUploader(
          photos: data.photos,
          isUploading: data.isUploading,
          uploadProgress: data.uploadProgress,
          onUploadPhoto: notifier.uploadAndAddPhoto,
          onDeletePhoto: notifier.removePhoto,
          onSetMainPhoto: (id) => notifier.changePhotoProperties(id, estPrincipale: true),
        ),
      ],
    );
  }

  Widget _buildStep5(VehicleFormData data) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SectionHeader(
          title: 'Documents obligatoires',
          subtitle: 'Vos documents resteront confidentiels et serviront à valider votre compte propriétaire.',
        ),
        const SizedBox(height: DSSpacing.lg),
        VehicleDocumentUploader(
          label: 'Carte Grise *',
          description: 'Document officiel d\'immatriculation du véhicule',
          docUrl: data.carteGriseUrl,
          isUploading: data.isUploading && data.carteGriseUrl == null,
          uploadProgress: data.uploadProgress,
          onUpload: (path) => notifier.uploadDocument(path, true),
          onRemove: () => notifier.updateCarteGrise(null, null),
        ),
        const SizedBox(height: DSSpacing.md),
        VehicleDocumentUploader(
          label: 'Attestation d\'Assurance *',
          description: 'Document d\'assurance en cours de validité',
          docUrl: data.assuranceDocUrl,
          isUploading: data.isUploading && data.assuranceDocUrl == null,
          uploadProgress: data.uploadProgress,
          onUpload: (path) => notifier.uploadDocument(path, false),
          onRemove: () => notifier.updateAssuranceDocs(null, null),
        ),
      ],
    );
  }

  Widget _buildStep6(VehicleFormData data) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        _SectionHeader(
          title: 'Vérification de votre annonce',
          subtitle: 'Veuillez vérifier les informations ci-dessous avant d\'envoyer',
        ),
        const SizedBox(height: DSSpacing.md),
        PremiumGlassCard(
          radius: PremiumRadius.card,
          blur: 10,
          padding: const EdgeInsets.all(DSSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _ReviewRow(label: 'Marque / Modèle', value: '${data.marque} ${data.modele} (${data.annee})'),
              _ReviewRow(label: 'Immatriculation', value: data.immatriculation),
              _ReviewRow(label: 'Type', value: data.type?.name ?? '—'),
              _ReviewRow(label: 'Carburant / Transmission', value: '${data.carburant?.name ?? '—'} / ${data.transmission?.name ?? '—'}'),
              _ReviewRow(label: 'Ville / Adresse', value: '${data.ville}, ${data.adresse}'),
              _ReviewRow(label: 'Équipements', value: '${data.equipements.length} sélectionné(s)'),
              _ReviewDivider(),
              _ReviewRow(label: 'Prix par jour', value: '${data.prixParJour.toStringAsFixed(0)} FCFA', accent: true),
              _ReviewRow(label: 'Jours minimum', value: '${data.joursMinimum} jours'),
              _ReviewRow(
                label: 'Frais de livraison',
                value: data.fraisLivraison != null ? '${data.fraisLivraison!.toStringAsFixed(0)} FCFA' : 'Non proposée',
              ),
              _ReviewRow(
                label: 'Voyage Hors Dakar',
                value: data.autoriseHorsDakar
                    ? 'Autorisé (+ ${data.supplementHorsDakarParJour?.toStringAsFixed(0)} FCFA/j)'
                    : 'Non autorisé',
              ),
              _ReviewDivider(),
              _ReviewRow(label: 'Assurance', value: data.assurance ?? '—'),
              _ReviewRow(label: 'Politique carburant', value: data.carburantCondition ?? '—'),
              _ReviewDivider(),
              _ReviewRow(label: 'Photos', value: '${data.photos.length} photo(s) ajoutée(s)'),
              _ReviewRow(label: 'Documents', value: 'Carte Grise & Assurance téléversées', isLast: true),
            ],
          ),
        ),
        const SizedBox(height: DSSpacing.md),
        PremiumGlassCard(
          radius: PremiumRadius.chip,
          blur: 10,
          padding: const EdgeInsets.all(DSSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.info_outline_rounded, color: Colors.amber, size: 20),
              const SizedBox(width: DSSpacing.sm),
              Expanded(
                child: Text(
                  'Une fois publiée, votre annonce sera examinée par notre équipe. Ce processus prend généralement moins de 24 heures.',
                  style: DSTypography.bodySmall.copyWith(color: Colors.amber.shade200, fontWeight: FontWeight.w600, height: 1.4),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// STEP PROGRESS BAR — segments plutôt qu'une barre linéaire continue
// =============================================================================

class _StepProgressBar extends StatelessWidget {
  const _StepProgressBar({required this.currentStep, required this.totalSteps});
  final int currentStep;
  final int totalSteps;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: DSSpacing.sm),
      child: Row(
        children: List.generate(totalSteps, (i) {
          final stepIndex = i + 1;
          final bool done = stepIndex < currentStep;
          final bool active = stepIndex == currentStep;
          return Expanded(
            child: Padding(
              padding: EdgeInsets.only(right: i == totalSteps - 1 ? 0 : 4),
              child: Container(
                height: 4,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(2),
                  gradient: (done || active)
                      ? const LinearGradient(colors: [kEmeraldDeep, kEmerald])
                      : null,
                  color: (done || active) ? null : Colors.white.withOpacity(0.08),
                ),
              ),
            ),
          );
        }),
      ),
    );
  }
}

// =============================================================================
// SECTION HEADER — eyebrow + séparateur dégradé (cohérent avec VehicleDetailSpecs)
// =============================================================================

class _SectionHeader extends StatelessWidget {
  const _SectionHeader({required this.title, required this.subtitle});
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              title,
              style: DSTypography.bodyLarge.copyWith(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                letterSpacing: -0.2,
              ),
            ),
            const SizedBox(width: DSSpacing.sm),
            Expanded(
              child: Container(
                height: 1.5,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [kEmerald.withOpacity(0.4), Colors.transparent],
                  ),
                ),
              ),
            ),
          ],
        ),
        const SizedBox(height: 3),
        Text(
          subtitle,
          style: DSTypography.labelSmall.copyWith(color: DSColors.darkTextTertiary, height: 1.3),
        ),
      ],
    );
  }
}

// =============================================================================
// PREMIUM TEXT FIELD — glass sobre, focus émeraude
// =============================================================================

class _PremiumTextField extends StatelessWidget {
  const _PremiumTextField({
    required this.controller,
    required this.label,
    required this.hint,
    this.keyboardType = TextInputType.text,
    this.capitalization = TextCapitalization.none,
    this.suffixText,
    this.maxLines = 1,
  });

  final TextEditingController controller;
  final String label;
  final String hint;
  final TextInputType keyboardType;
  final TextCapitalization capitalization;
  final String? suffixText;
  final int maxLines;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: DSTypography.labelSmall.copyWith(
            color: DSColors.darkTextTertiary,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        PremiumGlassCard(
          radius: PremiumRadius.chip,
          blur: 10,
          padding: EdgeInsets.zero,
          child: TextField(
            controller: controller,
            keyboardType: keyboardType,
            textCapitalization: capitalization,
            maxLines: maxLines,
            style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
            cursorColor: kEmerald,
            decoration: InputDecoration(
              hintText: hint,
              hintStyle: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextTertiary, fontWeight: FontWeight.w500),
              suffixText: suffixText,
              suffixStyle: DSTypography.bodyMedium.copyWith(color: kEmerald, fontWeight: FontWeight.w800),
              contentPadding: const EdgeInsets.symmetric(horizontal: DSSpacing.md, vertical: 14),
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
            ),
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// PREMIUM DROPDOWN
// =============================================================================

class _PremiumDropdown<T> extends StatelessWidget {
  const _PremiumDropdown({
    required this.label,
    required this.value,
    required this.items,
    required this.onChanged,
  });

  final String label;
  final T? value;
  final List<T> items;
  final ValueChanged<T?> onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: DSTypography.labelSmall.copyWith(
            color: DSColors.darkTextTertiary,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.6,
          ),
        ),
        const SizedBox(height: 6),
        PremiumGlassCard(
          radius: PremiumRadius.chip,
          blur: 10,
          padding: const EdgeInsets.symmetric(horizontal: 4),
          child: DropdownButtonHideUnderline(
            child: DropdownButtonFormField<T>(
              value: value,
              onChanged: onChanged,
              dropdownColor: const Color(0xFF1A1A1A),
              icon: const Icon(Icons.keyboard_arrow_down_rounded, color: kEmerald),
              style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600),
              decoration: const InputDecoration(
                contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 14),
                border: InputBorder.none,
              ),
              items: items.map((item) {
                final text = item is Enum ? item.name : item.toString();
                return DropdownMenuItem<T>(value: item, child: Text(text));
              }).toList(),
            ),
          ),
        ),
      ],
    );
  }
}

// =============================================================================
// PREMIUM CHOICE CHIP
// =============================================================================

class _PremiumChoiceChip extends StatelessWidget {
  const _PremiumChoiceChip({required this.label, required this.selected, required this.onTap});
  final String label;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(100),
      child: PremiumGlassCard(
        radius: 100,
        blur: 10,
        accent: selected,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 9),
        child: Text(
          label,
          style: DSTypography.bodySmall.copyWith(
            color: selected ? kEmerald : Colors.white.withOpacity(0.8),
            fontWeight: selected ? FontWeight.w800 : FontWeight.w600,
          ),
        ),
      ),
    );
  }
}

// =============================================================================
// REVIEW ROW / DIVIDER — step 6
// =============================================================================

class _ReviewRow extends StatelessWidget {
  const _ReviewRow({required this.label, required this.value, this.accent = false, this.isLast = false});
  final String label;
  final String value;
  final bool accent;
  final bool isLast;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: isLast ? 0 : 10),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Expanded(
            child: Text(
              label,
              style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
            ),
          ),
          const SizedBox(width: DSSpacing.sm),
          Flexible(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: DSTypography.bodySmall.copyWith(
                color: accent ? kEmerald : Colors.white,
                fontWeight: FontWeight.w800,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ReviewDivider extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 8),
      child: Divider(height: 1, color: Colors.white.withOpacity(0.08)),
    );
  }
}

// =============================================================================
// WIZARD BUTTONS
// =============================================================================

class _PrimaryWizardButton extends StatelessWidget {
  const _PrimaryWizardButton({required this.label, required this.icon, required this.onTap});
  final String label;
  final IconData icon;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(PremiumRadius.chip),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 15),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [kEmerald, kEmeraldDeep]),
          borderRadius: BorderRadius.circular(PremiumRadius.chip),
          boxShadow: [
            BoxShadow(color: kEmerald.withOpacity(0.35), blurRadius: 16, offset: const Offset(0, 6)),
          ],
        ),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text(
              label,
              style: const TextStyle(color: Colors.black, fontSize: 15, fontWeight: FontWeight.w800),
            ),
            const SizedBox(width: 6),
            Icon(icon, color: Colors.black, size: 18),
          ],
        ),
      ),
    );
  }
}

class _SecondaryWizardButton extends StatelessWidget {
  const _SecondaryWizardButton({required this.label, required this.onTap});
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(PremiumRadius.chip),
      child: PremiumGlassCard(
        radius: PremiumRadius.chip,
        blur: 10,
        padding: const EdgeInsets.symmetric(vertical: 15),
        child: Center(
          child: Text(
            label,
            style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
          ),
        ),
      ),
    );
  }
}