import 'dart:io';
import 'dart:ui';
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
import '../../../../user/domain/usecases/submit_kyc.dart';
import '../../../../../shared/enums/kyc_status.dart';

/// Gate 3: Vérification d'identité (KYC Documents + Selfie)
/// Aligné sur le système premium_glass : blur 10, EmeraldIconChip,
/// StatusIconBadge / InlineErrorBanner partagés.
class KycGateView extends ConsumerStatefulWidget {
  const KycGateView({
    super.key,
    required this.kycStatus,
    required this.onProceed,
    required this.onSubmitted,
    this.pendingMode = 'continue',
  });

  final KycStatus kycStatus;
  final VoidCallback onProceed;
  final VoidCallback onSubmitted;
  final String pendingMode;

  @override
  ConsumerState<KycGateView> createState() => _KycGateViewState();
}

class _KycGateViewState extends ConsumerState<KycGateView> {
  int _currentStep = 1;
  File? _rectoFile;
  File? _versoFile;
  File? _selfieFile;

  bool _isLoading = false;
  String? _error;

  final ImagePicker _picker = ImagePicker();

  Future<void> _pickImage(String slot, ImageSource source) async {
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
          if (slot == 'recto') {
            _rectoFile = File(pickedFile.path);
          } else if (slot == 'verso') {
            _versoFile = File(pickedFile.path);
          } else if (slot == 'selfie') {
            _selfieFile = File(pickedFile.path);
          }
        });
      }
    } catch (e) {
      setState(() => _error = 'Erreur lors de la capture : $e');
    }
  }

  void _showImageSourceActionSheet(BuildContext context, String slot) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        bool isPopping = false;
        return BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
          child: Container(
            decoration: BoxDecoration(
              color: Colors.black.withOpacity(0.6),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
              border: Border(
                top: BorderSide(color: Colors.white.withOpacity(0.15), width: 1.5),
              ),
            ),
            child: SafeArea(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const SizedBox(height: DSSpacing.sm),
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.white.withOpacity(0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: DSSpacing.md),
                  ListTile(
                    leading: const Icon(Icons.camera_alt_rounded, color: kEmerald),
                    title: Text('Prendre une photo',
                        style: DSTypography.bodyMedium.copyWith(color: Colors.white, fontWeight: FontWeight.w600)),
                    onTap: () {
                      if (isPopping) return;
                      isPopping = true;
                      Navigator.pop(sheetContext);
                      _pickImage(slot, ImageSource.camera);
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
                      _pickImage(slot, ImageSource.gallery);
                    },
                  ),
                  const SizedBox(height: DSSpacing.sm),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Future<String> _uploadToCloudinary(
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
      return response.data['secure_url'] as String;
    } else {
      throw Exception('Erreur de chargement Cloudinary: ${response.statusMessage}');
    }
  }

  Future<void> _submit() async {
    if (_rectoFile == null || _versoFile == null || _selfieFile == null) {
      setState(() => _error = 'Tous les documents (Recto, Verso, Selfie) sont requis.');
      return;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final getSignature = ref.read(getKycUploadSignatureProvider);
      final submitKyc = ref.read(submitKycProvider);

      final sigResult = await getSignature();

      await sigResult.fold(
        (failure) async {
          setState(() => _error = failure.message);
        },
        (sig) async {
          final frontUrl = await _uploadToCloudinary(
              _rectoFile!, sig.apiKey, sig.timestamp, sig.signature, sig.folder, sig.cloudName);
          final backUrl = await _uploadToCloudinary(
              _versoFile!, sig.apiKey, sig.timestamp, sig.signature, sig.folder, sig.cloudName);
          final selfieUrl = await _uploadToCloudinary(
              _selfieFile!, sig.apiKey, sig.timestamp, sig.signature, sig.folder, sig.cloudName);

          final submitResult = await submitKyc(SubmitKycParams(
            documentFrontUrl: frontUrl,
            documentBackUrl: backUrl,
            selfieUrl: selfieUrl,
          ));

          submitResult.fold(
            (failure) => setState(() => _error = failure.message),
            (user) {
              widget.onSubmitted();
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

  Widget _buildStepIndicator() {
    return Row(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        _buildStepBadge(1, 'Documents', _currentStep >= 1),
        Container(
          width: 32,
          height: 2,
          margin: const EdgeInsets.symmetric(horizontal: 4),
          decoration: BoxDecoration(
            color: _currentStep > 1 ? kEmerald : Colors.white.withOpacity(0.12),
            borderRadius: BorderRadius.circular(1),
          ),
        ),
        _buildStepBadge(2, 'Selfie', _currentStep == 2),
      ],
    );
  }

  Widget _buildStepBadge(int number, String label, bool active) {
    return Row(
      children: [
        Container(
          width: 26,
          height: 26,
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            color: active ? kEmerald : Colors.white.withOpacity(0.06),
            border: Border.all(color: active ? kEmerald : Colors.white.withOpacity(0.15)),
          ),
          alignment: Alignment.center,
          child: Text(
            number.toString(),
            style: DSTypography.bodySmall.copyWith(
              color: active ? Colors.black : DSColors.darkTextSecondary,
              fontWeight: FontWeight.w800,
            ),
          ),
        ),
        const SizedBox(width: DSSpacing.xs),
        Text(
          label,
          style: DSTypography.labelSmall.copyWith(
            color: active ? Colors.white : DSColors.darkTextTertiary,
            fontWeight: active ? FontWeight.w800 : FontWeight.w500,
          ),
        ),
      ],
    );
  }

  Widget _buildDocumentSlot(String label, File? file, String slot) {
    final bool filled = file != null;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label.toUpperCase(),
          style: DSTypography.labelSmall.copyWith(
            color: DSColors.darkTextTertiary,
            fontWeight: FontWeight.w800,
            letterSpacing: 0.8,
          ),
        ),
        const SizedBox(height: DSSpacing.xs),
        InkWell(
          onTap: () => _showImageSourceActionSheet(context, slot),
          borderRadius: BorderRadius.circular(PremiumRadius.card),
          child: PremiumGlassCard(
            radius: PremiumRadius.card,
            blur: 10,
            accent: filled,
            padding: EdgeInsets.zero,
            child: SizedBox(
              height: 140,
              child: filled
                  ? Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(PremiumRadius.card),
                          child: Image.file(
                            file,
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
                              const Icon(Icons.check_circle_rounded, color: kEmerald, size: 36),
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
                          EmeraldIconChip(icon: Icons.add_a_photo_rounded, size: 40, iconSize: 20, glow: false),
                          const SizedBox(height: DSSpacing.xs),
                          Text(
                            'Prendre ou choisir une photo',
                            style: DSTypography.bodySmall.copyWith(
                              color: DSColors.darkTextSecondary,
                              fontWeight: FontWeight.w500,
                            ),
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

  Widget _buildPendingView() {
    return PremiumGlassCard(
      blur: 10,
      radius: PremiumRadius.card,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          const StatusIconBadge(icon: Icons.access_time_rounded, color: Colors.amber),
          const SizedBox(height: DSSpacing.md),
          Text(
            'Documents envoyés !',
            style: DSTypography.h5.copyWith(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: -0.3),
          ),
          const SizedBox(height: DSSpacing.xs),
          Text(
            'Vos documents sont en cours d\'examen. La validation prend généralement entre 24h et 48h.',
            style: DSTypography.bodyMedium.copyWith(color: DSColors.darkTextSecondary, height: 1.4),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: DSSpacing.lg),
          if (widget.pendingMode == 'continue') ...[
            PrimaryButton(
              label: 'Continuer',
              fullWidth: true,
              onPressed: widget.onProceed,
              icon: Icons.arrow_forward_rounded,
              iconPosition: IconPosition.right,
            ),
            const SizedBox(height: DSSpacing.sm),
            Text(
              'L\'annonce ne sera visible qu\'après validation.',
              style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
              textAlign: TextAlign.center,
            ),
          ] else ...[
            Text(
              'Vous pourrez réserver dès que la vérification sera validée.',
              style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextTertiary),
              textAlign: TextAlign.center,
            ),
          ],
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    if (widget.kycStatus == KycStatus.pending) {
      return _buildPendingView();
    }

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        _buildStepIndicator(),
        const SizedBox(height: DSSpacing.lg),
        if (_currentStep == 1) ...[
          Text(
            'Pièce d\'identité',
            style: DSTypography.h6.copyWith(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: -0.3),
          ),
          const SizedBox(height: DSSpacing.xs),
          Text(
            'Veuillez photographier le recto et le verso de votre carte d\'identité nationale ou passeport.',
            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary, height: 1.4),
          ),
          const SizedBox(height: DSSpacing.md),
          _buildDocumentSlot('Recto du document', _rectoFile, 'recto'),
          const SizedBox(height: DSSpacing.md),
          _buildDocumentSlot('Verso du document', _versoFile, 'verso'),
          if (_error != null) ...[
            const SizedBox(height: DSSpacing.md),
            InlineErrorBanner(message: _error!),
          ],
          const SizedBox(height: DSSpacing.lg),
          PrimaryButton(
            label: 'Continuer vers le selfie',
            fullWidth: true,
            isDisabled: _rectoFile == null || _versoFile == null,
            onPressed: () => setState(() => _currentStep = 2),
            icon: Icons.arrow_forward_rounded,
            iconPosition: IconPosition.right,
          ),
        ] else ...[
          Text(
            'Selfie de vérification',
            style: DSTypography.h6.copyWith(color: Colors.white, fontWeight: FontWeight.w800, letterSpacing: -0.3),
          ),
          const SizedBox(height: DSSpacing.xs),
          Text(
            'Prenez un selfie en tenant votre visage bien visible et éclairé pour finaliser la vérification.',
            style: DSTypography.bodySmall.copyWith(color: DSColors.darkTextSecondary, height: 1.4),
          ),
          const SizedBox(height: DSSpacing.md),
          Center(
            child: InkWell(
              onTap: () => _showImageSourceActionSheet(context, 'selfie'),
              borderRadius: BorderRadius.circular(100),
              child: ClipOval(
                child: BackdropFilter(
                  filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
                  child: Container(
                    width: 180,
                    height: 180,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _selfieFile != null
                          ? null
                          : Colors.white.withOpacity(0.08),
                      border: Border.all(
                        color: _selfieFile != null ? kEmerald : Colors.white.withOpacity(0.2),
                        width: _selfieFile != null ? 2.5 : 1.5,
                      ),
                    ),
                    child: _selfieFile != null
                        ? Stack(
                            children: [
                              ClipOval(
                                child: Image.file(
                                  _selfieFile!,
                                  width: double.infinity,
                                  height: double.infinity,
                                  fit: BoxFit.cover,
                                ),
                              ),
                              Container(
                                decoration: const BoxDecoration(shape: BoxShape.circle, color: Colors.black38),
                              ),
                              const Center(
                                child: Icon(Icons.check_circle_rounded, color: kEmerald, size: 40),
                              ),
                            ],
                          )
                        : Center(
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                EmeraldIconChip(
                                  icon: Icons.face_retouching_natural_rounded,
                                  size: 44,
                                  iconSize: 22,
                                  glow: false,
                                ),
                                const SizedBox(height: DSSpacing.xs),
                                Text(
                                  'Prendre un selfie',
                                  style: DSTypography.labelSmall.copyWith(
                                    color: DSColors.darkTextSecondary,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            ),
                          ),
                  ),
                ),
              ),
            ),
          ),
          if (_error != null) ...[
            const SizedBox(height: DSSpacing.md),
            InlineErrorBanner(message: _error!),
          ],
          const SizedBox(height: DSSpacing.lg),
          Row(
            children: [
              Expanded(
                child: SecondaryButton(
                  label: 'Retour',
                  onPressed: () => setState(() => _currentStep = 1),
                ),
              ),
              const SizedBox(width: DSSpacing.md),
              Expanded(
                child: PrimaryButton(
                  label: 'Soumettre',
                  isLoading: _isLoading,
                  isDisabled: _selfieFile == null,
                  onPressed: _submit,
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}