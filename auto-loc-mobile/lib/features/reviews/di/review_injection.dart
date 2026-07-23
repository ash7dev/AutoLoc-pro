import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../data/datasources/review_remote_datasource.dart';
import '../data/repositories/review_repository_impl.dart';
import '../domain/repositories/review_repository.dart';
import '../domain/usecases/create_review.dart';
import '../domain/usecases/get_user_reviews.dart';

/// Review Dependency Injection
///
/// Providers Riverpod pour la feature Avis.
/// Structure DI complète: DataSource → Repository → UseCases
final reviewRemoteDataSourceProvider = Provider<ReviewRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return ReviewRemoteDataSource(dio);
});

final reviewRepositoryProvider = Provider<ReviewRepository>((ref) {
  final remoteDataSource = ref.watch(reviewRemoteDataSourceProvider);
  return ReviewRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

final createReviewProvider = Provider<CreateReview>((ref) {
  final repository = ref.watch(reviewRepositoryProvider);
  return CreateReview(repository);
});

final getUserReviewsProvider = Provider<GetUserReviews>((ref) {
  final repository = ref.watch(reviewRepositoryProvider);
  return GetUserReviews(repository);
});
