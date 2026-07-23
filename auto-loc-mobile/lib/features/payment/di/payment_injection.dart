import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/network/api_client.dart';
import '../data/datasources/payment_remote_datasource.dart';
import '../data/repositories/payment_repository_impl.dart';
import '../domain/repositories/payment_repository.dart';
import '../domain/usecases/check_payment_status.dart';
import '../domain/usecases/initiate_payment.dart';

/// Payment Dependency Injection
///
/// Providers Riverpod pour la feature Payment.
/// Structure DI complète: DataSource → Repository → UseCases
final paymentRemoteDataSourceProvider = Provider<PaymentRemoteDataSource>((ref) {
  final dio = ref.watch(dioProvider);
  return PaymentRemoteDataSource(dio);
});

final paymentRepositoryProvider = Provider<PaymentRepository>((ref) {
  final remoteDataSource = ref.watch(paymentRemoteDataSourceProvider);
  return PaymentRepositoryImpl(
    remoteDataSource: remoteDataSource,
  );
});

final initiatePaymentProvider = Provider<InitiatePayment>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return InitiatePayment(repository);
});

final checkPaymentStatusProvider = Provider<CheckPaymentStatus>((ref) {
  final repository = ref.watch(paymentRepositoryProvider);
  return CheckPaymentStatus(repository);
});
