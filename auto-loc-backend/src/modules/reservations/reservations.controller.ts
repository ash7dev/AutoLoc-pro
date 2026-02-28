import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { ReservationOwnerGuard } from '../../shared/guards/reservation-owner.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RequestUser } from '../../common/types/auth.types';
import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { CancelReservationDto } from './dto/cancel-reservation.dto';
import { DisputesService } from '../disputes/disputes.service';
import { CreateDisputeDto } from '../disputes/dto/create-dispute.dto';
import { VEHICLE_PHOTO_MULTER_OPTIONS } from '../upload/upload.config';
import { MulterExceptionFilter } from '../upload/multer-exception.filter';
import { CheckInRole } from '../../domain/reservation/use-cases/checkin.use-case';

@Controller('reservations')
@UseGuards(JwtAuthGuard)
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
    private readonly disputesService: DisputesService,
  ) { }

  /**
   * POST /reservations
   * Crée une réservation avec vérification KYC, disponibilité, paiement initié.
   */
  @Post()
  @UseGuards(RolesGuard)
  @Roles(RoleProfile.LOCATAIRE)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Req() req: Request & { user?: RequestUser },
    @Body() dto: CreateReservationDto,
    @Headers('idempotency-key') idempotencyHeader?: string,
  ) {
    const user = req.user!;
    return this.reservationsService.create(user, dto, idempotencyHeader);
  }

  /**
   * PATCH /reservations/:id/confirm
   * Propriétaire confirme une réservation PAYEE → CONFIRMEE.
   */
  @Patch(':id/confirm')
  @UseGuards(RolesGuard, ReservationOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @HttpCode(HttpStatus.OK)
  async confirm(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
  ) {
    const user = req.user!;
    return this.reservationsService.confirm(user, reservationId);
  }

  /**
   * PATCH /reservations/:id/confirm-payment
   * Confirme le paiement d'une réservation (EN_ATTENTE_PAIEMENT → PAYEE).
   * Endpoint temporaire pour dev/test — sera remplacé par webhook.
   */
  @Patch(':id/confirm-payment')
  @HttpCode(HttpStatus.OK)
  async confirmPayment(
    @Param('id', ParseUUIDPipe) reservationId: string,
  ) {
    return this.reservationsService.confirmPayment(reservationId);
  }

  /**
   * PATCH /reservations/:id/cancel
   * Annulation par le locataire OU le propriétaire.
   * Vérification de l'acteur dans le use-case.
   */
  @Patch(':id/cancel')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Body() dto: CancelReservationDto,
  ) {
    const user = req.user!;
    return this.reservationsService.cancel(user, reservationId, dto);
  }

  /**
   * PATCH /reservations/:id/checkin?role=PROPRIETAIRE|LOCATAIRE
   * Double confirmation check-in : les DEUX parties doivent confirmer.
   * L'argent est débloqué au wallet propriétaire quand les deux ont confirmé.
   */
  @Patch(':id/checkin')
  @HttpCode(HttpStatus.OK)
  async checkin(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Query('role') role?: string,
  ) {
    const user = req.user!;
    const checkinRole: CheckInRole =
      role?.toUpperCase() === 'LOCATAIRE' ? 'LOCATAIRE' : 'PROPRIETAIRE';
    return this.reservationsService.checkin(user, reservationId, {
      role: checkinRole,
    });
  }

  /**
   * PATCH /reservations/:id/checkout
   * Propriétaire termine la location (EN_COURS → TERMINEE).
   */
  @Patch(':id/checkout')
  @UseGuards(RolesGuard, ReservationOwnerGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @HttpCode(HttpStatus.OK)
  async checkout(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
  ) {
    const user = req.user!;
    return this.reservationsService.checkout(user, reservationId);
  }

  /**
   * POST /reservations/:id/photos-etat
   * Upload une photo d'état des lieux (check-in ou check-out).
   * Query param: ?type=CHECKIN|CHECKOUT&categorie=AVANT|ARRIERE|...
   */
  @Post(':id/photos-etat')
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(FileInterceptor('file', VEHICLE_PHOTO_MULTER_OPTIONS))
  @HttpCode(HttpStatus.CREATED)
  async uploadPhotoEtatLieu(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
    @UploadedFile() file: Express.Multer.File | undefined,
    @Query('type') type?: string,
    @Query('categorie') categorie?: string,
  ) {
    if (!file?.buffer) {
      throw new BadRequestException('File is required');
    }
    const user = req.user!;
    return this.reservationsService.uploadPhotoEtatLieu(
      user,
      reservationId,
      file,
      (type?.toUpperCase() ?? 'CHECKIN') as 'CHECKIN' | 'CHECKOUT',
      categorie?.toUpperCase(),
    );
  }

  /**
   * GET /reservations/:id/contrat
   * Télécharger le contrat (locataire OU propriétaire).
   */
  @Get(':id/contrat')
  @HttpCode(HttpStatus.OK)
  async getContrat(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Res() res: Response,
  ) {
    const user = req.user!;
    const { contratUrl } = await this.reservationsService.getContrat(user, reservationId);
    return res.redirect(contratUrl);
  }

  /**
   * GET /reservations/owner
   * Liste les réservations d'un propriétaire connecté.
   */
  @Get('owner')
  @UseGuards(RolesGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @HttpCode(HttpStatus.OK)
  async findForOwner(
    @Req() req: Request & { user?: RequestUser },
    @Query('vehiculeId') vehiculeId?: string,
  ) {
    const user = req.user!;
    return this.reservationsService.findForOwner(user, vehiculeId);
  }

  /**
   * GET /reservations/owner/stats
   * Métriques du mois pour le tableau de bord propriétaire.
   * Doit être AVANT GET :id pour éviter le conflit de routage.
   */
  @Get('owner/stats')
  @UseGuards(RolesGuard)
  @Roles(RoleProfile.PROPRIETAIRE)
  @HttpCode(HttpStatus.OK)
  async findOwnerStats(
    @Req() req: Request & { user?: RequestUser },
  ) {
    const user = req.user!;
    return this.reservationsService.findOwnerStats(user);
  }

  /**
   * GET /reservations/tenant
   * Liste les réservations du locataire connecté.
   */
  @Get('tenant')
  @UseGuards(RolesGuard)
  @Roles(RoleProfile.LOCATAIRE)
  @HttpCode(HttpStatus.OK)
  async findForTenant(
    @Req() req: Request & { user?: RequestUser },
    @Query('statut') statut?: string,
  ) {
    const user = req.user!;
    return this.reservationsService.findForTenant(user, statut);
  }

  /**
   * GET /reservations/:id/locataire-docs
   * Le propriétaire peut consulter les documents KYC + permis du locataire.
   */
  @Get(':id/locataire-docs')
  @HttpCode(HttpStatus.OK)
  async getLocataireDocs(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
  ) {
    const user = req.user!;
    return this.reservationsService.getLocataireDocs(user, reservationId);
  }

  /**
   * GET /reservations/:id
   * Détail d'une réservation (accessible au locataire ET au propriétaire).
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
  ) {
    const user = req.user!;
    return this.reservationsService.findById(user, reservationId);
  }

  /**
   * POST /reservations/:id/dispute
   * Locataire : litige non-conformité pendant CONFIRMEE (check-in).
   * Propriétaire : litige EN_COURS ou TERMINEE (dans les 24h).
   */
  @Post(':id/dispute')
  @HttpCode(HttpStatus.CREATED)
  async createDispute(
    @Req() req: Request & { user?: RequestUser },
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Body() dto: CreateDisputeDto,
  ) {
    const user = req.user!;
    return this.disputesService.create(user, reservationId, dto);
  }
}
