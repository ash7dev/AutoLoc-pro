import 'dart:ui';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../currency/currency_provider.dart';
import 'filter_provider.dart';

/// Filter Bottom Sheet
///
/// Modal complet avec tous les filtres de recherche.
/// Design : glass noir véritable (blur + noir translucide), écriture
/// blanche, touches émeraude en couche (glow décoratif + accents des
/// éléments sélectionnés).
///
/// **Usage:**
/// ```dart
/// FilterButton(
///   onTap: () => showFilterBottomSheet(context),
/// )
/// ```
void showFilterBottomSheet(BuildContext context) {
  showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    barrierColor: Colors.black.withOpacity(0.6),
    builder: (context) => const FilterBottomSheet(),
  );
}

const Color _emerald = Color(0xFF34D399);
const Color _emeraldDeep = Color(0xFF16A34A);

class FilterBottomSheet extends ConsumerStatefulWidget {
  const FilterBottomSheet({super.key});

  @override
  ConsumerState<FilterBottomSheet> createState() => _FilterBottomSheetState();
}

class _FilterBottomSheetState extends ConsumerState<FilterBottomSheet> {
  late FilterState _localFilters;

  @override
  void initState() {
    super.initState();
    _localFilters = ref.read(filterProvider);
  }

  void _updateFilter(FilterState newState) {
    HapticFeedback.selectionClick();
    setState(() {
      _localFilters = newState;
    });
  }

  void _resetFilters() {
    HapticFeedback.mediumImpact();
    setState(() {
      _localFilters = const FilterState();
    });
  }

  void _applyFilters() {
    HapticFeedback.mediumImpact();
    ref.read(filterProvider.notifier).updateFilters(_localFilters);
    Navigator.pop(context);
  }

  @override
  Widget build(BuildContext context) {
    final hasActiveFilters = _localFilters.hasActiveFilters;

    return ClipRRect(
      borderRadius: const BorderRadius.vertical(top: Radius.circular(28)),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
        child: Container(
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.9,
          ),
          decoration: BoxDecoration(
            color: Colors.black.withOpacity(0.88),
            border: Border.all(color: Colors.white.withOpacity(0.06)),
          ),
          child: Stack(
            children: [
              // Glow émeraude décoratif — couche ambiante, purement esthétique
              Positioned(
                top: -60,
                left: -40,
                child: ImageFiltered(
                  imageFilter: ImageFilter.blur(sigmaX: 50, sigmaY: 50),
                  child: Container(
                    width: 180,
                    height: 180,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: _emerald.withOpacity(0.28),
                    ),
                  ),
                ),
              ),

              Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  // Header
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 16),
                    child: Column(
                      children: [
                        Container(
                          width: 36,
                          height: 4,
                          decoration: BoxDecoration(
                            color: Colors.white.withOpacity(0.22),
                            borderRadius: BorderRadius.circular(2),
                          ),
                        ),
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            const Text(
                              'Filtres',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 20,
                                fontWeight: FontWeight.w800,
                                letterSpacing: -0.3,
                              ),
                            ),
                            if (hasActiveFilters) ...[
                              const SizedBox(width: 10),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 9,
                                  vertical: 3,
                                ),
                                decoration: BoxDecoration(
                                  color: _emerald.withOpacity(0.14),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: _emerald.withOpacity(0.4),
                                  ),
                                ),
                                child: Text(
                                  'Actifs',
                                  style: TextStyle(
                                    color: _emerald,
                                    fontSize: 10,
                                    fontWeight: FontWeight.w700,
                                    letterSpacing: 0.3,
                                  ),
                                ),
                              ),
                            ],
                            const Spacer(),
                            Material(
                              color: Colors.white.withOpacity(0.06),
                              borderRadius: BorderRadius.circular(10),
                              child: InkWell(
                                onTap: () {
                                  HapticFeedback.selectionClick();
                                  Navigator.pop(context);
                                },
                                borderRadius: BorderRadius.circular(10),
                                child: Container(
                                  width: 36,
                                  height: 36,
                                  alignment: Alignment.center,
                                  child: Icon(
                                    Icons.close_rounded,
                                    color: Colors.white.withOpacity(0.75),
                                    size: 20,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                  Divider(color: Colors.white.withOpacity(0.07), height: 1),

                  // Contenu scrollable
                  Flexible(
                    child: SingleChildScrollView(
                      padding: const EdgeInsets.all(24),
                      child: _FilterContent(
                        filters: _localFilters,
                        onChange: _updateFilter,
                        onReset: _resetFilters,
                        hasActiveFilters: hasActiveFilters,
                      ),
                    ),
                  ),

                  // Footer sticky
                  Container(
                    padding: EdgeInsets.fromLTRB(
                      24,
                      16,
                      24,
                      MediaQuery.of(context).padding.bottom + 16,
                    ),
                    decoration: BoxDecoration(
                      border: Border(
                        top: BorderSide(color: Colors.white.withOpacity(0.07)),
                      ),
                    ),
                    child: SizedBox(
                      width: double.infinity,
                      height: 54,
                      child: DecoratedBox(
                        decoration: BoxDecoration(
                          borderRadius: BorderRadius.circular(14),
                          gradient: const LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [_emerald, _emeraldDeep],
                          ),
                          boxShadow: [
                            BoxShadow(
                              color: _emerald.withOpacity(0.35),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: Material(
                          color: Colors.transparent,
                          child: InkWell(
                            borderRadius: BorderRadius.circular(14),
                            onTap: _applyFilters,
                            child: const Center(
                              child: Text(
                                'Appliquer les filtres',
                                style: TextStyle(
                                  color: Colors.black,
                                  fontSize: 15,
                                  fontWeight: FontWeight.w800,
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Filter Content
class _FilterContent extends ConsumerWidget {
  const _FilterContent({
    required this.filters,
    required this.onChange,
    required this.onReset,
    required this.hasActiveFilters,
  });

  final FilterState filters;
  final Function(FilterState) onChange;
  final VoidCallback onReset;
  final bool hasActiveFilters;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final currency = ref.watch(currencyProvider);
    final currencyNotifier = ref.read(currencyProvider.notifier);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Dates
        const _SectionTitle('DATES'),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: _DateField(
                label: 'Début',
                value: filters.dateDebut,
                onChanged: (date) => onChange(filters.copyWith(dateDebut: date)),
                minDate: DateTime.now(),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: _DateField(
                label: 'Fin',
                value: filters.dateFin,
                onChanged: (date) => onChange(filters.copyWith(dateFin: date)),
                minDate: filters.dateDebut ?? DateTime.now(),
              ),
            ),
          ],
        ),

        const SizedBox(height: 24),

        // Zone
        const _SectionTitle('ZONE'),
        const SizedBox(height: 12),
        _ZoneDropdown(
          value: filters.zone,
          onChanged: (zone) => onChange(filters.copyWith(zone: zone)),
        ),

        const SizedBox(height: 24),

        // Type de véhicule
        const _SectionTitle('TYPE DE VÉHICULE'),
        const SizedBox(height: 12),
        _VehicleTypePills(
          selected: filters.type,
          onChanged: (type) => onChange(filters.copyWith(type: type)),
        ),

        const SizedBox(height: 24),

        // Budget
        _SectionTitle('BUDGET / JOUR (${currency.code})'),
        const SizedBox(height: 12),
        _BudgetRange(
          minBudget: filters.budgetMin,
          maxBudget: filters.budgetMax,
          onMinChanged: (min) => onChange(
            min == null
                ? filters.copyWith(clearBudgetMin: true)
                : filters.copyWith(budgetMin: min),
          ),
          onMaxChanged: (max) => onChange(
            max == null
                ? filters.copyWith(clearBudgetMax: true)
                : filters.copyWith(budgetMax: max),
          ),
          currency: currency,
          currencyNotifier: currencyNotifier,
        ),

        const SizedBox(height: 24),

        // Carburant
        const _SectionTitle('CARBURANT'),
        const SizedBox(height: 12),
        _FuelTypePills(
          selected: filters.fuel,
          onChanged: (fuel) => onChange(filters.copyWith(fuel: fuel)),
        ),

        const SizedBox(height: 24),

        // Transmission
        const _SectionTitle('TRANSMISSION'),
        const SizedBox(height: 12),
        _TransmissionPills(
          selected: filters.transmission,
          onChanged: (transmission) =>
              onChange(filters.copyWith(transmission: transmission)),
        ),

        const SizedBox(height: 24),

        // Nombre de places
        const _SectionTitle('NOMBRE DE PLACES MIN.'),
        const SizedBox(height: 12),
        _PlacesPills(
          selected: filters.places,
          onChanged: (places) => onChange(
            places == null
                ? filters.copyWith(clearPlaces: true)
                : filters.copyWith(places: places),
          ),
        ),

        const SizedBox(height: 24),

        // Note minimum
        const _SectionTitle('NOTE MINIMUM'),
        const SizedBox(height: 12),
        _RatingPills(
          selected: filters.noteMin,
          onChanged: (rating) => onChange(
            rating == null
                ? filters.copyWith(clearNoteMin: true)
                : filters.copyWith(noteMin: rating),
          ),
        ),

        const SizedBox(height: 24),

        // Équipements
        const _SectionTitle('ÉQUIPEMENTS'),
        const SizedBox(height: 12),
        _EquipmentGrid(
          selected: filters.equipements,
          onChanged: (equipments) =>
              onChange(filters.copyWith(equipements: equipments)),
        ),

        const SizedBox(height: 24),

        // Géolocalisation
        const _SectionTitle('GÉOLOCALISATION'),
        const SizedBox(height: 12),
        _NearMeButton(
          active: filters.nearMe,
          onChanged: (nearMe) => onChange(filters.copyWith(nearMe: nearMe)),
        ),

        if (hasActiveFilters) ...[
          const SizedBox(height: 24),
          _ResetButton(onReset: onReset),
        ],
      ],
    );
  }
}

// ─── Helper Widgets ──────────────────────────────────────────────────────────

class _SectionTitle extends StatelessWidget {
  const _SectionTitle(this.title);
  final String title;

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: TextStyle(
        color: Colors.white.withOpacity(0.45),
        fontSize: 11,
        fontWeight: FontWeight.w700,
        letterSpacing: 1.2,
      ),
    );
  }
}

class _DateField extends StatelessWidget {
  const _DateField({
    required this.label,
    required this.value,
    required this.onChanged,
    required this.minDate,
  });

  final String label;
  final DateTime? value;
  final Function(DateTime?) onChanged;
  final DateTime minDate;

  @override
  Widget build(BuildContext context) {
    final hasValue = value != null;
    final display = hasValue
        ? DateFormat('d MMM', 'fr_FR').format(value!)
        : 'Ajouter date';

    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () async {
          final picked = await showDatePicker(
            context: context,
            initialDate: value ?? minDate,
            firstDate: minDate,
            lastDate: DateTime.now().add(const Duration(days: 365)),
            locale: const Locale('fr', 'FR'),
            builder: (context, child) {
              return Theme(
                data: ThemeData.dark().copyWith(
                  colorScheme: const ColorScheme.dark(
                    primary: _emerald,
                    onPrimary: Colors.black,
                    surface: Color(0xFF141414),
                    onSurface: Colors.white,
                  ),
                ),
                child: child!,
              );
            },
          );
          if (picked != null) onChanged(picked);
        },
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: hasValue
                ? _emerald.withOpacity(0.14)
                : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: hasValue
                  ? _emerald.withOpacity(0.5)
                  : Colors.white.withOpacity(0.10),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    label.toUpperCase(),
                    style: TextStyle(
                      color: hasValue
                          ? _emerald.withOpacity(0.8)
                          : Colors.white.withOpacity(0.4),
                      fontSize: 9,
                      fontWeight: FontWeight.w700,
                      letterSpacing: 1.0,
                    ),
                  ),
                  const SizedBox(height: 2),
                  Text(
                    display,
                    style: TextStyle(
                      color: hasValue ? _emerald : Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                ],
              ),
              Icon(
                Icons.calendar_today_rounded,
                color: hasValue
                    ? _emerald.withOpacity(0.8)
                    : Colors.white.withOpacity(0.4),
                size: 16,
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _ZoneDropdown extends StatelessWidget {
  const _ZoneDropdown({
    required this.value,
    required this.onChanged,
  });

  final String value;
  final Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.10)),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<String>(
          value: value,
          isExpanded: true,
          dropdownColor: const Color(0xFF141414),
          borderRadius: BorderRadius.circular(14),
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          icon: Icon(
            Icons.keyboard_arrow_down_rounded,
            color: Colors.white.withOpacity(0.5),
          ),
          style: const TextStyle(
            color: Colors.white,
            fontSize: 14,
            fontWeight: FontWeight.w600,
          ),
          items: kZones
              .map(
                (zone) => DropdownMenuItem(
                  value: zone.value,
                  child: Text(zone.label, overflow: TextOverflow.ellipsis),
                ),
              )
              .toList(),
          onChanged: (newValue) {
            HapticFeedback.selectionClick();
            onChanged(newValue ?? '');
          },
        ),
      ),
    );
  }
}

class _VehicleTypePills extends StatelessWidget {
  const _VehicleTypePills({
    required this.selected,
    required this.onChanged,
  });

  final String selected;
  final Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: [
        _Pill(
          label: 'Tous',
          active: selected.isEmpty,
          onTap: () => onChanged(''),
        ),
        ...kVehicleTypes.map(
          (type) => _Pill(
            label: type.label,
            active: selected == type.value,
            onTap: () => onChanged(selected == type.value ? '' : type.value),
          ),
        ),
      ],
    );
  }
}

class _FuelTypePills extends StatelessWidget {
  const _FuelTypePills({
    required this.selected,
    required this.onChanged,
  });

  final String selected;
  final Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 8,
      runSpacing: 8,
      children: kFuelTypes
          .map(
            (fuel) => _Pill(
              label: fuel.label,
              active: selected == fuel.value,
              onTap: () => onChanged(selected == fuel.value ? '' : fuel.value),
            ),
          )
          .toList(),
    );
  }
}

class _TransmissionPills extends StatelessWidget {
  const _TransmissionPills({
    required this.selected,
    required this.onChanged,
  });

  final String selected;
  final Function(String) onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: kTransmissions
          .map(
            (trans) => Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: trans == kTransmissions.first ? 10 : 0,
                ),
                child: _Pill(
                  label: trans.label,
                  active: selected == trans.value,
                  onTap: () =>
                      onChanged(selected == trans.value ? '' : trans.value),
                  fullWidth: true,
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _PlacesPills extends StatelessWidget {
  const _PlacesPills({
    required this.selected,
    required this.onChanged,
  });

  final int? selected;
  final Function(int?) onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: kPlacesOptions
          .map(
            (places) => Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: places == kPlacesOptions.last ? 0 : 8,
                ),
                child: _Pill(
                  label: '$places+',
                  active: selected == places,
                  onTap: () => onChanged(selected == places ? null : places),
                  fullWidth: true,
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _RatingPills extends StatelessWidget {
  const _RatingPills({
    required this.selected,
    required this.onChanged,
  });

  final double? selected;
  final Function(double?) onChanged;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: kNoteOptions
          .map(
            (rating) => Expanded(
              child: Padding(
                padding: EdgeInsets.only(
                  right: rating == kNoteOptions.last ? 0 : 8,
                ),
                child: _Pill(
                  label: '$rating+',
                  icon: Icons.star_rounded,
                  active: selected == rating,
                  onTap: () => onChanged(selected == rating ? null : rating),
                  fullWidth: true,
                ),
              ),
            ),
          )
          .toList(),
    );
  }
}

class _EquipmentGrid extends StatelessWidget {
  const _EquipmentGrid({
    required this.selected,
    required this.onChanged,
  });

  final List<String> selected;
  final Function(List<String>) onChanged;

  @override
  Widget build(BuildContext context) {
    return GridView.count(
      crossAxisCount: 2,
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      mainAxisSpacing: 8,
      crossAxisSpacing: 8,
      childAspectRatio: 2.9,
      children: kEquipments
          .map(
            (eq) => _Pill(
              label: eq.label,
              active: selected.contains(eq.value),
              fullWidth: true,
              onTap: () {
                final newList = selected.contains(eq.value)
                    ? selected.where((e) => e != eq.value).toList()
                    : [...selected, eq.value];
                onChanged(newList);
              },
            ),
          )
          .toList(),
    );
  }
}

class _BudgetRange extends StatelessWidget {
  const _BudgetRange({
    required this.minBudget,
    required this.maxBudget,
    required this.onMinChanged,
    required this.onMaxChanged,
    required this.currency,
    required this.currencyNotifier,
  });

  final double? minBudget;
  final double? maxBudget;
  final Function(double?) onMinChanged;
  final Function(double?) onMaxChanged;
  final Currency currency;
  final CurrencyNotifier currencyNotifier;

  @override
  Widget build(BuildContext context) {
    // Budget toujours stocké en XOF en interne ; converti pour l'affichage.
    final displayMin = minBudget != null
        ? (currency.code == 'XOF'
            ? minBudget!.toInt().toString()
            : currencyNotifier.convert(minBudget!).toStringAsFixed(2))
        : '';
    final displayMax = maxBudget != null
        ? (currency.code == 'XOF'
            ? maxBudget!.toInt().toString()
            : currencyNotifier.convert(maxBudget!).toStringAsFixed(2))
        : '';

    return Column(
      children: [
        Row(
          children: [
            Expanded(
              child: _BudgetInput(
                key: ValueKey('min-$displayMin'),
                placeholder: 'Min',
                value: displayMin,
                onChanged: (value) {
                  if (value.isEmpty) {
                    onMinChanged(null);
                    return;
                  }
                  final parsed = double.tryParse(value);
                  if (parsed != null) {
                    final xofValue =
                        currency.code == 'XOF' ? parsed : parsed / currency.rate;
                    onMinChanged(xofValue);
                  }
                },
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 10),
              child: Text(
                '—',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.3),
                  fontSize: 14,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            Expanded(
              child: _BudgetInput(
                key: ValueKey('max-$displayMax'),
                placeholder: 'Max',
                value: displayMax,
                onChanged: (value) {
                  if (value.isEmpty) {
                    onMaxChanged(null);
                    return;
                  }
                  final parsed = double.tryParse(value);
                  if (parsed != null) {
                    final xofValue =
                        currency.code == 'XOF' ? parsed : parsed / currency.rate;
                    onMaxChanged(xofValue);
                  }
                },
              ),
            ),
          ],
        ),
        const SizedBox(height: 10),
        GridView.count(
          crossAxisCount: 2,
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          mainAxisSpacing: 8,
          crossAxisSpacing: 8,
          childAspectRatio: 2.9,
          children: kBudgetPresets
              .map(
                (preset) => _Pill(
                  label: '≤ ${currencyNotifier.format(preset.toDouble())}',
                  active: maxBudget == preset,
                  fullWidth: true,
                  onTap: () =>
                      onMaxChanged(maxBudget == preset ? null : preset.toDouble()),
                ),
              )
              .toList(),
        ),
      ],
    );
  }
}

class _BudgetInput extends StatefulWidget {
  const _BudgetInput({
    super.key,
    required this.placeholder,
    required this.value,
    required this.onChanged,
  });

  final String placeholder;
  final String value;
  final Function(String) onChanged;

  @override
  State<_BudgetInput> createState() => _BudgetInputState();
}

class _BudgetInputState extends State<_BudgetInput> {
  late final TextEditingController _controller =
      TextEditingController(text: widget.value);

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.05),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.white.withOpacity(0.10)),
      ),
      child: TextField(
        controller: _controller,
        keyboardType: TextInputType.number,
        textAlign: TextAlign.center,
        style: const TextStyle(
          color: Colors.white,
          fontSize: 14,
          fontWeight: FontWeight.w600,
        ),
        decoration: InputDecoration(
          hintText: widget.placeholder,
          hintStyle: TextStyle(
            color: Colors.white.withOpacity(0.35),
            fontSize: 14,
            fontWeight: FontWeight.w500,
          ),
          border: InputBorder.none,
          isDense: true,
          contentPadding: EdgeInsets.zero,
        ),
        onChanged: widget.onChanged,
      ),
    );
  }
}

class _NearMeButton extends StatelessWidget {
  const _NearMeButton({
    required this.active,
    required this.onChanged,
  });

  final bool active;
  final Function(bool) onChanged;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Material(
          color: Colors.transparent,
          child: InkWell(
            onTap: () => onChanged(!active),
            borderRadius: BorderRadius.circular(14),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 12),
              decoration: BoxDecoration(
                color: active
                    ? _emerald.withOpacity(0.14)
                    : Colors.white.withOpacity(0.05),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                  color: active
                      ? _emerald.withOpacity(0.5)
                      : Colors.white.withOpacity(0.10),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.location_on_rounded,
                    color: active ? _emerald : Colors.white.withOpacity(0.6),
                    size: 18,
                  ),
                  const SizedBox(width: 8),
                  Text(
                    active ? 'Autour de moi · Actif' : 'Autour de moi',
                    style: TextStyle(
                      color: active ? _emerald : Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
        if (active) ...[
          const SizedBox(height: 6),
          Text(
            'Recherche dans un rayon de 30 km',
            style: TextStyle(
              color: _emerald.withOpacity(0.65),
              fontSize: 11,
            ),
          ),
        ],
      ],
    );
  }
}

class _ResetButton extends StatelessWidget {
  const _ResetButton({required this.onReset});
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onReset,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 12),
          decoration: BoxDecoration(
            color: Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(color: Colors.white.withOpacity(0.10)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.refresh_rounded,
                color: Colors.white.withOpacity(0.6),
                size: 16,
              ),
              const SizedBox(width: 8),
              Text(
                'Réinitialiser',
                style: TextStyle(
                  color: Colors.white.withOpacity(0.7),
                  fontSize: 14,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Pill — glass par défaut, teinte émeraude quand sélectionné
/// (au lieu d'un aplat solide qui casse la cohérence "verre" du reste
/// de l'app).
class _Pill extends StatelessWidget {
  const _Pill({
    required this.label,
    required this.active,
    required this.onTap,
    this.icon,
    this.fullWidth = false,
  });

  final String label;
  final bool active;
  final VoidCallback onTap;
  final IconData? icon;
  final bool fullWidth;

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: () {
          HapticFeedback.selectionClick();
          onTap();
        },
        borderRadius: BorderRadius.circular(12),
        child: Container(
          width: fullWidth ? double.infinity : null,
          padding: const EdgeInsets.symmetric(horizontal: 13, vertical: 10),
          decoration: BoxDecoration(
            color: active
                ? _emerald.withOpacity(0.14)
                : Colors.white.withOpacity(0.05),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(
              color:
                  active ? _emerald.withOpacity(0.5) : Colors.white.withOpacity(0.10),
            ),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            mainAxisSize: MainAxisSize.min,
            children: [
              if (icon != null) ...[
                Icon(
                  icon,
                  color: active ? _emerald : Colors.white.withOpacity(0.5),
                  size: 13,
                ),
                const SizedBox(width: 4),
              ],
              Flexible(
                child: Text(
                  label,
                  style: TextStyle(
                    color: active ? _emerald : Colors.white,
                    fontSize: 13,
                    fontWeight: active ? FontWeight.w700 : FontWeight.w600,
                  ),
                  overflow: TextOverflow.ellipsis,
                  textAlign: TextAlign.center,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}