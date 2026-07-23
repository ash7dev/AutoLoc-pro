import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_client.dart';
import '../data/datasources/user_remote_datasource.dart';
import '../data/repositories/user_repository_impl.dart';
import '../domain/repositories/user_repository.dart';
import '../domain/usecases/delete_avatar.dart';
import '../domain/usecases/get_kyc_upload_signature.dart';
import '../domain/usecases/get_profile.dart';
import '../domain/usecases/link_permis.dart';
import '../domain/usecases/submit_kyc.dart';
import '../domain/usecases/update_profile.dart';
import '../domain/usecases/upload_avatar.dart';

// =============================================================================
// DATA LAYER PROVIDERS
// =============================================================================

/// Provider pour le Remote DataSource
final userRemoteDataSourceProvider = Provider<UserRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return UserRemoteDataSource(dio);
});

/// Provider pour le Repository
final userRepositoryProvider = Provider<UserRepository>((ref) {
  final remoteDataSource = ref.watch(userRemoteDataSourceProvider);
  return UserRepositoryImpl(remoteDataSource: remoteDataSource);
});

final getProfileProvider = Provider<GetProfile>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return GetProfile(repository);
});

final updateProfileProvider = Provider<UpdateProfile>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return UpdateProfile(repository);
});

final uploadAvatarProvider = Provider<UploadAvatar>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return UploadAvatar(repository);
});

final deleteAvatarProvider = Provider<DeleteAvatar>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return DeleteAvatar(repository);
});

final getKycUploadSignatureProvider = Provider<GetKycUploadSignature>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return GetKycUploadSignature(repository);
});

final submitKycProvider = Provider<SubmitKyc>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return SubmitKyc(repository);
});

final linkPermisProvider = Provider<LinkPermis>((ref) {
  final repository = ref.watch(userRepositoryProvider);
  return LinkPermis(repository);
});
