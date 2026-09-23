import { Controller, Get, Patch, Body, Param, Query, UseGuards, Req } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { DisputesService } from './disputes.service';
import { ResolveDisputeUseCase, ResolveDisputeInput } from '../../domain/reservation/use-cases/resolve-dispute.use-case';
import { GetDisputesQueueDto } from './dto/get-disputes.dto';

@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class DisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly resolveDisputeUseCase: ResolveDisputeUseCase,
  ) {}

  /**
   * GET /admin/disputes/queue
   * High performance dispute moderation queue endpoint with SLA calculation and search.
   */
  @Get('queue')
  getQueue(@Query() dto: GetDisputesQueueDto) {
    return this.disputesService.adminList(dto);
  }

  /**
   * GET /admin/disputes
   * Liste les litiges pour le tableau de bord admin avec filtres, recherche et pagination.
   */
  @Get()
  list(@Query() dto: GetDisputesQueueDto) {
    return this.disputesService.adminList(dto);
  }

  /**
   * GET /admin/disputes/:id
   * Obtenir le détail complet d'un litige (photos check-in & check-out, profils, contrat).
   */
  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.disputesService.adminDetail(id);
  }

  /**
   * PATCH /admin/disputes/:id/resolve
   * Arbitre le litige (Trancher pour le locataire ou le propriétaire avec montant compensatoire optionnel).
   */
  @Patch(':id/resolve')
  resolve(
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: ResolveDisputeInput,
  ) {
    return this.resolveDisputeUseCase.execute(req.user, id, body);
  }
}
