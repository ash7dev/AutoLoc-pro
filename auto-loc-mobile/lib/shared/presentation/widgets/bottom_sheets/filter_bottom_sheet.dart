import 'package:flutter/material.dart';

const Color _emerald = Color(0xFF34D399);

/// FilterBottomSheet
///
/// Bottom sheet pour les filtres de recherche de véhicules.
class FilterBottomSheet extends StatefulWidget {
  const FilterBottomSheet({super.key});

  @override
  State<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends State<FilterBottomSheet> {
  RangeValues _priceRange = const RangeValues(5000, 50000);
  String? _selectedCategory;
  String? _selectedTransmission;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF1A1A1A),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40,
            height: 4,
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.2),
              borderRadius: BorderRadius.circular(2),
            ),
          ),

          // Header
          Padding(
            padding: const EdgeInsets.all(20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Filtres',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: Colors.white,
                  ),
                ),
                TextButton(
                  onPressed: () {
                    setState(() {
                      _priceRange = const RangeValues(5000, 50000);
                      _selectedCategory = null;
                      _selectedTransmission = null;
                    });
                  },
                  child: const Text(
                    'Réinitialiser',
                    style: TextStyle(
                      color: _emerald,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),

          // Contenu scrollable
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Prix
                  const Text(
                    'Prix par jour',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  RangeSlider(
                    values: _priceRange,
                    min: 0,
                    max: 100000,
                    divisions: 100,
                    activeColor: _emerald,
                    inactiveColor: Colors.white.withOpacity(0.2),
                    labels: RangeLabels(
                      '${_priceRange.start.round()} FCFA',
                      '${_priceRange.end.round()} FCFA',
                    ),
                    onChanged: (values) {
                      setState(() {
                        _priceRange = values;
                      });
                    },
                  ),
                  Text(
                    '${_priceRange.start.round()} - ${_priceRange.end.round()} FCFA',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.white.withOpacity(0.6),
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Catégorie
                  const Text(
                    'Catégorie',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ['Berline', 'SUV', '4x4', 'Citadine', 'Utilitaire']
                        .map((category) => _buildChip(
                              label: category,
                              isSelected: _selectedCategory == category,
                              onTap: () {
                                setState(() {
                                  _selectedCategory =
                                      _selectedCategory == category ? null : category;
                                });
                              },
                            ))
                        .toList(),
                  ),

                  const SizedBox(height: 24),

                  // Transmission
                  const Text(
                    'Transmission',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    runSpacing: 8,
                    children: ['Automatique', 'Manuelle']
                        .map((transmission) => _buildChip(
                              label: transmission,
                              isSelected: _selectedTransmission == transmission,
                              onTap: () {
                                setState(() {
                                  _selectedTransmission =
                                      _selectedTransmission == transmission
                                          ? null
                                          : transmission;
                                });
                              },
                            ))
                        .toList(),
                  ),

                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),

          // Bouton Appliquer
          Padding(
            padding: const EdgeInsets.all(20),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context, {
                    'priceRange': _priceRange,
                    'category': _selectedCategory,
                    'transmission': _selectedTransmission,
                  });
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: _emerald,
                  foregroundColor: Colors.black,
                  padding: const EdgeInsets.symmetric(vertical: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  elevation: 0,
                ),
                child: const Text(
                  'Appliquer les filtres',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildChip({
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
        decoration: BoxDecoration(
          color: isSelected
              ? _emerald.withOpacity(0.15)
              : Colors.white.withOpacity(0.05),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: isSelected ? _emerald : Colors.white.withOpacity(0.1),
            width: isSelected ? 1.5 : 1,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
            color: isSelected ? _emerald : Colors.white.withOpacity(0.7),
          ),
        ),
      ),
    );
  }
}
