'use client';

import React from 'react';
import { useUserStore } from '../store/useUserStore';
import { UserRole } from '../../types/user';
import { normalizeRole } from '../auth/roleUtils';
import { NeutralAppShell } from '../../shared/components/layout/NeutralAppShell';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackUrl?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isInitialized } = useUserStore();

  // 1. Tant que le store n'est pas complètement initialisé, afficher le Squelette Neutre (Zero-Flash)
  if (!isInitialized) {
    return <NeutralAppShell />;
  }

  // 2. Vérifier l'autorisation de rôle
  const currentRole = user ? normalizeRole(user.role) : null;
  const isAllowed = currentRole ? allowedRoles.includes(currentRole) : false;

  if (!isAllowed) {
    // Rendu neutre pendant que le middleware/router effectue la redirection
    return <NeutralAppShell />;
  }

  return <>{children}</>;
};
