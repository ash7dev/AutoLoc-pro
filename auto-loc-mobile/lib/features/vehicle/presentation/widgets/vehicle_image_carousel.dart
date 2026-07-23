import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../../../../design_system/tokens/ds_colors.dart';
import '../../domain/entities/vehicle.dart';

/// **VehicleImageCarousel**
/// Galerie d'images coulissante (carrousel) pour la page de détails.
class VehicleImageCarousel extends StatefulWidget {
  const VehicleImageCarousel({
    super.key,
    required this.photos,
    this.photoPrincipale,
    required this.onBack,
  });

  final List<PhotoVehicule> photos;
  final String? photoPrincipale;
  final VoidCallback onBack;

  @override
  State<VehicleImageCarousel> createState() => _VehicleImageCarouselState();
}

class _VehicleImageCarouselState extends State<VehicleImageCarousel> {
  final PageController _pageController = PageController();
  int _currentImageIndex = 0;

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final images = widget.photos.isNotEmpty
        ? widget.photos.map((p) => p.url).toList()
        : [widget.photoPrincipale ?? ''];

    return Stack(
      children: [
        // Image PageView
        SizedBox(
          height: 300,
          child: PageView.builder(
            controller: _pageController,
            onPageChanged: (idx) => setState(() => _currentImageIndex = idx),
            itemCount: images.length,
            itemBuilder: (context, index) {
              final imgUrl = images[index];
              return imgUrl.isNotEmpty
                  ? CachedNetworkImage(
                      imageUrl: imgUrl,
                      fit: BoxFit.cover,
                      width: double.infinity,
                      placeholder: (context, url) => const Center(
                        child: CircularProgressIndicator(
                            color: DSColors.emerald500),
                      ),
                      errorWidget: (context, url, err) => Container(
                        color: Colors.grey.shade900,
                        alignment: Alignment.center,
                        child: const Icon(
                          Icons.directions_car_rounded,
                          size: 80,
                          color: Colors.white24,
                        ),
                      ),
                    )
                  : Container(
                      color: Colors.grey.shade900,
                      alignment: Alignment.center,
                      child: const Icon(
                        Icons.directions_car_rounded,
                        size: 80,
                        color: Colors.white24,
                      ),
                    );
            },
          ),
        ),

        // Bouton retour
        Positioned(
          top: 48,
          left: 16,
          child: ClipRRect(
            borderRadius: BorderRadius.circular(100),
            child: BackdropFilter(
              filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
              child: Container(
                color: Colors.black26,
                child: IconButton(
                  icon: const Icon(
                    Icons.arrow_back_ios_new_rounded,
                    color: Colors.white,
                    size: 18,
                  ),
                  onPressed: widget.onBack,
                ),
              ),
            ),
          ),
        ),

        // Dot indicators
        if (images.length > 1)
          Positioned(
            bottom: 16,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                images.length,
                (index) => AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  margin: const EdgeInsets.symmetric(horizontal: 4),
                  width: _currentImageIndex == index ? 24 : 8,
                  height: 8,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(4),
                    color: _currentImageIndex == index
                        ? DSColors.emerald500
                        : Colors.white24,
                  ),
                ),
              ),
            ),
          ),
      ],
    );
  }
}
