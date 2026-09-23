import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
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

  /**
   * GET /admin/reservations/queue
   * High performance reservations queue with status counts, multi-field search and SLA calculations.
   */
  @Get('queue')
  async getQueue(
    @Query('statut') statut?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.reservationsService.adminGetQueue({
      statut,
      search,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get()
  async list(@Query('statut') statut?: string, @Query('page') page?: string) {
    return this.reservationsService.adminList(statut, page ? parseInt(page, 10) : 1);
  }

  @Get(':id')
  async getDetail(@Param('id') id: string) {
    return this.reservationsService.adminGetDetail(id);
  }

  @Patch(':id/force-confirm')
  async forceConfirm(@Param('id') id: string) {
    return this.reservationsService.adminForceConfirm(id);
  }

  @Patch(':id/force-cancel')
  async forceCancel(@Param('id') id: string, @Body('raison') raison?: string) {
    return this.reservationsService.adminForceCancel(id, raison);
  }

  @Patch(':id/force-complete')
  async forceComplete(@Param('id') id: string) {
    return this.reservationsService.adminForceComplete(id);
  }
}
