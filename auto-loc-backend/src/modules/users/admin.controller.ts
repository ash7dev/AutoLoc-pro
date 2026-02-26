import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RoleProfile } from '@prisma/client';
import { UsersService } from './users.service';

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /admin/stats
   * Métriques globales de la plateforme pour le tableau de bord admin.
   */
  @Get('stats')
  getStats() {
    return this.usersService.getAdminStats();
  }

  /**
   * GET /admin/activity
   * Derniers événements de la plateforme pour le fil d'activité.
   */
  @Get('activity')
  getActivity() {
    return this.usersService.getRecentActivity();
  }
}
