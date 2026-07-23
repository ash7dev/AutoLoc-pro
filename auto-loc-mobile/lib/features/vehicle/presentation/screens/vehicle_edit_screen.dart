import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../shared/enums/fuel_type.dart';
import '../../../../shared/enums/transmission.dart';
import '../../../../shared/enums/vehicle_type.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';
import '../../di/vehicle_injection.dart';
import '../providers/vehicle_providers.dart';
import '../states/vehicle_form_state.dart';
import '../widgets/equipment_chip_selector.dart';
import '../widgets/vehicle_document_uploader.dart';
import '../widgets/vehicle_photo_uploader.dart';

class VehicleEditScreen extends ConsumerStatefulWidget {
  final String vehicleId;
  final Vehicle? vehicle;

  const VehicleEditScreen({
    super.key,
    required this.vehicleId,
    this.vehicle,
  });

  @override
  ConsumerState<VehicleEditScreen> createState() => _VehicleEditScreenState();
}

class _VehicleEditScreenState extends ConsumerState<VehicleEditScreen> {
  bool _isLoadingVehicle = false;
  String? _loadingError;

  // Controllers
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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (widget.vehicle != null) {
        ref.read(vehicleFormViewModelProvider.notifier).setVehicle(widget.vehicle!);
      } else {
        _fetchAndSetVehicle();
      }
    });
  }

  Future<void> _fetchAndSetVehicle() async {
    setState(() {
      _isLoadingVehicle = true;
      _loadingError = null;
    });

    final getDetails = ref.read(getVehicleDetailsUseCaseProvider);
    final result = await getDetails(widget.vehicleId);

    result.fold(
      (failure) {
        setState(() {
          _isLoadingVehicle = false;
          _loadingError = failure.message;
        });
      },
      (vehicle) {
        ref.read(vehicleFormViewModelProvider.notifier).setVehicle(vehicle);
        setState(() {
          _isLoadingVehicle = false;
        });
      },
    );
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
    super.dispose();
  }

  void _syncInputsToState(WidgetRef ref) {
    final notifier = ref.read(vehicleFormViewModelProvider.notifier);
    notifier.updateMarque(_marqueController.text.trim());
    notifier.updateModele(_modeleController.text.trim());
    notifier.updateAnnee(int.tryParse(_anneeController.text) ?? 2020);
    notifier.updateImmatriculation(_immatController.text.trim().toUpperCase());
    notifier.updateNombrePlaces(int.tryParse(_placesController.text) ?? 5);
    notifier.updateAdresse(_adresseController.text.trim());
    notifier.updatePrixParJour(double.tryParse(_prixController.text) ?? 0.0);
    notifier.updateJoursMinimum(int.tryParse(_joursMinController.text) ?? 1);
    final livraison = double.tryParse(_livraisonController.text);
    notifier.updateFraisLivraison(livraison != null && livraison > 0 ? livraison : null);
    if (ref.read(vehicleFormStateProvider).dataOrNull?.autoriseHorsDakar == true) {
      notifier.updateSupplementHorsDakarParJour(double.tryParse(_suppHorsDakarController.text) ?? 0.0);
    }
    notifier.updateAgeMinimum(int.tryParse(_ageMinController.text) ?? 18);
    notifier.updateReglesSpecifiques(_rulesController.text.trim().isNotEmpty ? _rulesController.text.trim() : null);
  }

  bool _validateFields(VehicleFormData data) {
    if (_marqueController.text.trim().isEmpty) return _showError('Marque est requise');
    if (_modeleController.text.trim().isEmpty) return _showError('Modèle est requis');
    final annee = int.tryParse(_anneeController.text) ?? 0;
    if (annee < 1990 || annee > DateTime.now().year + 1) return _showError('Année invalide');
    if (_immatController.text.trim().isEmpty) return _showError('Plaque d\'immatriculation requise');
    if (data.type == null) return _showError('Type de véhicule requis');
    if (data.ville.trim().isEmpty) return _showError('Zone / Ville requise');
    if (_adresseController.text.trim().isEmpty) return _showError('Adresse de récupération requise');

    final prix = double.tryParse(_prixController.text) ?? 0.0;
    if (prix < 1000) return _showError('Prix journalier minimum requis (1 000 FCFA)');
    final joursMin = int.tryParse(_joursMinController.text) ?? 0;
    if (joursMin < 1) return _showError('Durée minimum de 1 jour requise');

    final age = int.tryParse(_ageMinController.text) ?? 0;
    if (age < 18) return _showError('L\'âge minimum requis doit être d\'au moins 18 ans');
    if (data.assurance == null || data.assurance!.isEmpty) return _showError('L\'assurance est obligatoire');

    return true;
  }

  bool _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.redAccent,
      ),
    );
    return false;
  }

  @override
  Widget build(BuildContext context) {
    final formState = ref.watch(vehicleFormStateProvider);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_isLoadingVehicle) {
      return Scaffold(
        backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        appBar: AppBar(title: const Text('Modifier le véhicule')),
        body: const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)))),
      );
    }

    if (_loadingError != null) {
      return Scaffold(
        backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
        appBar: AppBar(title: const Text('Modifier le véhicule')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text('Erreur: $_loadingError'),
              const SizedBox(height: 12),
              ElevatedButton(onPressed: _fetchAndSetVehicle, child: const Text('Réessayer')),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF1E293B) : Colors.white,
        elevation: 0,
        title: const Text('Modifier le véhicule', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
      ),
      body: formState.maybeWhen(
        loading: () => const Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981))),
              SizedBox(height: 16),
              Text('Enregistrement des modifications...', style: TextStyle(fontWeight: FontWeight.bold)),
            ],
          ),
        ),
        failure: (message, code) => Center(child: Text(message)),
        success: (formData) {
          // Sync textfields only once
          if (_marqueController.text.isEmpty && formData.marque.isNotEmpty) {
            _marqueController.text = formData.marque;
            _modeleController.text = formData.modele;
            _anneeController.text = formData.annee.toString();
            _immatController.text = formData.immatriculation;
            _placesController.text = formData.nombrePlaces.toString();
            _adresseController.text = formData.adresse;
            _prixController.text = formData.prixParJour.toStringAsFixed(0);
            _joursMinController.text = formData.joursMinimum.toString();
            _livraisonController.text = formData.fraisLivraison != null ? formData.fraisLivraison!.toStringAsFixed(0) : '';
            _suppHorsDakarController.text = formData.supplementHorsDakarParJour != null ? formData.supplementHorsDakarParJour!.toStringAsFixed(0) : '';
            _ageMinController.text = formData.ageMinimum.toString();
            _rulesController.text = formData.reglesSpecifiques ?? '';
          }

          return Column(
            children: [
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.all(20.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Section 1: Infos & Specs
                      _buildSectionCard(
                        title: 'Identité & Caractéristiques',
                        child: Column(
                          children: [
                            _buildTextField(_marqueController, 'Marque *', 'Toyota...'),
                            const SizedBox(height: 12),
                            _buildTextField(_modeleController, 'Modèle *', 'Corolla...'),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(child: _buildTextField(_anneeController, 'Année *', '2022', keyboardType: TextInputType.number)),
                                const SizedBox(width: 12),
                                Expanded(child: _buildTextField(_placesController, 'Places', '5', keyboardType: TextInputType.number)),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildTextField(_immatController, 'Immatriculation *', 'DK...'),
                            const SizedBox(height: 16),
                            _buildDropdownField<VehicleType>(
                              label: 'Type de véhicule *',
                              value: formData.type,
                              items: VehicleType.values,
                              onChanged: (val) {
                                if (val != null) {
                                  ref.read(vehicleFormViewModelProvider.notifier).updateType(val);
                                }
                              },
                            ),
                            const SizedBox(height: 12),
                            Row(
                              children: [
                                Expanded(
                                  child: _buildDropdownField<FuelType>(
                                    label: 'Carburant',
                                    value: formData.carburant,
                                    items: FuelType.values,
                                    onChanged: ref.read(vehicleFormViewModelProvider.notifier).updateCarburant,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: _buildDropdownField<Transmission>(
                                    label: 'Transmission',
                                    value: formData.transmission,
                                    items: Transmission.values,
                                    onChanged: ref.read(vehicleFormViewModelProvider.notifier).updateTransmission,
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 12),
                            _buildDropdownField<String>(
                              label: 'Zone / Ville *',
                              value: formData.ville.isEmpty ? null : formData.ville,
                              items: const ['Almadies', 'Ngor', 'Ouakam', 'Plateau', 'Mermoz', 'Parcelles Assainies', 'Pikine', 'Guediawaye', 'Rufisque'],
                              onChanged: (val) => ref.read(vehicleFormViewModelProvider.notifier).updateVille(val ?? ''),
                            ),
                            const SizedBox(height: 12),
                            _buildTextField(_adresseController, 'Adresse *', 'Rue...'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Section 2: Tarification & Options
                      _buildSectionCard(
                        title: 'Tarification & Options',
                        child: Column(
                          children: [
                            _buildTextField(_prixController, 'Prix par jour (FCFA) *', '25 000', keyboardType: TextInputType.number, suffixText: 'FCFA'),
                            const SizedBox(height: 12),
                            _buildTextField(_joursMinController, 'Durée minimum (jours) *', '1', keyboardType: TextInputType.number),
                            const SizedBox(height: 12),
                            _buildTextField(_livraisonController, 'Frais de livraison (FCFA)', 'Optionnel', keyboardType: TextInputType.number, suffixText: 'FCFA'),
                            const SizedBox(height: 12),
                            SwitchListTile(
                              title: const Text('Voyage Hors Dakar ?', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                              value: formData.autoriseHorsDakar,
                              onChanged: ref.read(vehicleFormViewModelProvider.notifier).updateAutoriseHorsDakar,
                              activeColor: const Color(0xFF10B981),
                            ),
                            if (formData.autoriseHorsDakar) ...[
                              const SizedBox(height: 12),
                              _buildTextField(_suppHorsDakarController, 'Supplément Hors Dakar / Jour (FCFA)', '5 000', keyboardType: TextInputType.number, suffixText: 'FCFA'),
                            ],
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Section 3: Conditions & Équipements
                      _buildSectionCard(
                        title: 'Conditions & Équipements',
                        child: Column(
                          children: [
                            _buildTextField(_ageMinController, 'Âge minimum requis *', '21', keyboardType: TextInputType.number),
                            const SizedBox(height: 16),
                            _buildDropdownField<String>(
                              label: 'Assurance *',
                              value: formData.assurance,
                              items: const ['Locataire responsable', 'Incluse (tous risques)'],
                              onChanged: ref.read(vehicleFormViewModelProvider.notifier).updateAssurance,
                            ),
                            const SizedBox(height: 12),
                            _buildDropdownField<String>(
                              label: 'Politique Carburant',
                              value: formData.carburantCondition,
                              items: const ['Plein à plein', 'Niveau identique'],
                              onChanged: ref.read(vehicleFormViewModelProvider.notifier).updateCarburantCondition,
                            ),
                            const SizedBox(height: 12),
                            _buildTextField(_rulesController, 'Règles spécifiques', 'Restitution propre...', maxLines: 3),
                            const SizedBox(height: 20),
                            const Align(
                              alignment: Alignment.centerLeft,
                              child: Text('Équipements', style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold)),
                            ),
                            const SizedBox(height: 12),
                            EquipmentChipSelector(
                              selected: formData.equipements,
                              onToggle: ref.read(vehicleFormViewModelProvider.notifier).toggleEquipement,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Section 4: Galerie Photos
                      _buildSectionCard(
                        title: 'Photos du véhicule',
                        child: VehiclePhotoUploader(
                          photos: formData.photos,
                          isUploading: formData.isUploading,
                          uploadProgress: formData.uploadProgress,
                          onUploadPhoto: ref.read(vehicleFormViewModelProvider.notifier).uploadAndAddPhoto,
                          onDeletePhoto: ref.read(vehicleFormViewModelProvider.notifier).removePhoto,
                          onSetMainPhoto: (id) => ref.read(vehicleFormViewModelProvider.notifier).changePhotoProperties(id, estPrincipale: true),
                        ),
                      ),
                      const SizedBox(height: 16),

                      // Section 5: Documents Administratifs
                      _buildSectionCard(
                        title: 'Documents administratifs',
                        child: Column(
                          children: [
                            VehicleDocumentUploader(
                              label: 'Carte Grise *',
                              description: 'Document officiel d\'immatriculation',
                              docUrl: formData.carteGriseUrl,
                              isUploading: formData.isUploading && formData.carteGriseUrl == null,
                              uploadProgress: formData.uploadProgress,
                              onUpload: (path) => ref.read(vehicleFormViewModelProvider.notifier).uploadDocument(path, true),
                              onRemove: () => ref.read(vehicleFormViewModelProvider.notifier).updateCarteGrise(null, null),
                            ),
                            const SizedBox(height: 12),
                            VehicleDocumentUploader(
                              label: 'Attestation d\'Assurance *',
                              description: 'Document d\'assurance en cours de validité',
                              docUrl: formData.assuranceDocUrl,
                              isUploading: formData.isUploading && formData.assuranceDocUrl == null,
                              uploadProgress: formData.uploadProgress,
                              onUpload: (path) => ref.read(vehicleFormViewModelProvider.notifier).uploadDocument(path, false),
                              onRemove: () => ref.read(vehicleFormViewModelProvider.notifier).updateAssuranceDocs(null, null),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Save button at bottom
              Container(
                padding: const EdgeInsets.all(20.0),
                decoration: BoxDecoration(
                  color: isDark ? const Color(0xFF1E293B) : Colors.white,
                  border: Border(
                    top: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                  ),
                ),
                child: ElevatedButton(
                  onPressed: () async {
                    _syncInputsToState(ref);
                    if (_validateFields(formData)) {
                      await ref.read(vehicleFormViewModelProvider.notifier).submit();
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF10B981),
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 16),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                    elevation: 0,
                  ),
                  child: const Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.save),
                      SizedBox(width: 8),
                      Text('Sauvegarder les modifications', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
        orElse: () => const Center(child: CircularProgressIndicator(valueColor: AlwaysStoppedAnimation<Color>(Color(0xFF10B981)))),
      ),
    );
  }

  Widget _buildSectionCard({required String title, required Widget child}) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Card(
      color: isDark ? const Color(0xFF1E293B) : Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      elevation: 0,
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: isDark ? Colors.white : const Color(0xFF0F172A),
              ),
            ),
            const SizedBox(height: 16),
            child,
          ],
        ),
      ),
    );
  }

  Widget _buildTextField(
    TextEditingController controller,
    String label,
    String hint, {
    TextInputType keyboardType = TextInputType.text,
    TextCapitalization capitalization = TextCapitalization.none,
    String? suffixText,
    int maxLines = 1,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        TextField(
          controller: controller,
          keyboardType: keyboardType,
          textCapitalization: capitalization,
          maxLines: maxLines,
          style: const TextStyle(fontSize: 15),
          decoration: InputDecoration(
            hintText: hint,
            hintStyle: const TextStyle(color: Color(0xFF94A3B8), fontSize: 14),
            suffixText: suffixText,
            suffixStyle: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF10B981)),
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            filled: true,
            fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF10B981), width: 1.5),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildDropdownField<T>({
    required String label,
    required T? value,
    required List<T> items,
    required ValueChanged<T?> onChanged,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w700)),
        const SizedBox(height: 6),
        DropdownButtonFormField<T>(
          value: value,
          onChanged: onChanged,
          style: TextStyle(fontSize: 15, color: isDark ? Colors.white : Colors.black),
          decoration: InputDecoration(
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
            filled: true,
            fillColor: isDark ? const Color(0xFF0F172A) : const Color(0xFFF8FAFC),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(color: Color(0xFF10B981), width: 1.5),
            ),
          ),
          items: items.map((item) {
            String text = '';
            if (item is Enum) {
              text = item.name;
            } else {
              text = item.toString();
            }
            return DropdownMenuItem<T>(
              value: item,
              child: Text(text),
            );
          }).toList(),
        ),
      ],
    );
  }
}
