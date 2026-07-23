import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import 'user_provider.dart';

/// Profile Button
///
/// Affiche l'avatar de l'utilisateur ou une icône par défaut
/// Navigate vers /profile au tap
///
/// **TODO:**
/// - Navigation vers /profile
class ProfileButton extends ConsumerWidget {
  const ProfileButton({super.key});

  static const Color _emerald = Color(0xFF34D399);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(currentUserProvider);
    final hasPhoto = user?.photoUrl != null;
    final photoUrl = user?.photoUrl;

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          // TODO: Navigate to profile
          // context.push('/profile');
        },
        borderRadius: BorderRadius.circular(12),
        splashColor: _emerald.withOpacity(0.12),
        highlightColor: _emerald.withOpacity(0.06),
        child: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.06),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color: hasPhoto
                  ? _emerald.withOpacity(0.35)
                  : Colors.white.withOpacity(0.10),
              width: 1,
            ),
          ),
          child: hasPhoto && photoUrl != null
              ? ClipRRect(
                  borderRadius: BorderRadius.circular(11),
                  child: Image.network(
                    photoUrl,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) => Center(
                      child: Icon(
                        Icons.person_outline_rounded,
                        color: Colors.white.withOpacity(0.85),
                        size: 20,
                      ),
                    ),
                  ),
                )
              : Center(
                  child: Icon(
                    Icons.person_outline_rounded,
                    color: Colors.white.withOpacity(0.85),
                    size: 20,
                  ),
                ),
        ),
      ),
    );
  }
}