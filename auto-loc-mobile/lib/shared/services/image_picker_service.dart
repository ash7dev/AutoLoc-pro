import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart' as image_picker;
import 'package:file_picker/file_picker.dart';

/// Service centralisé pour la sélection d'images
///
/// Utilise image_picker pour la caméra et file_picker pour les fichiers
/// Plus stable et compatible que wechat_assets_picker
class ImagePickerService {
  /// Affiche un bottom sheet pour choisir entre Galerie ou Caméra
  ///
  /// [context] - BuildContext
  /// [maxAssets] - Nombre maximum d'images (défaut: 1)
  /// [allowMultiple] - Autoriser la sélection multiple (défaut: false)
  ///
  /// Retourne une liste de chemins de fichiers ou null si annulé
  static Future<List<String>?> showImageSourcePicker(
    BuildContext context, {
    int maxAssets = 1,
    bool allowMultiple = false,
  }) async {
    final source = await showModalBottomSheet<_ImageSource>(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (context) => _ImageSourcePickerSheet(),
    );

    if (source == null) return null;

    switch (source) {
      case _ImageSource.camera:
        final path = await _takePhoto(context);
        return path != null ? [path] : null;

      case _ImageSource.gallery:
        return _pickImages(context, allowMultiple: allowMultiple || maxAssets > 1);
    }
  }

  /// Prendre une photo avec l'appareil photo
  static Future<String?> _takePhoto(BuildContext context) async {
    try {
      final image_picker.ImagePicker picker = image_picker.ImagePicker();
      final image_picker.XFile? photo = await picker.pickImage(
        source: image_picker.ImageSource.camera,
        maxWidth: 1600,
        maxHeight: 1200,
        imageQuality: 85,
      );

      return photo?.path;
    } catch (e) {
      if (context.mounted) {
        _showErrorSnackBar(context, 'Erreur lors de la prise de photo: $e');
      }
      return null;
    }
  }

  /// Sélectionner des images depuis la galerie
  static Future<List<String>?> _pickImages(
    BuildContext context, {
    bool allowMultiple = false,
  }) async {
    try {
      final result = await FilePicker.platform.pickFiles(
        type: FileType.image,
        allowMultiple: allowMultiple,
        allowCompression: true,
      );

      if (result == null || result.files.isEmpty) {
        return null;
      }

      // Filtrer les fichiers qui ont un path valide
      final paths = result.files
          .where((file) => file.path != null)
          .map((file) => file.path!)
          .toList();

      return paths.isNotEmpty ? paths : null;
    } catch (e) {
      if (context.mounted) {
        _showErrorSnackBar(context, 'Erreur lors de la sélection: $e');
      }
      return null;
    }
  }

  /// Affiche un SnackBar d'erreur
  static void _showErrorSnackBar(BuildContext context, String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 3),
      ),
    );
  }
}

/// Source d'image (Galerie ou Caméra)
enum _ImageSource {
  gallery,
  camera,
}

/// Bottom Sheet pour choisir la source d'image
class _ImageSourcePickerSheet extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF1E293B) : Colors.white,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(20.0),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Ajouter une photo',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: isDark ? Colors.white : const Color(0xFF0D0D0D),
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 20),

              // Option: Galerie
              ListTile(
                leading: const Icon(
                  Icons.photo_library_outlined,
                  color: Color(0xFF10B981),
                ),
                title: const Text('Choisir dans la galerie'),
                subtitle: const Text('Sélectionnez des photos existantes'),
                onTap: () => Navigator.pop(context, _ImageSource.gallery),
              ),

              const Divider(),

              // Option: Caméra
              ListTile(
                leading: const Icon(
                  Icons.camera_alt_outlined,
                  color: Color(0xFF10B981),
                ),
                title: const Text('Prendre une photo'),
                subtitle: const Text('Utilisez l\'appareil photo'),
                onTap: () => Navigator.pop(context, _ImageSource.camera),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
