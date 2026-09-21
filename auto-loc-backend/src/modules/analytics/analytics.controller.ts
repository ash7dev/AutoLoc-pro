import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/types/auth.types';
import { AnalyticsService } from './analytics.service';
import { RevenueBreakdownQueryDto } from './dto/revenue-breakdown-query.dto';
import { OccupancyQueryDto } from './dto/occupancy-query.dto';
import { FleetPerformanceQueryDto } from './dto/fleet-performance-query.dto';

@Controller('analytics/owner')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.PROPRIETAIRE)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) { }

  /**
   * GET /analytics/owner/overview
   * Matrice d'aperçu financier, opérationnel et flotte.
   */
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  getOverview(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getOverview(user);
  }

  /**
   * GET /analytics/owner/revenue-breakdown
   * Séries temporelles au prorata journalier pour le chiffre d'affaires et les commissions.
   */
  @Get('revenue-breakdown')
  @HttpCode(HttpStatus.OK)
  getRevenueBreakdown(
    @CurrentUser() user: RequestUser,
    @Query() query: RevenueBreakdownQueryDto,
  ) {
    return this.analyticsService.getRevenueBreakdown(user, query);
  }

  /**
   * GET /analytics/owner/occupancy
   * Taux d'occupation commercial à 5 états (jours loués vs disponibles).
   */
  @Get('occupancy')
  @HttpCode(HttpStatus.OK)
  getOccupancyStats(
    @CurrentUser() user: RequestUser,
    @Query() query: OccupancyQueryDto,
  ) {
    return this.analyticsService.getOccupancyStats(user, query);
  }

  /**
   * GET /analytics/owner/fleet-performance
   * Comparatif de performance et d'entonnoir de conversion par véhicule.
   */
  @Get('fleet-performance')
  @HttpCode(HttpStatus.OK)
  getFleetPerformance(
    @CurrentUser() user: RequestUser,
    @Query() query: FleetPerformanceQueryDto,
  ) {
    return this.analyticsService.getFleetPerformance(user, query);
  }

  /**
   * GET /analytics/owner/insights
   * Recommandations et alertes intelligentes Niveau 1 & 2.
   */
  @Get('insights')
  @HttpCode(HttpStatus.OK)
  getInsights(@CurrentUser() user: RequestUser) {
    return this.analyticsService.getInsights(user);
  }
}
