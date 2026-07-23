import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../data/datasources/dispute_remote_datasource.dart';
import '../data/repositories/dispute_repository_impl.dart';
import '../domain/repositories/dispute_repository.dart';
import '../domain/usecases/create_dispute.dart';
import '../domain/usecases/get_dispute_detail.dart';
import '../domain/usecases/get_disputes.dart';
import '../domain/usecases/resolve_dispute.dart';

/// Dispute Dependency Injection
///
/// Providers Riverpod pour la feature Disputes.
/// Structure DI complète: DataSource → Repository → UseCases
final disputeRemoteDataSourceProvider = Provider<DisputeRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return DisputeRemoteDataSource(dio);
});

final disputeRepositoryProvider = Provider<DisputeRepository>((ref) {
  final remoteDataSource = ref.watch(disputeRemoteDataSourceProvider);
  return DisputeRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

final createDisputeProvider = Provider<CreateDispute>((ref) {
  final repository = ref.watch(disputeRepositoryProvider);
  return CreateDispute(repository);
});

final getDisputesProvider = Provider<GetDisputes>((ref) {
  final repository = ref.watch(disputeRepositoryProvider);
  return GetDisputes(repository);
});

final getDisputeDetailProvider = Provider<GetDisputeDetail>((ref) {
  final repository = ref.watch(disputeRepositoryProvider);
  return GetDisputeDetail(repository);
});

final resolveDisputeProvider = Provider<ResolveDispute>((ref) {
  final repository = ref.watch(disputeRepositoryProvider);
  return ResolveDispute(repository);
});
