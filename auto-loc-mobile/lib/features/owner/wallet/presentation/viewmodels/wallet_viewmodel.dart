import '../../../../../shared/presentation/base/base_view_model.dart';
import '../../../../../shared/presentation/base/view_state.dart';
import '../../domain/entities/wallet.dart';
import '../../domain/usecases/get_wallet_info.dart';

/// ViewModel pour le Wallet
class WalletViewModel extends BaseViewModel<Wallet> {
  final GetWalletInfo _getWalletInfo;

  WalletViewModel({
    required GetWalletInfo getWalletInfo,
  }) : _getWalletInfo = getWalletInfo;

  @override
  Future<void> load() async {
    state = const ViewState.loading();

    final result = await _getWalletInfo();

    result.fold(
      (failure) {
        state = ViewState.failure(failure.displayMessage);
      },
      (wallet) {
        state = ViewState.success(wallet);
      },
    );
  }

  @override
  Future<void> refresh() async {
    final currentData = state.dataOrNull;
    if (currentData != null) {
      state = ViewState.refreshing(currentData);
    }

    final result = await _getWalletInfo();

    result.fold(
      (failure) {
        state = ViewState.failure(failure.displayMessage);
      },
      (wallet) {
        state = ViewState.success(wallet);
      },
    );
  }

  /// Getter pour accéder au wallet depuis l'état
  Wallet? get wallet => state.dataOrNull;
}
