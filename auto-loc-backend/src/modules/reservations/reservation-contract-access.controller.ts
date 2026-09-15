import { Controller, Get, Param, ParseUUIDPipe, Query, Res, UnauthorizedException } from '@nestjs/common';
import { Response } from 'express';
import { ReservationsService } from './reservations.service';

/** Public only through a short-lived, purpose-bound signed token. */
@Controller('reservation-contracts')
export class ReservationContractAccessController {
  constructor(private readonly reservationsService: ReservationsService) {}

  @Get(':id')
  async open(
    @Param('id', ParseUUIDPipe) reservationId: string,
    @Query('token') token: string | undefined,
    @Query('download') download: string | undefined,
    @Res() res: Response,
  ) {
    if (!token) throw new UnauthorizedException('Lien de contrat manquant');
    const { buffer, filename } = await this.reservationsService.getContractFromAccessToken(reservationId, token);
    const disposition = download === '1' ? 'attachment' : 'inline';
    res.set({ 'Content-Type': 'application/pdf', 'Content-Disposition': `${disposition}; filename="${filename}"`, 'Content-Length': buffer.length, 'Cache-Control': 'private, no-store' }).end(buffer);
  }
}
