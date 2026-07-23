import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/network/api_client.dart';
import '../data/datasources/wallet_remote_datasource.dart';
import '../data/repositories/wallet_repository_impl.dart';
import '../domain/repositories/wallet_repository.dart';
import '../domain/usecases/get_pending_penalties.dart';
import '../domain/usecases/get_transaction_history.dart';
import '../domain/usecases/get_wallet.dart';
import '../domain/usecases/get_withdrawal_history.dart';
import '../domain/usecases/request_withdrawal.dart';

final walletRemoteDataSourceProvider = Provider<WalletRemoteDataSource>((ref) {
  return WalletRemoteDataSourceImpl(ref.watch(dioProvider));
});

final walletRepositoryProvider = Provider<WalletRepository>((ref) {
  return WalletRepositoryImpl(ref.watch(walletRemoteDataSourceProvider));
});

final getWalletUseCaseProvider = Provider<GetWallet>((ref) => GetWallet(ref.watch(walletRepositoryProvider)));
final getPendingPenaltiesUseCaseProvider = Provider<GetPendingPenalties>((ref) => GetPendingPenalties(ref.watch(walletRepositoryProvider)));
final requestWithdrawalUseCaseProvider = Provider<RequestWithdrawal>((ref) => RequestWithdrawal(ref.watch(walletRepositoryProvider)));
final getTransactionHistoryUseCaseProvider = Provider<GetTransactionHistory>((ref) => GetTransactionHistory(ref.watch(walletRepositoryProvider)));
final getWithdrawalHistoryUseCaseProvider = Provider<GetWithdrawalHistory>((ref) => GetWithdrawalHistory(ref.watch(walletRepositoryProvider)));
