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
import { LinkPhotoDto } from './dto/link-photo.dto';
import { UpdatePhotoDto } from './dto/update-photo.dto';
import { VEHICLE_DOCUMENT_MULTER_OPTIONS, VEHICLE_PHOTO_MULTER_OPTIONS } from '../upload/upload.config';
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
   * GET /vehicles/feed — Feed home (premium, nouveautés, recommandé). Public, cache Redis 120s.
   * Doit être AVANT GET :id pour éviter que "feed" soit capturé comme UUID.
   */
  @Get('feed')
  getHomeFeed() {
    return this.vehiclesService.getHomeFeed();
  }

  /**
   * GET /vehicles/feed/mobile — Feed mobile ultra-complet avec 10 sections.
   * Optimisé pour scroll infini. Public, cache Redis 180s.
   * Doit être AVANT GET :id pour éviter que "feed/mobile" soit capturé comme UUID.
   */
  @Get('feed/mobile')
  getMobileFeed() {
    return this.vehiclesService.getMobileFeed();
  }

  /**
   * GET /vehicles/upload-signature — Génère une signature Cloudinary pour l'upload direct.
   * Le frontend upload le fichier directement vers Cloudinary sans passer par ce serveur.
   */
  @Get('upload-signature')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  getUploadSignature() {
    return this.vehiclesService.getUploadSignature();
  }

  /**
   * GET /vehicles/me — Liste mes véhicules avec nb réservations.
   * Doit être AVANT GET :id pour éviter que "me" soit capturé comme UUID.
   */
  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard, ProfileCompletedGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  findMine(
    @CurrentUser() user: RequestUser,
    @Query('limit') limit?: string,
  ) {
    return this.vehiclesService.findMyVehicles(user, limit ? Number(limit) : undefined);
  }

  /**
   * GET /vehicles/me/summary — Résumé léger pour le tableau de bord propriétaire.
   * Doit être AVANT GET :id pour éviter que "me" soit capturé comme UUID.
   */
  @Get('me/summary')
  @UseGuards(JwtAuthGuard, RolesGuard, ProfileCompletedGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  findMineSummary(@CurrentUser() user: RequestUser) {
    return this.vehiclesService.findMyVehiclesSummary(user);
  }

  /**
   * GET /vehicles/:id/documents/upload-signature — OBSOLÈTE
   * Utiliser la création transaction unique avec documents inclus.
   * Gardé pour compatibilité temporaire.
   */
  @Get(':id/documents/upload-signature')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  getDocumentUploadSignature() {
    throw new BadRequestException('Endpoint obsolète. Utilisez POST /vehicles avec documents inclus.');
  }

  /**
   * POST /vehicles/:id/documents/carte-grise/link — OBSOLÈTE
   * Utiliser la création transaction unique avec documents inclus.
   * Gardé pour compatibilité temporaire.
   */
  @Post(':id/documents/carte-grise/link')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  linkCarteGrise() {
    throw new BadRequestException('Endpoint obsolète. Utilisez POST /vehicles avec documents inclus.');
  }

  /**
   * POST /vehicles/:id/documents/assurance/link — OBSOLÈTE
   * Utiliser la création transaction unique avec documents inclus.
   * Gardé pour compatibilité temporaire.
   */
  @Post(':id/documents/assurance/link')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  linkAssurance() {
    throw new BadRequestException('Endpoint obsolète. Utilisez POST /vehicles avec documents inclus.');
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
   * GET /vehicles/:id/blocked-dates — Dates indisponibles (public).
   * Utilisé par le calendrier de réservation côté locataire.
   */
  @Get(':id/blocked-dates')
  getBlockedDates(@Param('id', ParseUUIDPipe) id: string) {
    return this.vehiclesService.getBlockedDates(id);
  }

  /**
   * GET /vehicles/:id/pricing?days=N
   * Prévisualisation publique du tarif dynamique pour N jours.
   */
  @Get(':id/pricing')
  async getPricing(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('days') daysStr?: string,
    @Query('horsDakar') horsDakarStr?: string,
  ) {
    const days = daysStr ? parseInt(daysStr, 10) : 1;
    const horsDakar = horsDakarStr === 'true' || horsDakarStr === '1';
    return this.vehiclesService.getPricing(id, isNaN(days) || days < 1 ? 1 : days, horsDakar);
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

  /**
   * DELETE /vehicles/:id/purge — Suppression définitive (BROUILLON / ARCHIVE uniquement).
   * Appelé par le propriétaire pour vider son garage ou en cas d'erreur de création.
   */
  @Delete(':id/purge')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  deletePermanently(
    @CurrentUser() user: RequestUser,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.vehiclesService.deletePermanently(user, id);
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
      throw new BadRequestException('Fichier requis');
    }
    return this.vehiclesService.addPhoto(id, file);
  }

  /**
   * POST /vehicles/:id/photos/link — Enregistre une photo uploadée directement
   * vers Cloudinary. Reçoit { url, publicId } en JSON (pas de fichier).
   */
  @Post(':id/photos/link')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  linkPhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: LinkPhotoDto,
  ) {
    return this.vehiclesService.linkPhoto(id, body.url, body.publicId);
  }

  /**
   * PATCH /vehicles/:id/photos/:photoId — Modifier position / photo principale.
   */
  @Patch(':id/photos/:photoId')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  updatePhoto(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('photoId', ParseUUIDPipe) photoId: string,
    @Body() body: UpdatePhotoDto,
  ) {
    return this.vehiclesService.updatePhoto(id, photoId, body);
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

  // ── DOCUMENTS VÉHICULE ─────────────────────────────────────────────────

  /**
   * GET /vehicles/:id/documents/:docType/view — OBSOLÈTE
   * Utiliser la création transaction unique avec documents inclus.
   * Gardé pour compatibilité temporaire.
   */
  @Get(':id/documents/:docType/view')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  getDocumentSignedUrl() {
    throw new BadRequestException('Endpoint obsolète. Utilisez POST /vehicles avec documents inclus.');
  }

  /**
   * POST /vehicles/:id/documents/carte-grise — OBSOLÈTE
   * Utiliser la création transaction unique avec documents inclus.
   * Gardé pour compatibilité temporaire.
   */
  @Post(':id/documents/carte-grise')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('file', VEHICLE_DOCUMENT_MULTER_OPTIONS))
  async uploadCarteGrise() {
    throw new BadRequestException('Endpoint obsolète. Utilisez POST /vehicles avec documents inclus.');
  }

  /**
   * POST /vehicles/:id/documents/assurance — OBSOLÈTE
   * Utiliser la création transaction unique avec documents inclus.
   * Gardé pour compatibilité temporaire.
   */
  @Post(':id/documents/assurance')
  @UseGuards(JwtAuthGuard, RolesGuard, ResourceOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('file', VEHICLE_DOCUMENT_MULTER_OPTIONS))
  async uploadAssuranceDoc() {
    throw new BadRequestException('Endpoint obsolète. Utilisez POST /vehicles avec documents inclus.');
  }
}
