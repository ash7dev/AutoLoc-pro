import 'package:flutter/material.dart';

import '../tokens/ds_colors.dart';
import '../tokens/ds_typography.dart';
import '../tokens/ds_spacing.dart';
import '../tokens/ds_radius.dart';
import '../../core/utils/extensions/datetime_x.dart';

/// Calendar Field
/// Champ pour sélectionner une date avec un calendrier
/// Utilisé pour les dates de réservation, etc.
class CalendarField extends StatefulWidget {
  const CalendarField({
    super.key,
    this.label,
    this.hint = 'Sélectionner une date',
    this.initialDate,
    this.firstDate,
    this.lastDate,
    this.onDateSelected,
    this.errorText,
    this.enabled = true,
    this.prefixIcon,
  });

  final String? label;
  final String hint;
  final DateTime? initialDate;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final ValueChanged<DateTime>? onDateSelected;
  final String? errorText;
  final bool enabled;
  final IconData? prefixIcon;

  @override
  State<CalendarField> createState() => _CalendarFieldState();
}

class _CalendarFieldState extends State<CalendarField> {
  DateTime? _selectedDate;

  @override
  void initState() {
    super.initState();
    _selectedDate = widget.initialDate;
  }

  Future<void> _selectDate(BuildContext context) async {
    if (!widget.enabled) return;

    final DateTime? picked = await showDatePicker(
      context: context,
      initialDate: _selectedDate ?? DateTime.now(),
      firstDate: widget.firstDate ?? DateTime.now(),
      lastDate: widget.lastDate ?? DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: DSColors.emerald600,
              onPrimary: Colors.white,
              surface: DSColors.darkSurfaceElevated,
              onSurface: DSColors.darkTextPrimary,
            ),
            dialogBackgroundColor: DSColors.darkSurfaceElevated,
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedDate) {
      setState(() {
        _selectedDate = picked;
      });
      widget.onDateSelected?.call(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool hasError = widget.errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: DSTypography.labelMedium.copyWith(
              color: hasError
                  ? DSColors.red600
                  : DSColors.darkTextSecondary,
            ),
          ),
          const SizedBox(height: DSSpacing.xs),
        ],
        InkWell(
          onTap: widget.enabled ? () => _selectDate(context) : null,
          borderRadius: DSRadius.borderRadiusInput,
          child: Container(
            padding: DSSpacing.inputPadding,
            decoration: BoxDecoration(
              borderRadius: DSRadius.borderRadiusInput,
              border: Border.all(
                color: hasError
                    ? DSColors.red600
                    : DSColors.darkBorderGlass,
                width: 1,
              ),
              color: widget.enabled
                  ? DSColors.darkSurfaceGlass
                  : DSColors.darkSurfaceGlass.withOpacity(0.5),
            ),
            child: Row(
              children: [
                Icon(
                  widget.prefixIcon ?? Icons.calendar_today,
                  size: 20,
                  color: widget.enabled
                      ? DSColors.darkTextSecondary
                      : DSColors.darkTextDisabled,
                ),
                const SizedBox(width: DSSpacing.sm),
                Expanded(
                  child: Text(
                    _selectedDate != null
                        ? _selectedDate!.formatDate
                        : widget.hint,
                    style: DSTypography.bodyMedium.copyWith(
                      color: _selectedDate != null
                          ? (widget.enabled
                              ? DSColors.darkTextPrimary
                              : DSColors.darkTextDisabled)
                          : DSColors.darkTextTertiary,
                    ),
                  ),
                ),
                if (_selectedDate != null && widget.enabled)
                  IconButton(
                    icon: const Icon(
                      Icons.close,
                      size: 18,
                    ),
                    color: DSColors.darkTextSecondary,
                    onPressed: () {
                      setState(() {
                        _selectedDate = null;
                      });
                    },
                    padding: EdgeInsets.zero,
                    constraints: const BoxConstraints(
                      minWidth: 32,
                      minHeight: 32,
                    ),
                  ),
              ],
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: DSSpacing.xs),
          Row(
            children: [
              const Icon(
                Icons.error_outline,
                size: 14,
                color: DSColors.red600,
              ),
              const SizedBox(width: DSSpacing.xxs),
              Expanded(
                child: Text(
                  widget.errorText!,
                  style: DSTypography.caption.copyWith(
                    color: DSColors.red600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}

/// Date Range Field
/// Champ pour sélectionner une plage de dates
class DateRangeField extends StatefulWidget {
  const DateRangeField({
    super.key,
    this.label,
    this.startHint = 'Date de début',
    this.endHint = 'Date de fin',
    this.initialStartDate,
    this.initialEndDate,
    this.firstDate,
    this.lastDate,
    this.onDatesSelected,
    this.errorText,
    this.enabled = true,
  });

  final String? label;
  final String startHint;
  final String endHint;
  final DateTime? initialStartDate;
  final DateTime? initialEndDate;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final ValueChanged<DateTimeRange>? onDatesSelected;
  final String? errorText;
  final bool enabled;

  @override
  State<DateRangeField> createState() => _DateRangeFieldState();
}

class _DateRangeFieldState extends State<DateRangeField> {
  DateTimeRange? _selectedRange;

  @override
  void initState() {
    super.initState();
    if (widget.initialStartDate != null && widget.initialEndDate != null) {
      _selectedRange = DateTimeRange(
        start: widget.initialStartDate!,
        end: widget.initialEndDate!,
      );
    }
  }

  Future<void> _selectDateRange(BuildContext context) async {
    if (!widget.enabled) return;

    final DateTimeRange? picked = await showDateRangePicker(
      context: context,
      initialDateRange: _selectedRange,
      firstDate: widget.firstDate ?? DateTime.now(),
      lastDate: widget.lastDate ?? DateTime.now().add(const Duration(days: 365)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.dark(
              primary: DSColors.emerald600,
              onPrimary: Colors.white,
              surface: DSColors.darkSurfaceElevated,
              onSurface: DSColors.darkTextPrimary,
            ),
            dialogBackgroundColor: DSColors.darkSurfaceElevated,
          ),
          child: child!,
        );
      },
    );

    if (picked != null && picked != _selectedRange) {
      setState(() {
        _selectedRange = picked;
      });
      widget.onDatesSelected?.call(picked);
    }
  }

  @override
  Widget build(BuildContext context) {
    final bool hasError = widget.errorText != null;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label != null) ...[
          Text(
            widget.label!,
            style: DSTypography.labelMedium.copyWith(
              color: hasError
                  ? DSColors.red600
                  : DSColors.darkTextSecondary,
            ),
          ),
          const SizedBox(height: DSSpacing.xs),
        ],
        InkWell(
          onTap: widget.enabled ? () => _selectDateRange(context) : null,
          borderRadius: DSRadius.borderRadiusInput,
          child: Container(
            padding: DSSpacing.inputPadding,
            decoration: BoxDecoration(
              borderRadius: DSRadius.borderRadiusInput,
              border: Border.all(
                color: hasError
                    ? DSColors.red600
                    : DSColors.darkBorderGlass,
                width: 1,
              ),
              color: widget.enabled
                  ? DSColors.darkSurfaceGlass
                  : DSColors.darkSurfaceGlass.withOpacity(0.5),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.date_range,
                  size: 20,
                  color: DSColors.darkTextSecondary,
                ),
                const SizedBox(width: DSSpacing.sm),
                Expanded(
                  child: Text(
                    _selectedRange != null
                        ? '${_selectedRange!.start.formatDate} - ${_selectedRange!.end.formatDate}'
                        : '${widget.startHint} - ${widget.endHint}',
                    style: DSTypography.bodyMedium.copyWith(
                      color: _selectedRange != null
                          ? DSColors.darkTextPrimary
                          : DSColors.darkTextTertiary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
        if (hasError) ...[
          const SizedBox(height: DSSpacing.xs),
          Row(
            children: [
              const Icon(
                Icons.error_outline,
                size: 14,
                color: DSColors.red600,
              ),
              const SizedBox(width: DSSpacing.xxs),
              Expanded(
                child: Text(
                  widget.errorText!,
                  style: DSTypography.caption.copyWith(
                    color: DSColors.red600,
                  ),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }
}
