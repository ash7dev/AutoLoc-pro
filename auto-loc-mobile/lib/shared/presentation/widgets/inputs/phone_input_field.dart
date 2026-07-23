import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// PhoneInputField
///
/// Champ de saisie pour numéro de téléphone avec indicatif pays.
class PhoneInputField extends StatefulWidget {
  final String label;
  final String initialValue;
  final ValueChanged<String> onChanged;
  final bool enabled;

  const PhoneInputField({
    super.key,
    required this.label,
    this.initialValue = '',
    required this.onChanged,
    this.enabled = true,
  });

  @override
  State<PhoneInputField> createState() => _PhoneInputFieldState();
}

class _PhoneInputFieldState extends State<PhoneInputField> {
  late TextEditingController _controller;
  String _countryCode = '+221'; // Sénégal par défaut

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initialValue);

    // Extraire l'indicatif si déjà présent
    if (widget.initialValue.startsWith('+')) {
      final parts = widget.initialValue.split(' ');
      if (parts.isNotEmpty) {
        _countryCode = parts[0];
        if (parts.length > 1) {
          _controller.text = parts.sublist(1).join(' ');
        }
      }
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onChanged(String value) {
    // Formater: +221 XX XXX XX XX
    final cleaned = value.replaceAll(RegExp(r'\D'), '');
    final formatted = _formatPhone(cleaned);
    _controller.value = TextEditingValue(
      text: formatted,
      selection: TextSelection.collapsed(offset: formatted.length),
    );

    // Retourner la valeur complète avec indicatif
    final fullNumber = '$_countryCode$cleaned';
    widget.onChanged(fullNumber);
  }

  String _formatPhone(String value) {
    if (value.isEmpty) return '';

    // Format Sénégal: XX XXX XX XX (9 chiffres)
    final buffer = StringBuffer();
    for (int i = 0; i < value.length && i < 9; i++) {
      if (i == 2 || i == 5 || i == 7) {
        buffer.write(' ');
      }
      buffer.write(value[i]);
    }
    return buffer.toString();
  }

  void _showCountrySelector() {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.6,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => Column(
          children: [
            Container(
              padding: const EdgeInsets.symmetric(vertical: 20),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(
                    width: 40,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey[300],
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Sélectionner un pays',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w700,
                      color: Color(0xFF0D0D0D),
                    ),
                  ),
                ],
              ),
            ),
            Expanded(
              child: ListView(
                controller: scrollController,
                children: [
                  _buildCountryOption('🇸🇳', 'Sénégal', '+221'),
                  _buildCountryOption('🇫🇷', 'France', '+33'),
                  _buildCountryOption('🇬🇧', 'Royaume-Uni', '+44'),
                  _buildCountryOption('🇺🇸', 'États-Unis', '+1'),
                  _buildCountryOption('🇨🇦', 'Canada', '+1'),
                  _buildCountryOption('🇨🇮', 'Côte d\'Ivoire', '+225'),
                  _buildCountryOption('🇲🇱', 'Mali', '+223'),
                  _buildCountryOption('🇧🇯', 'Bénin', '+229'),
                  _buildCountryOption('🇧🇫', 'Burkina Faso', '+226'),
                  _buildCountryOption('🇳🇪', 'Niger', '+227'),
                  _buildCountryOption('🇹🇬', 'Togo', '+228'),
                  _buildCountryOption('🇬🇳', 'Guinée', '+224'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCountryOption(String flag, String country, String code) {
    final isSelected = _countryCode == code;
    return InkWell(
      onTap: () {
        setState(() {
          _countryCode = code;
        });
        Navigator.pop(context);
        // Déclencher onChanged avec le nouveau code
        _onChanged(_controller.text);
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
        color: isSelected ? const Color(0xFFF0FDF4) : null,
        child: Row(
          children: [
            Text(
              flag,
              style: const TextStyle(fontSize: 24),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: Text(
                country,
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                  color: const Color(0xFF0D0D0D),
                ),
              ),
            ),
            Text(
              code,
              style: TextStyle(
                fontSize: 16,
                fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                color: isSelected ? const Color(0xFF10B981) : const Color(0xFF64748B),
              ),
            ),
            if (isSelected)
              const Padding(
                padding: EdgeInsets.only(left: 8),
                child: Icon(
                  Icons.check_circle,
                  color: Color(0xFF10B981),
                  size: 20,
                ),
              ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          widget.label,
          style: TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: isDark ? Colors.white : const Color(0xFF0D0D0D),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          decoration: BoxDecoration(
            border: Border.all(
              color: _controller.text.isNotEmpty
                  ? const Color(0xFF10B981)
                  : (isDark ? const Color(0xFF1E293B) : const Color(0xFFE2E8F0)),
              width: 1.5,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              // Country code selector
              InkWell(
                onTap: widget.enabled ? _showCountrySelector : null,
                child: Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                  decoration: BoxDecoration(
                    border: Border(
                      right: BorderSide(
                        color: isDark ? const Color(0xFF1E293B) : Colors.grey[300]!,
                      ),
                    ),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      const Text(
                        '🇸🇳',
                        style: TextStyle(fontSize: 24),
                      ),
                      const SizedBox(width: 8),
                      Text(
                        _countryCode,
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: isDark ? Colors.white : const Color(0xFF0D0D0D),
                        ),
                      ),
                      const SizedBox(width: 4),
                      Icon(
                        Icons.arrow_drop_down,
                        color: isDark ? Colors.grey[400] : Colors.grey[600],
                        size: 20,
                      ),
                    ],
                  ),
                ),
              ),

              // Phone input
              Expanded(
                child: TextField(
                  controller: _controller,
                  enabled: widget.enabled,
                  keyboardType: TextInputType.phone,
                  inputFormatters: [
                    FilteringTextInputFormatter.digitsOnly,
                    LengthLimitingTextInputFormatter(9),
                  ],
                  style: TextStyle(
                    fontSize: 16,
                    color: isDark ? Colors.white : const Color(0xFF0D0D0D),
                  ),
                  decoration: const InputDecoration(
                    hintText: '77 123 45 67',
                    hintStyle: TextStyle(
                      color: Color(0xFF94A3B8),
                    ),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(
                      horizontal: 16,
                      vertical: 16,
                    ),
                  ),
                  onChanged: _onChanged,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}
