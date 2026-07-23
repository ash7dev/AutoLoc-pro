import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../../core/network/api_client.dart';
import '../../../../../shared/presentation/base/view_effect.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../data/datasources/wallet_remote_datasource.dart';
import '../../data/repositories/wallet_repository_impl.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/repositories/wallet_repository.dart';
import '../../domain/usecases/get_penalties.dart';
import '../../domain/usecases/get_wallet_info.dart';
import '../../domain/usecases/request_withdrawal.dart';
import '../viewmodels/wallet_viewmodel.dart';

// ============================================================================
// DATA LAYER PROVIDERS
// ============================================================================

/// Provider pour le RemoteDataSource du Wallet
final walletRemoteDataSourceProvider = Provider<WalletRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return WalletRemoteDataSourceImpl(dio);
});

/// Provider pour le Repository du Wallet
final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  final remoteDataSource = ref.watch(walletRemoteDataSourceProvider);
  return WalletRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

// ============================================================================
// DOMAIN LAYER PROVIDERS
// ============================================================================

/// Provider pour le UseCase GetWalletInfo
final getWalletInfoProvider = Provider<GetWalletInfo>((ref) {
  final repository = ref.watch(walletRepositoryProvider);
  return GetWalletInfo(repository);
});

/// Provider pour le UseCase GetPenalties
final getPenaltiesProvider = Provider<GetPenalties>((ref) {
  final repository = ref.watch(walletRepositoryProvider);
  return GetPenalties(repository);
});

/// Provider pour le UseCase RequestWithdrawal
final requestWithdrawalProvider = Provider<RequestWithdrawal>((ref) {
  final repository = ref.watch(walletRepositoryProvider);
  return RequestWithdrawal(repository);
});

// ============================================================================
// PRESENTATION LAYER PROVIDERS
// ============================================================================

/// Provider pour le ViewModel du Wallet
final walletViewModelProvider =
    StateNotifierProvider.autoDispose<WalletViewModel, ViewState<Wallet>>((ref) {
  final getWalletInfo = ref.watch(getWalletInfoProvider);

  return WalletViewModel(
    getWalletInfo: getWalletInfo,
  );
});

/// Stream d'effects pour le Wallet
final walletEffectsProvider = StreamProvider.autoDispose<ViewEffect>((ref) {
  final viewModel = ref.watch(walletViewModelProvider.notifier);
  return viewModel.effects.cast<ViewEffect>();
});

/// Provider pour l'état actuel du Wallet
final walletStateProvider = Provider.autoDispose<ViewState<Wallet>>((ref) {
  return ref.watch(walletViewModelProvider);
});
