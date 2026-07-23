import 'package:flutter/material.dart';

class EquipmentItem {
  final String value;
  final String label;
  final IconData icon;

  const EquipmentItem({
    required this.value,
    required this.label,
    required this.icon,
  });
}

class EquipmentChipSelector extends StatelessWidget {
  final List<String> selected;
  final ValueChanged<String> onToggle;

  static const List<EquipmentItem> equipmentsList = [
    EquipmentItem(value: 'GPS', label: 'GPS', icon: Icons.navigation_outlined),
    EquipmentItem(value: 'CLIMATISATION', label: 'Climatisation', icon: Icons.ac_unit_outlined),
    EquipmentItem(value: 'BLUETOOTH', label: 'Bluetooth', icon: Icons.bluetooth_outlined),
    EquipmentItem(value: 'CAMERA_RECUL', label: 'Caméra de recul', icon: Icons.camera_alt_outlined),
    EquipmentItem(value: 'CAMERA_360', label: 'Caméra 360°', icon: Icons.photo_camera_front_outlined),
    EquipmentItem(value: 'SIEGE_ENFANT', label: 'Siège enfant', icon: Icons.child_care_outlined),
    EquipmentItem(value: 'SIEGE_CHAUFFANT', label: 'Siège chauffant', icon: Icons.whatshot_outlined),
    EquipmentItem(value: 'TOIT_OUVRANT', label: 'Toit ouvrant', icon: Icons.wb_sunny_outlined),
    EquipmentItem(value: 'RADAR_STATIONNEMENT', label: 'Radar stationnement', icon: Icons.sensors_outlined),
    EquipmentItem(value: 'REGULATEUR_VITESSE', label: 'Régulateur de vitesse', icon: Icons.speed_outlined),
    EquipmentItem(value: 'CARPLAY', label: 'CarPlay / Android Auto', icon: Icons.phone_android_outlined),
  ];

  const EquipmentChipSelector({
    super.key,
    required this.selected,
    required this.onToggle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 2,
            childAspectRatio: 2.8,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
          ),
          itemCount: equipmentsList.length,
          itemBuilder: (context, index) {
            final item = equipmentsList[index];
            final isSelected = selected.contains(item.value);

            return Material(
              color: Colors.transparent,
              child: InkWell(
                onTap: () => onToggle(item.value),
                borderRadius: BorderRadius.circular(16),
                child: Ink(
                  decoration: BoxDecoration(
                    color: isSelected
                        ? const Color(0xFF10B981).withOpacity(0.08)
                        : (isDark ? const Color(0xFF1E293B) : Colors.white),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                      color: isSelected
                          ? const Color(0xFF10B981)
                          : (isDark ? const Color(0xFF334155) : const Color(0xFFE2E8F0)),
                      width: isSelected ? 1.5 : 1,
                    ),
                  ),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 12.0),
                    child: Row(
                      children: [
                        Icon(
                          item.icon,
                          size: 20,
                          color: isSelected
                              ? const Color(0xFF10B981)
                              : (isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B)),
                        ),
                        const SizedBox(width: 10),
                        Expanded(
                          child: Text(
                            item.label,
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: isSelected ? FontWeight.w700 : FontWeight.w600,
                              color: isSelected
                                  ? const Color(0xFF10B981)
                                  : (isDark ? const Color(0xFFE2E8F0) : const Color(0xFF334155)),
                            ),
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        if (isSelected) ...[
                          const SizedBox(width: 4),
                          const Icon(
                            Icons.check_circle,
                            size: 16,
                            color: Color(0xFF10B981),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            );
          },
        ),
        if (selected.isNotEmpty) ...[
          const SizedBox(height: 12),
          Center(
            child: Text(
              '${selected.length} équipement${selected.length > 1 ? 's' : ''} sélectionné${selected.length > 1 ? 's' : ''}',
              style: const TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.bold,
                color: Color(0xFF10B981),
              ),
            ),
          ),
        ],
      ],
    );
  }
}
