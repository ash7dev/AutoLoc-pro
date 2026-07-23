import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../../../core/navigation/routes.dart';
import 'notifications_provider.dart';

/// Notification Button avec badge
///
/// Affiche l'icône de notification avec un badge rouge
/// indiquant le nombre de notifications non lues
class NotificationButton extends ConsumerWidget {
  const NotificationButton({super.key});

  static const Color _emerald = Color(0xFF34D399);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final unreadCount = ref.watch(unreadNotificationsCountProvider);

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          context.push(Routes.notifications);
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
              color: Colors.white.withOpacity(0.10),
              width: 1,
            ),
          ),
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              Center(
                child: Icon(
                  Icons.notifications_outlined,
                  color: Colors.white.withOpacity(0.85),
                  size: 20,
                ),
              ),

              // Badge de compteur
              if (unreadCount > 0)
                Positioned(
                  top: -2,
                  right: -2,
                  child: Container(
                    constraints: const BoxConstraints(minWidth: 17, minHeight: 17),
                    padding: const EdgeInsets.symmetric(horizontal: 4),
                    decoration: BoxDecoration(
                      color: const Color(0xFFEF4444),
                      borderRadius: BorderRadius.circular(9),
                      border: Border.all(
                        color: const Color(0xFF0D0D0D),
                        width: 1.5,
                      ),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFFEF4444).withOpacity(0.5),
                          blurRadius: 6,
                          spreadRadius: 0,
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        unreadCount > 9 ? '9+' : '$unreadCount',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.w800,
                          height: 1.2,
                        ),
                      ),
                    ),
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}