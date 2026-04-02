import { Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { ReservationsService } from './reservations.service';

@Controller('admin/reservations')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminReservationsController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get()
  async list(@Query('statut') statut?: string, @Query('page') page?: string) {
    return this.reservationsService.adminList(statut, page ? parseInt(page, 10) : 1);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.reservationsService.adminGetDetail(id);
  }

  @Patch(':id/force-cancel')
  async forceCancel(@Param('id') id: string) {
    return this.reservationsService.adminForceCancel(id);
  }

  @Patch(':id/force-complete')
  async forceComplete(@Param('id') id: string) {
    return this.reservationsService.adminForceComplete(id);
  }
}
