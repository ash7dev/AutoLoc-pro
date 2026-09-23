'use client';

import React, { useState } from 'react';
import { useAdminDashboard } from '../hooks/useAdminDashboard';
import { AdminHeaderBar } from './AdminHeaderBar';
import { AdminExecutiveMetrics } from './AdminExecutiveMetrics';
import { AdminRevenueChart } from './AdminRevenueChart';
import { AdminOpsCommandCenter } from './AdminOpsCommandCenter';
import { AdminUserActivationFunnel } from './AdminUserActivationFunnel';
import { AdminSupplyPipeline } from './AdminSupplyPipeline';
import { AdminPaymentDistribution } from './AdminPaymentDistribution';
import { AdminGrowthInsights } from './AdminGrowthInsights';
import { AdminOpsDrawer, OpsDrawerData } from './AdminOpsDrawer';

export const AdminDashboardView: React.FC = () => {
  const {
    period,
    setPeriod,
    overview,
    trends,
    payments,
    opsCenter,
    usersFunnel,
    supplyPipeline,
    unmetDemand,
    cohorts,
    escrow,
    isLoadingInitial,
    isRefreshing,
    lastRefreshedAt,
    mutateAll,
  } = useAdminDashboard();

  const [selectedDrawerItem, setSelectedDrawerItem] = useState<OpsDrawerData | null>(null);

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
      <AdminOpsCommandCenter
        data={opsCenter}
        isLoading={isLoadingInitial}
        onSelectItem={(item) => setSelectedDrawerItem(item)}
      />

      {/* Tier 3: Growth Engine & Operational Insights (Unmet Demand, Cohorts, Escrow) */}
      <AdminGrowthInsights
        unmetDemand={unmetDemand}
        cohorts={cohorts}
        escrow={escrow}
        isLoading={isLoadingInitial}
      />

      {/* Tier 4: Revenue Trends Chart & Mobile Money Payment Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AdminRevenueChart data={trends} isLoading={isLoadingInitial} />
        </div>
        <div>
          <AdminPaymentDistribution data={payments} isLoading={isLoadingInitial} />
        </div>
      </div>

      {/* Tier 5: User Activation Funnel & Supply Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AdminUserActivationFunnel data={usersFunnel} isLoading={isLoadingInitial} />
        <AdminSupplyPipeline data={supplyPipeline} isLoading={isLoadingInitial} />
      </div>

      {/* Interactive Ops Action Drawer */}
      <AdminOpsDrawer
        isOpen={Boolean(selectedDrawerItem)}
        onClose={() => setSelectedDrawerItem(null)}
        data={selectedDrawerItem}
        onActionComplete={mutateAll}
      />
    </div>
  );
};

export default AdminDashboardView;
