import 'package:freezed_annotation/freezed_annotation.dart';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../owner/fleet/presentation/providers/fleet_providers.dart';

import '../../../../shared/enums/fuel_type.dart';
import '../../../../shared/enums/transmission.dart';
import '../../../../shared/enums/vehicle_type.dart';
import '../../../../shared/presentation/base/base_view_model.dart';
import '../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/vehicle.dart';
import '../../domain/usecases/create_vehicle.dart';
import '../../domain/usecases/update_vehicle.dart';
import '../../domain/usecases/get_upload_signature.dart';
import '../../domain/usecases/add_photo.dart';
import '../../domain/usecases/link_photo.dart';
import '../../domain/usecases/update_photo.dart';
import '../../domain/usecases/delete_photo.dart';
import '../states/vehicle_form_state.dart';

/// **VehicleFormViewModel** - ViewModel pour la création et la modification de véhicule
class VehicleFormViewModel extends BaseViewModel<VehicleFormData> {
  final CreateVehicle createVehicleUseCase;
  final UpdateVehicle updateVehicleUseCase;
  final GetUploadSignature getUploadSignatureUseCase;
  final AddPhoto addPhotoUseCase;
  final LinkPhoto linkPhotoUseCase;
  final UpdatePhoto updatePhotoUseCase;
  final DeletePhoto deletePhotoUseCase;
  final Ref _ref;

  VehicleFormViewModel({
    required this.createVehicleUseCase,
    required this.updateVehicleUseCase,
    required this.getUploadSignatureUseCase,
    required this.addPhotoUseCase,
    required this.linkPhotoUseCase,
    required this.updatePhotoUseCase,
    required this.deletePhotoUseCase,
    required Ref ref,
  }) : _ref = ref, super();

  // =========================================================================
  // INITIALIZATION & LIFECYCLE
  // =========================================================================

  @override
  Future<void> load() async {
    // Par défaut, initialise un formulaire vide pour la création
    state = const ViewState.success(VehicleFormData());
  }

  /// **Initialiser le formulaire pour modification**
  void setVehicle(Vehicle vehicle) {
    state = ViewState.success(VehicleFormData(
      vehicle: vehicle,
      marque: vehicle.marque,
      modele: vehicle.modele,
      annee: vehicle.annee,
      type: vehicle.type,
      carburant: vehicle.carburant,
      transmission: vehicle.transmission,
      nombrePlaces: vehicle.nombrePlaces ?? 5,
      immatriculation: vehicle.immatriculation,
      prixParJour: vehicle.prixParJour,
      ville: vehicle.ville,
      adresse: vehicle.adresse,
      joursMinimum: vehicle.joursMinimum,
      ageMinimum: vehicle.ageMinimum,
      assurance: vehicle.assurance,
      reglesSpecifiques: vehicle.reglesSpecifiques,
      zoneConduite: vehicle.zoneConduite,
      assuranceDocUrl: vehicle.assuranceDocUrl,
      assuranceDocPublicId: vehicle.assuranceDocPublicId,
      carteGriseUrl: vehicle.carteGriseUrl,
      carteGrisePublicId: vehicle.carteGrisePublicId,
      fraisLivraison: vehicle.fraisLivraison,
      autoriseHorsDakar: vehicle.autoriseHorsDakar,
      supplementHorsDakarParJour: vehicle.supplementHorsDakarParJour,
      carburantCondition: vehicle.carburantCondition,
      equipements: vehicle.equipements,
      tarifs: vehicle.tarifs.map((t) => {
        'id': t.id,
        'joursMin': t.joursMin,
        'joursMax': t.joursMax,
        'prix': t.prix,
        'position': t.position,
      }).toList(),
      photos: vehicle.photos,
    ));
  }

  // =========================================================================
  // FORM FIELD UPDATES (OOP STYLE)
  // =========================================================================

  void updateMarque(String value) => _updateData((d) => d.copyWith(marque: value));
  void updateModele(String value) => _updateData((d) => d.copyWith(modele: value));
  void updateAnnee(int value) => _updateData((d) => d.copyWith(annee: value));
  void updateType(VehicleType value) => _updateData((d) => d.copyWith(type: value));
  void updateCarburant(FuelType? value) => _updateData((d) => d.copyWith(carburant: value));
  void updateTransmission(Transmission? value) => _updateData((d) => d.copyWith(transmission: value));
  void updateNombrePlaces(int value) => _updateData((d) => d.copyWith(nombrePlaces: value));
  void updateImmatriculation(String value) => _updateData((d) => d.copyWith(immatriculation: value));
  void updatePrixParJour(double value) => _updateData((d) => d.copyWith(prixParJour: value));
  void updateVille(String value) => _updateData((d) => d.copyWith(ville: value));
  void updateAdresse(String value) => _updateData((d) => d.copyWith(adresse: value));
  void updateJoursMinimum(int value) => _updateData((d) => d.copyWith(joursMinimum: value));
  void updateAgeMinimum(int value) => _updateData((d) => d.copyWith(ageMinimum: value));
  void updateAssurance(String? value) => _updateData((d) => d.copyWith(assurance: value));
  void updateReglesSpecifiques(String? value) => _updateData((d) => d.copyWith(reglesSpecifiques: value));
  void updateZoneConduite(String? value) => _updateData((d) => d.copyWith(zoneConduite: value));
  void updateAssuranceDocs(String? url, String? publicId) => _updateData((d) => d.copyWith(assuranceDocUrl: url, assuranceDocPublicId: publicId));
  void updateCarteGrise(String? url, String? publicId) => _updateData((d) => d.copyWith(carteGriseUrl: url, carteGrisePublicId: publicId));
  void updateFraisLivraison(double? value) => _updateData((d) => d.copyWith(fraisLivraison: value));
  void updateAutoriseHorsDakar(bool value) => _updateData((d) => d.copyWith(autoriseHorsDakar: value));
  void updateSupplementHorsDakarParJour(double? value) => _updateData((d) => d.copyWith(supplementHorsDakarParJour: value));
  void updateCarburantCondition(String? value) => _updateData((d) => d.copyWith(carburantCondition: value));

  void toggleEquipement(String value) {
    final current = state.dataOrNull?.equipements ?? [];
    final updated = List<String>.from(current);
    if (updated.contains(value)) {
      updated.remove(value);
    } else {
      updated.add(value);
    }
    _updateData((d) => d.copyWith(equipements: updated));
  }

  void addTarif(Map<String, dynamic> tarif) {
    final current = state.dataOrNull?.tarifs ?? [];
    _updateData((d) => d.copyWith(tarifs: [...current, tarif]));
  }

  void removeTarif(int index) {
    final current = state.dataOrNull?.tarifs ?? [];
    if (index >= 0 && index < current.length) {
      final updated = List<Map<String, dynamic>>.from(current)..removeAt(index);
      _updateData((d) => d.copyWith(tarifs: updated));
    }
  }

  // Helper interne pour mettre à jour les données immutables du state
  void _updateData(VehicleFormData Function(VehicleFormData) updater) {
    final currentData = state.dataOrNull ?? const VehicleFormData();
    state = ViewState.success(updater(currentData));
  }

  // =========================================================================
  // SUBMISSION LOGIC
  // =========================================================================

  /// **Soumettre le formulaire (Création ou Modification)**
  Future<void> submit() async {
    final data = state.dataOrNull;
    if (data == null) return;

    if (!data.canSubmit) {
      showError('Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    state = const ViewState.loading();

    if (data.vehicle == null) {
      // MODE CRÉATION
      final result = await createVehicleUseCase(
        marque: data.marque,
        modele: data.modele,
        annee: data.annee,
        type: data.type?.name ?? '',
        immatriculation: data.immatriculation,
        prixParJour: data.prixParJour,
        ville: data.ville,
        adresse: data.adresse,
        carburant: data.carburant?.name,
        transmission: data.transmission?.name,
        nombrePlaces: data.nombrePlaces,
        joursMinimum: data.joursMinimum,
        ageMinimum: data.ageMinimum,
        assurance: data.assurance,
        reglesSpecifiques: data.reglesSpecifiques,
        zoneConduite: data.zoneConduite,
        assuranceDocUrl: data.assuranceDocUrl,
        assuranceDocPublicId: data.assuranceDocPublicId,
        carteGriseUrl: data.carteGriseUrl,
        carteGrisePublicId: data.carteGrisePublicId,
        fraisLivraison: data.fraisLivraison,
        autoriseHorsDakar: data.autoriseHorsDakar,
        supplementHorsDakarParJour: data.supplementHorsDakarParJour,
        carburantCondition: data.carburantCondition,
        equipements: data.equipements,
        tarifs: data.tarifs,
        photos: data.photos
            .where((p) => p.url.isNotEmpty && p.publicId != null)
            .map((p) => {
                  'url': p.url,
                  'publicId': p.publicId,
                })
            .toList(),
      );

      result.fold(
        (failure) {
          state = ViewState.success(data); // Rétablir formulaire
          showError(failure.message);
        },
        (newVehicle) {
          // Invalider le cache et forcer le rechargement de la flotte propriétaire
          _ref.read(fleetViewModelProvider.notifier).refresh();
          showSuccess('Véhicule enregistré avec succès !');
          navigateBack(result: newVehicle); // Retourner à l'écran précédent
        },
      );
    } else {
      // MODE MODIFICATION
      final result = await updateVehicleUseCase(
        vehicleId: data.vehicle!.id,
        marque: data.marque,
        modele: data.modele,
        annee: data.annee,
        type: data.type?.name,
        carburant: data.carburant?.name,
        transmission: data.transmission?.name,
        nombrePlaces: data.nombrePlaces,
        immatriculation: data.immatriculation,
        prixParJour: data.prixParJour,
        ville: data.ville,
        adresse: data.adresse,
        joursMinimum: data.joursMinimum,
        ageMinimum: data.ageMinimum,
        assurance: data.assurance,
        reglesSpecifiques: data.reglesSpecifiques,
        zoneConduite: data.zoneConduite,
        assuranceDocUrl: data.assuranceDocUrl,
        assuranceDocPublicId: data.assuranceDocPublicId,
        carteGriseUrl: data.carteGriseUrl,
        carteGrisePublicId: data.carteGrisePublicId,
        fraisLivraison: data.fraisLivraison,
        autoriseHorsDakar: data.autoriseHorsDakar,
        supplementHorsDakarParJour: data.supplementHorsDakarParJour,
        carburantCondition: data.carburantCondition,
        equipements: data.equipements,
        tarifs: data.tarifs,
      );

      result.fold(
        (failure) {
          state = ViewState.success(data); // Rétablir formulaire
          showError(failure.message);
        },
        (updatedVehicle) {
          // Invalider le cache et forcer le rechargement de la flotte propriétaire
          _ref.read(fleetViewModelProvider.notifier).refresh();
          showSuccess('Véhicule mis à jour avec succès !');
          navigateBack(result: updatedVehicle);
        },
      );
    }
  }

  // =========================================================================
  // PHOTO MANAGEMENT
  // =========================================================================

  /// **Ajouter une photo au véhicule (upload direct via API)**
  Future<void> uploadAndAddPhoto(String imagePath) async {
    final data = state.dataOrNull;
    if (data == null) return;

    _updateData((d) => d.copyWith(isUploading: true, uploadProgress: 0.2));

    final sigResult = await getUploadSignatureUseCase();

    await sigResult.fold(
      (failure) async {
        _updateData((d) => d.copyWith(isUploading: false, uploadProgress: 0.0));
        showError(failure.message);
      },
      (sigMap) async {
        try {
          final signature = sigMap['signature'] as String;
          final timestamp = sigMap['timestamp'] as int;
          final apiKey = sigMap['apiKey'] as String;
          final cloudName = sigMap['cloudName'] as String;
          final folder = sigMap['folder'] as String;

          final dio = Dio();
          final formData = FormData.fromMap({
            'file': await MultipartFile.fromFile(imagePath),
            'api_key': apiKey,
            'timestamp': timestamp.toString(),
            'signature': signature,
            'folder': folder,
          });

          final response = await dio.post(
            'https://api.cloudinary.com/v1_1/$cloudName/image/upload',
            data: formData,
            onSendProgress: (sent, total) {
              if (total > 0) {
                final progress = 0.2 + (sent / total) * 0.7;
                _updateData((d) => d.copyWith(uploadProgress: progress));
              }
            },
          );

          if (response.statusCode == 200 || response.statusCode == 201) {
            final url = response.data['secure_url'] as String;
            final publicId = response.data['public_id'] as String;

            if (data.vehicle == null) {
              // MODE CRÉATION
              final newPhoto = PhotoVehicule(
                id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
                url: url,
                publicId: publicId,
                position: data.photos.length,
                estPrincipale: data.photos.isEmpty,
              );
              _updateData((d) => d.copyWith(
                    photos: [...d.photos, newPhoto],
                    isUploading: false,
                    uploadProgress: 1.0,
                  ));
              showSuccess('Photo ajoutée.');
            } else {
              // MODE MODIFICATION
              final linkResult = await linkPhotoUseCase(
                vehicleId: data.vehicle!.id,
                url: url,
                publicId: publicId,
              );

              linkResult.fold(
                (fail) {
                  _updateData((d) => d.copyWith(isUploading: false, uploadProgress: 0.0));
                  showError(fail.message);
                },
                (photoMap) {
                  final newPhoto = PhotoVehicule(
                    id: photoMap['id'] ?? '',
                    url: photoMap['url'] ?? '',
                    position: photoMap['position'] ?? 0,
                    estPrincipale: photoMap['estPrincipale'] ?? false,
                    publicId: photoMap['publicId'],
                  );

                  _updateData((d) => d.copyWith(
                        photos: [...d.photos, newPhoto],
                        isUploading: false,
                        uploadProgress: 1.0,
                      ));
                  showSuccess('Photo ajoutée et liée avec succès.');
                },
              );
            }
          } else {
            throw Exception('Erreur de chargement Cloudinary');
          }
        } catch (e) {
          _updateData((d) => d.copyWith(isUploading: false, uploadProgress: 0.0));
          showError('Échec du téléversement de la photo: $e');
        }
      },
    );
  }

  /// **Changer le rôle principal ou la position d'une photo**
  Future<void> changePhotoProperties(String photoId, {int? position, bool? estPrincipale}) async {
    final data = state.dataOrNull;
    if (data == null) return;

    if (data.vehicle == null) {
      // MODE CRÉATION : réordonner localement dans l'état
      var updatedPhotos = data.photos.map((p) {
        if (p.id == photoId) {
          return p.copyWith(
            position: position ?? p.position,
            estPrincipale: estPrincipale ?? p.estPrincipale,
          );
        } else if (estPrincipale == true && p.estPrincipale) {
          return p.copyWith(estPrincipale: false);
        }
        return p;
      }).toList();

      if (estPrincipale == true) {
        final mainPhotoIndex = updatedPhotos.indexWhere((p) => p.id == photoId);
        if (mainPhotoIndex != -1) {
          final mainPhoto = updatedPhotos.removeAt(mainPhotoIndex);
          updatedPhotos.insert(0, mainPhoto);
        }
      }

      // Re-indexer les positions
      for (int i = 0; i < updatedPhotos.length; i++) {
        updatedPhotos[i] = updatedPhotos[i].copyWith(position: i, estPrincipale: i == 0);
      }

      _updateData((d) => d.copyWith(photos: updatedPhotos));
      showSuccess('Photo principale définie.');
      return;
    }

    final result = await updatePhotoUseCase(
      vehicleId: data.vehicle!.id,
      photoId: photoId,
      position: position,
      estPrincipale: estPrincipale,
    );

    result.fold(
      (failure) => showError(failure.message),
      (photoMap) {
        final updatedPhotos = data.photos.map((p) {
          if (p.id == photoId) {
            return p.copyWith(
              position: position ?? p.position,
              estPrincipale: estPrincipale ?? p.estPrincipale,
            );
          } else if (estPrincipale == true && p.estPrincipale) {
            // Un seul véhicule peut avoir une seule photo principale
            return p.copyWith(estPrincipale: false);
          }
          return p;
        }).toList();

        _updateData((d) => d.copyWith(photos: updatedPhotos));
        showSuccess('Propriétés de la photo mises à jour.');
      },
    );
  }

  /// **Supprimer une photo**
  Future<void> removePhoto(String photoId) async {
    final data = state.dataOrNull;
    if (data == null) return;

    if (data.vehicle == null) {
      // MODE CRÉATION : supprimer localement de la liste
      var updatedPhotos = data.photos.where((p) => p.id != photoId).toList();
      if (updatedPhotos.isNotEmpty && !updatedPhotos.any((p) => p.estPrincipale)) {
        updatedPhotos[0] = updatedPhotos[0].copyWith(estPrincipale: true, position: 0);
      }
      for (int i = 0; i < updatedPhotos.length; i++) {
        updatedPhotos[i] = updatedPhotos[i].copyWith(position: i);
      }
      _updateData((d) => d.copyWith(photos: updatedPhotos));
      showSuccess('Photo supprimée.');
      return;
    }

    final result = await deletePhotoUseCase(
      vehicleId: data.vehicle!.id,
      photoId: photoId,
    );

    result.fold(
      (failure) => showError(failure.message),
      (deleted) {
        if (deleted) {
          final updatedPhotos = data.photos.where((p) => p.id != photoId).toList();
          _updateData((d) => d.copyWith(photos: updatedPhotos));
          showSuccess('Photo supprimée.');
        } else {
          showError('Impossible de supprimer la photo.');
        }
      },
    );
  }

  /// **Téléverser un document administratif (Carte Grise ou Assurance)**
  Future<void> uploadDocument(String filePath, bool isCarteGrise) async {
    final data = state.dataOrNull;
    if (data == null) return;

    _updateData((d) => d.copyWith(isUploading: true, uploadProgress: 0.2));

    final sigResult = await getUploadSignatureUseCase();

    await sigResult.fold(
      (failure) async {
        _updateData((d) => d.copyWith(isUploading: false, uploadProgress: 0.0));
        showError(failure.message);
      },
      (sigMap) async {
        try {
          final signature = sigMap['signature'] as String;
          final timestamp = sigMap['timestamp'] as int;
          final apiKey = sigMap['apiKey'] as String;
          final cloudName = sigMap['cloudName'] as String;
          final folder = sigMap['folder'] as String;

          final dio = Dio();
          final formData = FormData.fromMap({
            'file': await MultipartFile.fromFile(filePath),
            'api_key': apiKey,
            'timestamp': timestamp.toString(),
            'signature': signature,
            'folder': folder,
          });

          final response = await dio.post(
            'https://api.cloudinary.com/v1_1/$cloudName/auto/upload',
            data: formData,
            onSendProgress: (sent, total) {
              if (total > 0) {
                final progress = 0.2 + (sent / total) * 0.7;
                _updateData((d) => d.copyWith(uploadProgress: progress));
              }
            },
          );

          if (response.statusCode == 200 || response.statusCode == 201) {
            final url = response.data['secure_url'] as String;
            final publicId = response.data['public_id'] as String;

            if (isCarteGrise) {
              updateCarteGrise(url, publicId);
            } else {
              updateAssuranceDocs(url, publicId);
            }
            _updateData((d) => d.copyWith(isUploading: false, uploadProgress: 1.0));
            showSuccess('Document téléversé avec succès.');
          } else {
            throw Exception('Erreur de chargement Cloudinary');
          }
        } catch (e) {
          _updateData((d) => d.copyWith(isUploading: false, uploadProgress: 0.0));
          showError('Échec du téléversement du document: $e');
        }
      },
    );
  }
}
