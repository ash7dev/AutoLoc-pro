import { Controller, Get, Patch, Body, Param, UseGuards, Req } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { DisputesService } from './disputes.service';
import { ResolveDisputeUseCase, ResolveDisputeInput } from '../../domain/reservation/use-cases/resolve-dispute.use-case';

@Controller('admin/disputes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class DisputesController {
  constructor(
    private readonly disputesService: DisputesService,
    private readonly resolveDisputeUseCase: ResolveDisputeUseCase,
  ) {}

  /**
   * GET /admin/disputes
   * Liste tous les litiges pour le tableau de bord admin.
   */
  @Get()
  list() {
    return this.disputesService.adminList();
  }

  /**
   * GET /admin/disputes/:id
   * Obtenir le détail d'un litige.
   */
  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.disputesService.adminDetail(id);
  }

  /**
   * PATCH /admin/disputes/:id/resolve
   * Arbitre le litige (Trancher pour le locataire ou le propritaire).
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
