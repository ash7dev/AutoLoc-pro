import React from 'react';
import { TenantProfileSkeleton } from '../../tenant/components/profile/TenantProfileSkeleton';

export const OwnerProfileSkeleton: React.FC = () => {
  return <TenantProfileSkeleton isOwnerMode={true} />;
};
