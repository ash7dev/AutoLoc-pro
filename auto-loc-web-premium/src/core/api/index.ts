export * from './apiClient';
export * from './analyticsApi';
export * from './adminAnalyticsApi';
export * from './reservationsApi';
export * from './vehiclesApi';
export * from './walletApi';
export * from './reviewsApi';
export * from './userApi';
export * from './adminPayoutsApi';
export * from './adminBroadcastApi';

import { analyticsApi } from './analyticsApi';
import { reservationsApi } from './reservationsApi';
import { vehiclesApi } from './vehiclesApi';
import { walletApi } from './walletApi';
import { reviewsApi } from './reviewsApi';
import { userApi } from './userApi';

/**
 * Suite API unifiée du Dashboard Owner AutoLoc
 */
export const ownerDashboardApi = {
  analytics: analyticsApi,
  reservations: reservationsApi,
  vehicles: vehiclesApi,
  wallet: walletApi,
  reviews: reviewsApi,
  user: userApi,
};

export default ownerDashboardApi;

