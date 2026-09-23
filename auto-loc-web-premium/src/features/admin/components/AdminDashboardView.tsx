'use client';

import React from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminHeaderBar } from './AdminHeaderBar';
import { AdminExecutiveMetrics } from './AdminExecutiveMetrics';
import { AdminRevenueChart } from './AdminRevenueChart';
import { AdminOpsCommandCenter } from './AdminOpsCommandCenter';
import { AdminUserActivationFunnel } from './AdminUserActivationFunnel';
import { AdminSupplyPipeline } from './AdminSupplyPipeline';
import { AdminPaymentDistribution } from './AdminPaymentDistribution';
import { AlertCircle } from 'lucide-react';

export const AdminDashboardView: React.FC = () => {
  const {
    period,
    setPeriod,
    overview,
    trends,
    payments,
    fleetStats,
    conversionFunnel,
    opsCenter,
    usersFunnel,
    supplyPipeline,
    riskQuality,
    isLoadingInitial,
    isRefreshing,
    lastRefreshedAt,
    mutateAll,
  } = useAdminDashboard();

  return (
    <div className="space-y-6 w-full">
      {/* Header Bar with Time Period Selector & Live Status */}
      <AdminHeaderBar
        period={period}
        onPeriodChange={setPeriod}
        isRefreshing={isRefreshing}
        onRefresh={mutateAll}
        lastRefreshedAt={lastRefreshedAt}
      />

      {/* Tier 1: Executive KPI Cards (GMV, Commissions, Utilization %, Community) */}
      <AdminExecutiveMetrics data={overview} isLoading={isLoadingInitial} />

      {/* Tier 2: Real-time SLA Operational Command Center */}
      <AdminOpsCommandCenter data={opsCenter} isLoading={isLoadingInitial} />

      {/* Tier 3: Revenue Trends Chart & Mobile Money Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminRevenueChart data={trends} isLoading={isLoadingInitial} />
        </div>
        <div>
          <AdminPaymentDistribution data={payments} isLoading={isLoadingInitial} />
        </div>
      </div>

      {/* Tier 4: User Activation Funnel & Supply Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminUserActivationFunnel data={usersFunnel} isLoading={isLoadingInitial} />
        <AdminSupplyPipeline data={supplyPipeline} isLoading={isLoadingInitial} />
      </div>
    </div>
  );
};

export default AdminDashboardView;
