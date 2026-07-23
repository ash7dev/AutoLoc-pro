import '../../../../core/errors/failures.dart';
import '../../../../core/utils/result.dart';
import '../../domain/repositories/onboarding_repository.dart';
import '../datasources/onboarding_local_datasource.dart';

/// **OnboardingRepositoryImpl** - Implémentation du repository Onboarding
class OnboardingRepositoryImpl implements OnboardingRepository {
  OnboardingRepositoryImpl({
    required this.localDataSource,
  });

  final OnboardingLocalDataSource localDataSource;

  @override
  Future<Result<void>> markOnboardingComplete() async {
    try {
      await localDataSource.markOnboardingComplete();
      return success(null);
    } catch (e) {
      return failure(
        UnknownFailure(e.toString()),
      );
    }
  }
}
