import { SetMetadata } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';

export const ROLES_KEY = 'roles';

// Déclare les rôles autorisés pour une route.
export const Roles = (...roles: RoleProfile[]) =>
  SetMetadata(ROLES_KEY, roles);
