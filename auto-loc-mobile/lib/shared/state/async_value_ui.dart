import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../core/utils/extensions/context_x.dart';

/// Extension pour gérer l'affichage des AsyncValue dans l'UI
/// Affiche automatiquement les erreurs dans des snackbars
extension AsyncValueUI on AsyncValue<void> {
  void showSnackbarOnError(BuildContext context) {
    if (!isLoading && hasError) {
      context.showError(
        error.toString(),
      );
    }
  }
}

/// Extension pour gérer les erreurs des AsyncValue avec message custom
extension AsyncValueUIWithMessage on AsyncValue {
  void showSnackbarOnError(
    BuildContext context, {
    String Function(Object error)? errorMessage,
  }) {
    if (!isLoading && hasError) {
      final message = errorMessage?.call(error!) ?? error.toString();
      context.showError(message);
    }
  }
}
