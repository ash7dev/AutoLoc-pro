import { Controller, Get, HttpCode, HttpStatus, Query, UseGuards } from '@nestjs/common';
import { RoleProfile } from '@prisma/client';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AdminAnalyticsQueryDto } from './dto/admin-analytics-query.dto';

@Controller('admin/analytics')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class AdminAnalyticsController {
  constructor(private readonly adminAnalyticsService: AdminAnalyticsService) {}

  /**
   * GET /admin/analytics/dashboard-summary
   * Synthèse complète unifiée du tableau de bord exécutif & opérationnel en 1 seul appel HTTP.
   */
  @Get('dashboard-summary')
  @HttpCode(HttpStatus.OK)
  getDashboardSummary(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getDashboardSummary(query);
  }

  /**
   * GET /admin/analytics/overview
   * Vue d'ensemble stratégique exécutive (GMV, Commissions, Take Rate, Flotte, Deltas MoM/WoW).
   */
  @Get('overview')
  @HttpCode(HttpStatus.OK)
  getOverview(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getOverview(query);
  }

  /**
   * GET /admin/analytics/revenue-trends
   * Séries temporelles pour graphiques d'évolution du chiffre d'affaires & commissions.
   */
  @Get('revenue-trends')
  @HttpCode(HttpStatus.OK)
  getRevenueTrends(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getRevenueTrends(query);
  }

  /**
   * GET /admin/analytics/payment-breakdown
   * Répartition financière par moyen de paiement (Wave vs Orange Money vs Stripe).
   */
  @Get('payment-breakdown')
  @HttpCode(HttpStatus.OK)
  getPaymentBreakdown(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getPaymentBreakdown(query);
  }

  /**
   * GET /admin/analytics/fleet-stats
   * Taux d'occupation et répartition géographique & par catégorie de la flotte.
   */
  @Get('fleet-stats')
  @HttpCode(HttpStatus.OK)
  getFleetStats(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getFleetStats(query);
  }

  /**
   * GET /admin/analytics/conversion-funnel
   * Entonnoir de conversion de la plateforme (Recherches -> Vues -> Bookings -> Confirmés).
   */
  @Get('conversion-funnel')
  @HttpCode(HttpStatus.OK)
  getConversionFunnel(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getConversionFunnel(query);
  }

  /**
   * GET /admin/analytics/ops-command-center
   * Synthèse temps réel du centre d'opérations et suivi des délais SLA (KYC, Véhicules, Retraits, Litiges).
   */
  @Get('ops-command-center')
  @HttpCode(HttpStatus.OK)
  getOpsCommandCenter() {
    return this.adminAnalyticsService.getOpsCommandCenter();
  }

  /**
   * GET /admin/analytics/risk-quality
   * Ratios de risque et qualité globale (Annulations, Litiges per 100 bookings, Note moyenne).
   */
  @Get('risk-quality')
  @HttpCode(HttpStatus.OK)
  getRiskQuality() {
    return this.adminAnalyticsService.getRiskQuality();
  }

  /**
   * GET /admin/analytics/users-funnel
   * Funnel d'inscription et d'activation des utilisateurs (Drop-off KYC, Rétention, Nouveaux inscrits).
   */
  @Get('users-funnel')
  @HttpCode(HttpStatus.OK)
  getUsersFunnel() {
    return this.adminAnalyticsService.getUserActivationFunnel();
  }

  /**
   * GET /admin/analytics/supply-pipeline
   * Pipeline d'acquisition de l'offre (Propriétaires, Brouillons abandonnés, Flotte dormante).
   */
  @Get('supply-pipeline')
  @HttpCode(HttpStatus.OK)
  getSupplyPipeline() {
    return this.adminAnalyticsService.getSupplyPipeline();
  }

  /**
   * GET /admin/analytics/reservations-breakdown
   * Décomposition exhaustive des états de réservations et motifs d'annulation.
   */
  @Get('reservations-breakdown')
  @HttpCode(HttpStatus.OK)
  getReservationsBreakdown(@Query() query: AdminAnalyticsQueryDto) {
    return this.adminAnalyticsService.getReservationsBreakdown(query);
  }

  /**
   * GET /admin/analytics/unmet-demand
   * Demande non satisfaite (Recherches à 0 résultat).
   */
  @Get('unmet-demand')
  @HttpCode(HttpStatus.OK)
  getUnmetDemand() {
    return this.adminAnalyticsService.getUnmetDemand();
  }

  /**
   * GET /admin/analytics/cohorts
   * Rétention des locataires et taux de réservation récurrente.
   */
  @Get('cohorts')
  @HttpCode(HttpStatus.OK)
  getCohorts() {
    return this.adminAnalyticsService.getCohortsAndRetention();
  }

  /**
   * GET /admin/analytics/financial-escrow
   * Fonds sous séquestre dans les comptes Marchands Wave & Orange Money.
   */
  @Get('financial-escrow')
  @HttpCode(HttpStatus.OK)
  getFinancialEscrow() {
    return this.adminAnalyticsService.getFinancialEscrow();
  }
}
