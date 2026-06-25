import { Controller, Get, Query, UseGuards, Patch, Param, Body } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ReservationsService } from './reservations.service';

@Controller('admin/cancellations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminCancellationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  /**
   * Liste toutes les annulations (exclut les réservations EXPIREE)
   * Paramètres query:
   * - annuleePar: LOCATAIRE | PROPRIETAIRE | SYSTEM | ADMIN (optionnel)
   * - page: numéro de page (défaut: 1)
   */
  @Get()
  async listCancellations(
    @Query('annuleePar') annuleePar?: string,
    @Query('page') page?: string,
  ) {
    return this.reservationsService.adminGetCancellations(
      annuleePar,
      page ? parseInt(page, 10) : 1,
    );
  }
}
