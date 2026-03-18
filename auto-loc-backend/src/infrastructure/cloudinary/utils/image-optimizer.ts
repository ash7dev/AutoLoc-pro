export const VEHICLE_PHOTO_FOLDER = 'autoloc/vehicles';

// Transformations appliquées à la demande via l'URL Cloudinary (lazy).
// Ne pas passer en `eager` à l'upload — ça bloque la réponse le temps
// que Cloudinary génère toutes les variantes de façon synchrone.
export const VEHICLE_PHOTO_TRANSFORM = 'w_800,h_600,c_fill,f_webp,q_auto';

// Gardé pour rétrocompatibilité si besoin dans des scripts de migration.
export const VEHICLE_PHOTO_EAGER_TRANSFORMATION: never[] = [];
