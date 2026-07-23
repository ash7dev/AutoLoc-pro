import 'dart:io';
import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';

import '../../../../../design_system/atoms/buttons/primary_button.dart';
import '../../../../../design_system/atoms/buttons/secondary_button.dart';
import '../../../../../design_system/components/premium_glass.dart';
import '../../../../../design_system/tokens/ds_colors.dart';
import '../../../../../design_system/tokens/ds_spacing.dart';
import '../../../../../design_system/tokens/ds_typography.dart';
import '../../../../user/di/user_injection.dart';
import '../../../../user/domain/usecases/link_permis.dart';

class PermisGateView extends ConsumerStatefulWidget {
  const PermisGateView({
    super.key,
    required this.onSubmitted,
    this.onProceed,
  });

  final VoidCallback onSubmitted;
  final VoidCallback? onProceed;

  @override
  ConsumerState<PermisGateView> createState() => _PermisGateViewState();
}

class _PermisGateViewState extends ConsumerState<PermisGateView> {
  File? _licenseFile;
  bool _isLoading = false;
  String? _error;
  bool _isSuccess = false;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(ImageSource source) async {
    try {
      final XFile? pickedFile = await _picker.pickImage(
        source: source,
        maxWidth: 1600,
        maxHeight: 1600,
        imageQuality: 80,
      );

      if (pickedFile != null) {
        setState(() {
          _error = null;
          _licenseFile = File(pickedFile.path);
        });
      }
    } catch (e) {
      setState(() => _error = 'Erreur lors de la capture : $e');
    }
  }

  void _showImageSourceActionSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF141414),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) {
        bool isPopping = false;
        return SafeArea(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              ListTile(
                leading: const Icon(Icons.camera_alt_rounded, color: kEmerald),
                title: Text('Prendre une photo',
                    style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600)),
                onTap: () {
                  if (isPopping) return;
                  isPopping = true;
                  Navigator.pop(sheetContext);
                  _pickImage(ImageSource.camera);
                },
              ),
              ListTile(
                leading: const Icon(Icons.photo_library_rounded, color: kEmerald),
                title: Text('Choisir dans la galerie',
                    style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600)),
                onTap: () {
                  if (isPopping) return;
                  isPopping = true;
                  Navigator.pop(sheetContext);
                  _pickImage(ImageSource.gallery);
                },
              ),
            ],
          ),
        );
      },
    );
  }

  Future<Map<String, String>> _uploadToCloudinary(
      File file, String apiKey, int timestamp, String signature, String folder, String cloudName) async {
    final dio = Dio();
    final formData = FormData.fromMap({
      'file': await MultipartFile.fromFile(file.path),
      'api_key': apiKey,
      'timestamp': timestamp.toString(),
      'signature': signature,
      'folder': folder,
    });

    final response = await dio.post(
      'https://api.cloudinary.com/v1_1/$cloudName/auto/upload',
      data: formData,
    );

    if (response.statusCode == 200 || response.statusCode == 201) {
      return {
        'url': response.data['secure_url'] as String,
        'publicId': response.data['public_id'] as String,
      };
    } else {
      throw Exception('Erreur de chargement Cloudinary: ${response.statusMessage}');
    }
  }

  Future<void> _submit() async {
    if (_licenseFile == null) {
      setState(() => _error = 'Une photo de votre permis de conduire est requise.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final getSignature = ref.read(getKycUploadSignatureProvider);
      final linkPermis = ref.read(linkPermisProvider);

      final sigResult = await getSignature();

      await sigResult.fold(
        (failure) async {
          setState(() => _error = failure.message);
        },
        (sig) async {
          final uploadResult = await _uploadToCloudinary(
            _licenseFile!,
            sig.apiKey,
            sig.timestamp,
            sig.signature,
            sig.folder,
            sig.cloudName,
          );

          final linkResult = await linkPermis(LinkPermisParams(
            url: uploadResult['url']!,
            publicId: uploadResult['publicId']!,
          ));

          linkResult.fold(
            (failure) => setState(() => _error = failure.message),
            (success) {
              setState(() => _isSuccess = true);
              Future.delayed(const Duration(milliseconds: 1200), widget.onSubmitted);
            },
          );
        },
      );
    } catch (e) {
      setState(() => _error = 'Une erreur est survenue lors de l\'envoi : $e');
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isSuccess) {
      return Container(
        padding: const EdgeInsets.symmetric(vertical: DSSpacing.xl),
        alignment: Alignment.center,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const StatusIconBadge(icon: Icons.check_circle_outline_rounded),
            const SizedBox(height: DSSpacing.md),
            Text(
              'Permis enregistré',
              style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: -0.3),
            ),
            const SizedBox(height: DSSpacing.xs),
            Text(
              'Redirection en cours...',
              style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary),
            ),
          ],
        ),
      );
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        PremiumGlassCard(
          radius: PremiumRadius.card,
          blur: 10,
          accent: true,
          padding: const EdgeInsets.all(DSSpacing.md),
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Icon(Icons.shield_outlined, color: kEmerald, size: 20),
              const SizedBox(width: DSSpacing.sm),
              Expanded(
                child: Text(
                  'Une photo recto-verso de votre permis de conduire en cours de validité est requise pour continuer.',
                  style: DSTypography.bodySmall.copyWith(color: Colors.white.withOpacity(0.85), height: 1.4),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: DSSpacing.lg),
        Text(
          'PERMIS DE CONDUIRE',
          style: DSTypography.labelSmall.copyWith(
            color: DSColors.darkTextTertiary,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: DSSpacing.xs),
        InkWell(
          onTap: () => _showImageSourceActionSheet(context),
          borderRadius: BorderRadius.circular(PremiumRadius.card),
          child: PremiumGlassCard(
            radius: PremiumRadius.card,
            blur: 10,
            accent: _licenseFile != null,
            padding: EdgeInsets.zero,
            child: SizedBox(
              height: 180,
              child: _licenseFile != null
                  ? Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(PremiumRadius.card),
                          child: Image.file(
                            _licenseFile!,
                            width: double.infinity,
                            height: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Container(
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(PremiumRadius.card),
                            color: Colors.black45,
                          ),
                        ),
                        Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              const Icon(Icons.check_circle_rounded, color: kEmerald, size: 40),
                              const SizedBox(height: DSSpacing.xs),
                              Text(
                                'Modifier la photo',
                                style:
                                    DSTypography.labelSmall.copyWith(color: Colors.white, fontWeight: FontWeight.w800),
                              ),
                            ],
                          ),
                        ),
                      ],
                    )
                  : Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          EmeraldIconChip(icon: Icons.file_upload_outlined, size: 44, iconSize: 22, glow: false),
                          const SizedBox(height: DSSpacing.xs),
                          Text(
                            'Prendre ou charger votre permis',
                            style: DSTypography.bodyMedium
                                .copyWith(color: DSColors.darkTextSecondary, fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: DSSpacing.xxs),
                          Text(
                            'PNG, JPG · max 10 Mo',
                            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
                          ),
                        ],
                      ),
                    ),
            ),
          ),
        ),
        if (_error != null) ...[
          const SizedBox(height: DSSpacing.md),
          InlineErrorBanner(message: _error!),
        ],
        const SizedBox(height: DSSpacing.xl),
        PrimaryButton(
          label: 'Valider mon permis',
          fullWidth: true,
          isLoading: _isLoading,
          isDisabled: _licenseFile == null,
          onPressed: _submit,
          icon: Icons.arrow_forward_rounded,
          iconPosition: IconPosition.right,
        ),
        if (widget.onProceed != null) ...[
          const SizedBox(height: DSSpacing.sm),
          SecondaryButton(
            label: 'Annuler',
            fullWidth: true,
            onPressed: widget.onProceed!,
          ),
        ],
      ],
    );
  }
}