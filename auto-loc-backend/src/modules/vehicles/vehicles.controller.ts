import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { ProfileCompletedGuard } from '../../shared/guards/profile-completed.guard';
import { PhoneVerifiedGuard } from '../../shared/guards/phone-verified.guard';
import { ResourceOwnerGuard } from '../../shared/guards/resource-owner.guard';
import { OptionalJwtAuthGuard } from '../../shared/guards/optional-jwt-auth.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/auth.types';
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { SearchVehiclesDto } from './dto/search-vehicles.dto';
import { CreateIndisponibiliteDto } from './dto/create-indisponibilite.dto';
import { VEHICLE_PHOTO_MULTER_OPTIONS } from '../upload/upload.config';
import { MulterExceptionFilter } from '../upload/multer-exception.filter';

@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) { }

  /**
   * POST /vehicles — Créer un véhicule (PROPRIETAIRE, profil complété).
   * Statut initial : EN_ATTENTE_VALIDATION.
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard, ProfileCompletedGuard, PhoneVerifiedGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateVehicleDto) {
    return this.vehiclesService.create(user, dto);
  }

  /**
   * GET /vehicles/search — Recherche publique avec disponibilité et filtres.
   * Doit être AVANT GET :id pour éviter que "search" soit capturé comme UUID.
   * Cache Redis 60s. SQL natif avec NOT EXISTS pour l'exclusion par dates.
   */
  @Get('search')
  search(@Query() dto: SearchVehiclesDto) {
    return this.vehiclesService.search(dto);
  }

  /**
   * GET /vehicles/me — Liste mes véhicules avec nb réservations.
   * Doit être AVANT GET :id pour éviter que "me" soit capturé comme UUID.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard, ProfileCompletedGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  findMine(@CurrentUser() user: RequestUser) {
    return this.vehiclesService.findMyVehicles(user);
  }

  /**
   * GET /vehicles/:id/reservations — Liste des réservations d'un véhicule (propriétaire uniquement).
   * Doit être AVANT GET :id pour éviter le conflit de routage.
   */
  @Get(':id/reservations')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  findReservations(
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vehiclesService.findReservationsForVehicle(id);
  }

  /**
   * GET /vehicles/:id — Détail (public si VERIFIE, propriétaire si le sien).
   */
  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @Req() req: Request,
  ) {
    const user = (req as Request & { user?: RequestUser }).user ?? null;
    return this.vehiclesService.findOne(user, id);
  }

  /**
   * GET /vehicles/:id/pricing?days=N
   * Prévisualisation publique du tarif dynamique pour N jours.
   */
  @Get(':id/pricing')
  async getPricing(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days') daysStr?: string,
  ) {
    const days = daysStr ? parseInt(daysStr, 10) : 1;
    return this.vehiclesService.getPricing(id, isNaN(days) || days < 1 ? 1 : days);
  }

  /**
   * PATCH /vehicles/:id — Modifier un véhicule (propriétaire uniquement).
   * Interdit si une location est EN_COURS.
   */
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.vehiclesService.update(id, dto);
  }

  /**
   * DELETE /vehicles/:id — Archiver un véhicule (statut → ARCHIVE, pas de suppression DB).
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  archive(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.archive(id);
  }

  // ── INDISPONIBILITÉS (Calendrier de disponibilité) ───────────────────

  /**
   * POST /vehicles/:id/indisponibilites
   * Bloquer des dates pour un véhicule.
   */
  @Post(':id/indisponibilites')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  createIndisponibilite(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateIndisponibiliteDto,
  ) {
    return this.vehiclesService.createIndisponibilite(id, dto);
  }

  /**
   * GET /vehicles/:id/indisponibilites
   * Lister les périodes bloquées d'un véhicule.
   */
  @Get(':id/indisponibilites')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  findIndisponibilites(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.findIndisponibilites(id);
  }

  /**
   * DELETE /vehicles/:id/indisponibilites/:indispoId
   * Supprimer une période bloquée.
   */
  @Delete(':id/indisponibilites/:indispoId')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  deleteIndisponibilite(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('indispoId', ParseUUIDPipe) indispoId: string,
  ) {
    return this.vehiclesService.deleteIndisponibilite(id, indispoId);
  }

  /**
   * POST /vehicles/:id/photos — Uploader une photo (max 8, multipart).
   */
  @Post(':id/photos')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('file', VEHICLE_PHOTO_MULTER_OPTIONS))
  async addPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('File is required');
    }
    return this.vehiclesService.addPhoto(id, file);
  }

  /**
   * DELETE /vehicles/:id/photos/:photoId — Supprimer une photo.
   */
  @Delete(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  deletePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
  ) {
    return this.vehiclesService.deletePhoto(id, photoId);
  }
}
