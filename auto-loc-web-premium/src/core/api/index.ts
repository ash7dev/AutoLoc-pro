export * from './apiClient';
export * from './analyticsApi';
export * from './reservationsApi';
export * from './vehiclesApi';
export * from './walletApi';
export * from './reviewsApi';

import { analyticsApi } from './analyticsApi';
import { reservationsApi } from './reservationsApi';
import { vehiclesApi } from './vehiclesApi';
import { walletApi } from './walletApi';
import { reviewsApi } from './reviewsApi';

/**
 * Suite API unifiée du Dashboard Owner AutoLoc
 */
export const ownerDashboardApi = {
  analytics: analyticsApi,
  reservations: reservationsApi,
  vehicles: vehiclesApi,
  wallet: walletApi,
  reviews: reviewsApi,
};

export default ownerDashboardApi;
