import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RoleProfile } from '@prisma/client';
import { VehiclesService } from './vehicles.service';
import { GetAdminVehiclesDto } from './dto/get-admin-vehicles.dto';
import { SuspendVehicleDto } from './dto/suspend-vehicle.dto';
import { FeatureVehicleDto } from './dto/feature-vehicle.dto';

@Controller('admin/vehicles')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminVehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  /**
   * GET /admin/vehicles?statut=EN_ATTENTE_VALIDATION
   * Liste tous les véhicules, filtrable par statut.
   */
  @Get()
  listVehicles(@Query() dto: GetAdminVehiclesDto) {
    return this.vehiclesService.adminListVehicles(dto.statut, dto.page ?? 1);
  }

  @Get(':id')
  getAdminVehicleDetail(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.adminGetVehicleDetail(id);
  }

  /**
   * PATCH /admin/vehicles/:id/validate
   * Valide un véhicule (statut → VERIFIE) et notifie le propriétaire.
   */
  @Patch(':id/validate')
  validateVehicle(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.validateVehicle(id);
  }

  /**
   * PATCH /admin/vehicles/:id/suspend
   * Suspend un véhicule (statut → SUSPENDU) avec raison obligatoire et notifie.
   */
  @Patch(':id/suspend')
  suspendVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SuspendVehicleDto,
  ) {
    return this.vehiclesService.suspendVehicle(id, dto.raison);
  }

  /**
   * PATCH /admin/vehicles/:id/feature
   * Active ou désactive la mise en avant d'un véhicule (max 10 simultanément).
   */
  @Patch(':id/feature')
  featureVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FeatureVehicleDto,
  ) {
    return this.vehiclesService.featureVehicle(id, dto.active, dto.featuredUntil);
  }
}
