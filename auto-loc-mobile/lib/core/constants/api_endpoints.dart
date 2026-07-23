/// Endpoints de l'API AutoLoc - Synchronisé avec le backend NestJS
class ApiEndpoints {
  ApiEndpoints._();

  // =========================================================================
  // AUTH MODULE
  // =========================================================================

  // Public Auth
  static const String checkAvailability = '/auth/check-availability';
  static const String login = '/auth/login';
  static const String refreshToken = '/auth/refresh';
  static const String phoneLoginSendOtp = '/auth/phone-login/send-otp';
  static const String phoneLoginVerifyOtp = '/auth/phone-login/verify-otp';

  // Authenticated Auth
  static const String me = '/auth/me';
  static const String logout = '/auth/logout';
  static const String completeProfile = '/auth/complete-profile';
  static const String switchRole = '/auth/switch-role';
  static const String phoneSendOtp = '/auth/phone/send-otp';
  static const String phoneVerifyOtp = '/auth/phone/verify-otp';
  static const String phoneUpdate = '/auth/phone/update';

  // KYC
  static const String kycUploadSignature = '/auth/kyc/upload-signature';
  static const String kycSubmitLinks = '/auth/kyc/submit-links';

  // Permis de conduire
  static const String permisLink = '/auth/permis/link';

  // =========================================================================
  // USERS MODULE
  // =========================================================================

  // Profile
  static const String profile = '/users/me/profile';
  static const String updateProfile = '/users/me/profile';
  static const String uploadAvatar = '/users/me/avatar';
  static const String deleteAvatar = '/users/me/avatar';

  // Admin Users
  static const String adminUsers = '/admin/users';
  static String adminUserById(String id) => '/admin/users/$id';
  static String adminUserStatus(String id) => '/admin/users/$id/status';
  static String adminUserKycApprove(String id) => '/admin/users/$id/kyc/approve';
  static String adminUserKycReject(String id) => '/admin/users/$id/kyc/reject';

  // Admin Stats
  static const String adminStats = '/admin/stats';
  static const String adminActivity = '/admin/activity';
  static const String adminNotificationsCount = '/admin/notifications/count';

  // =========================================================================
  // VEHICLES MODULE
  // =========================================================================

  // Public Vehicle Search
  static const String vehiclesSearch = '/vehicles/search';
  static const String vehiclesFeed = '/vehicles/feed';
  static const String vehiclesFeedMobile = '/vehicles/feed/mobile';
  static String vehicleById(String id) => '/vehicles/$id';
  static String vehicleBlockedDates(String id) => '/vehicles/$id/blocked-dates';
  static String vehiclePricing(String id) => '/vehicles/$id/pricing';

  // Owner Vehicle Management
  static const String createVehicle = '/vehicles';
  static const String myVehicles = '/vehicles/me';
  static const String myVehiclesSummary = '/vehicles/me/summary';
  static String updateVehicle(String id) => '/vehicles/$id';
  static String deleteVehicle(String id) => '/vehicles/$id';
  static String purgeVehicle(String id) => '/vehicles/$id/purge';
  static const String vehicleUploadSignature = '/vehicles/upload-signature';
  static String vehicleReservations(String id) => '/vehicles/$id/reservations';

  // Vehicle Photos
  static String vehiclePhotos(String id) => '/vehicles/$id/photos';
  static String vehiclePhotoLink(String id) => '/vehicles/$id/photos/link';
  static String updateVehiclePhoto(String id, String photoId) => '/vehicles/$id/photos/$photoId';
  static String deleteVehiclePhoto(String id, String photoId) => '/vehicles/$id/photos/$photoId';

  // Vehicle Unavailability Calendar
  static String vehicleIndisponibilites(String id) => '/vehicles/$id/indisponibilites';
  static String deleteIndisponibilite(String vehicleId, String indispoId) =>
      '/vehicles/$vehicleId/indisponibilites/$indispoId';

  // Admin Vehicles
  static const String adminVehicles = '/admin/vehicles';
  static String adminVehicleById(String id) => '/admin/vehicles/$id';
  static String adminValidateVehicle(String id) => '/admin/vehicles/$id/validate';
  static String adminSuspendVehicle(String id) => '/admin/vehicles/$id/suspend';
  static String adminFeatureVehicle(String id) => '/admin/vehicles/$id/feature';

  // =========================================================================
  // RESERVATIONS MODULE
  // =========================================================================

  static const String reservations = '/reservations';

  // Tenant Reservations
  static const String createReservation = '/reservations';
  static const String tenantReservations = '/reservations/tenant';
  static String reservationById(String id) => '/reservations/$id';
  static String cancelReservation(String id) => '/reservations/$id/cancel';

  // Owner Reservations
  static const String ownerReservations = '/reservations/owner';
  static const String ownerReservationStats = '/reservations/owner/stats';
  static const String ownerReservationNotifications = '/reservations/owner/notifications';
  static String confirmReservation(String id) => '/reservations/$id/confirm';

  // Reservation Lifecycle
  static String confirmPayment(String id) => '/reservations/$id/confirm-payment';
  static String checkin(String id) => '/reservations/$id/checkin';
  static String refusCheckin(String id) => '/reservations/$id/refus-checkin';
  static String checkout(String id) => '/reservations/$id/checkout';

  // Reservation State of Property (État des lieux)
  static const String reservationPhotosUploadSignature = '/reservations/photos-etat/upload-signature';
  static String reservationPhotosLink(String id) => '/reservations/$id/photos-etat/link';

  // Reservation Documents
  static String reservationContrat(String id) => '/reservations/$id/contrat';
  static String reservationTenantDocs(String id) => '/reservations/$id/locataire-docs';

  // Special Cases
  static String createDispute(String id) => '/reservations/$id/dispute';
  static String signalNoShow(String id) => '/reservations/$id/signal-noshow';
  static String signalOverload(String id) => '/reservations/$id/signal-overload';

  // Admin Reservations
  static const String adminReservations = '/admin/reservations';
  static String adminReservationById(String id) => '/admin/reservations/$id';
  static String adminForceCancel(String id) => '/admin/reservations/$id/force-cancel';
  static String adminForceComplete(String id) => '/admin/reservations/$id/force-complete';

  // Admin Cancellations
  static const String adminCancellations = '/admin/cancellations';

  // =========================================================================
  // PAYMENTS & WEBHOOKS MODULE
  // =========================================================================

  // Webhooks (ces endpoints ne sont normalement pas appelés par le mobile)
  static const String webhookIntouch = '/payments/webhook/intouch';
  static const String webhookWave = '/payments/webhook/wave';
  static const String webhookOrangeMoney = '/payments/webhook/orange-money';

  // =========================================================================
  // WALLET MODULE
  // =========================================================================

  // Owner Wallet
  static const String walletMe = '/wallet/me';
  static const String walletPenalties = '/wallet/penalites';
  static const String withdraw = '/wallet/withdraw';

  // Admin Withdrawals
  static const String adminWithdrawals = '/admin/withdrawals';
  static String adminApproveWithdrawal(String id) => '/admin/withdrawals/$id/approve';
  static String adminRejectWithdrawal(String id) => '/admin/withdrawals/$id/reject';

  // Admin Refunds
  static const String adminRefunds = '/admin/refunds';
  static String adminProcessRefund(String id) => '/admin/refunds/$id/process';

  // Admin Penalties
  static const String adminPenalties = '/admin/penalties';
  static String adminCancelPenalty(String id) => '/admin/penalties/$id/cancel';

  // =========================================================================
  // DISPUTES MODULE
  // =========================================================================

  static const String adminDisputes = '/admin/disputes';
  static String adminDisputeById(String id) => '/admin/disputes/$id';
  static String adminResolveDispute(String id) => '/admin/disputes/$id/resolve';

  // =========================================================================
  // REVIEWS MODULE
  // =========================================================================

  static const String createReview = '/reviews';
  static String userReviews(String userId) => '/reviews/user/$userId';

  // =========================================================================
  // NOTIFICATIONS MODULE
  // =========================================================================

  static const String notificationSubscribe = '/notifications/subscribe';
  static const String notificationUnsubscribe = '/notifications/unsubscribe';
  static const String notificationTest = '/notifications/test';

  // =========================================================================
  // UPLOAD MODULE
  // =========================================================================

  static const String uploadVehiclePhoto = '/upload/vehicle-photo';

  // =========================================================================
  // HEALTH MODULE
  // =========================================================================

  static const String health = '/health';
}
