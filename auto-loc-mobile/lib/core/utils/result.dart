import 'package:fpdart/fpdart.dart';

import '../errors/failures.dart';

/// Type Result pour la programmation fonctionnelle
/// Either<Failure, T> : Left = Erreur, Right = Succès
typedef Result<T> = Either<Failure, T>;

/// Extensions utiles pour Result
extension ResultExtensions<T> on Result<T> {
  /// Retourne la valeur ou lance une exception
  T getOrThrow() {
    return fold(
      (failure) => throw Exception(failure.message),
      (value) => value,
    );
  }

  /// Retourne la valeur ou une valeur par défaut (fonction)
  T getOrElse(T Function(Failure) defaultValue) {
    return fold(
      defaultValue,
      (value) => value,
    );
  }

  /// Retourne la valeur ou une valeur par défaut (valeur)
  T getOrElseValue(T defaultValue) {
    return getOrElse((_) => defaultValue);
  }

  /// Retourne la Failure ou null
  Failure? get failure => fold(
        (failure) => failure,
        (_) => null,
      );

  /// Retourne la valeur ou null
  T? get value => fold(
        (_) => null,
        (value) => value,
      );

  /// Vérifie si c'est un succès
  bool get isSuccess => isRight();

  /// Vérifie si c'est une erreur
  bool get isFailure => isLeft();

  /// Exécute une action si c'est un succès
  Result<T> onSuccess(void Function(T value) action) {
    return fold(
      (failure) => Left(failure),
      (value) {
        action(value);
        return Right(value);
      },
    );
  }

  /// Exécute une action si c'est une erreur
  Result<T> onFailure(void Function(Failure failure) action) {
    return fold(
      (failure) {
        action(failure);
        return Left(failure);
      },
      (value) => Right(value),
    );
  }

  /// Transforme la valeur de succès
  Result<R> mapValue<R>(R Function(T value) mapper) {
    return map(mapper);
  }

  /// Transforme la failure
  Result<T> mapFailure(Failure Function(Failure failure) mapper) {
    return fold(
      (failure) => Left(mapper(failure)),
      (value) => Right(value),
    );
  }

  /// Transforme le résultat en Future
  Future<Result<T>> toFuture() async {
    return this;
  }
}

/// Extensions pour Future<Result<T>>
extension FutureResultExtensions<T> on Future<Result<T>> {
  /// Attend le résultat et retourne la valeur ou lance une exception
  Future<T> getOrThrow() async {
    final result = await this;
    return result.getOrThrow();
  }

  /// Attend le résultat et retourne la valeur ou une valeur par défaut (fonction)
  Future<T> getOrElse(T Function(Failure) defaultValue) async {
    final result = await this;
    return result.getOrElse(defaultValue);
  }

  /// Attend le résultat et retourne la valeur ou une valeur par défaut (valeur)
  Future<T> getOrElseValue(T defaultValue) async {
    final result = await this;
    return result.getOrElseValue(defaultValue);
  }

  /// Exécute une action si c'est un succès
  Future<Result<T>> onSuccess(void Function(T value) action) async {
    final result = await this;
    return result.onSuccess(action);
  }

  /// Exécute une action si c'est une erreur
  Future<Result<T>> onFailure(void Function(Failure failure) action) async {
    final result = await this;
    return result.onFailure(action);
  }

  /// Transforme la valeur de succès
  Future<Result<R>> mapValue<R>(R Function(T value) mapper) async {
    final result = await this;
    return result.mapValue(mapper);
  }

  /// Transforme la failure
  Future<Result<T>> mapFailure(
    Failure Function(Failure failure) mapper,
  ) async {
    final result = await this;
    return result.mapFailure(mapper);
  }
}

/// Helper pour créer un Result de succès
Result<T> success<T>(T value) => Right(value);

/// Helper pour créer un Result d'erreur
Result<T> failure<T>(Failure failure) => Left(failure);

/// Helper pour créer un Future<Result> de succès
Future<Result<T>> asyncSuccess<T>(T value) async => Right(value);

/// Helper pour créer un Future<Result> d'erreur
Future<Result<T>> asyncFailure<T>(Failure failure) async => Left(failure);
