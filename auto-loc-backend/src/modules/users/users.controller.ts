import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { BanUserDto } from './dto/ban-user.dto';
import { GetAdminUsersDto } from './dto/get-admin-users.dto';
import { GetKycQueueDto } from './dto/get-kyc-queue.dto';
import { GetUsersQueueDto } from './dto/get-users-queue.dto';
import { GetHostsQueueDto } from './dto/get-hosts-queue.dto';
import { GetTenantsQueueDto } from './dto/get-tenants-queue.dto';
import { HostFleetActionDto } from './dto/fleet-action.dto';
import { SetUserRoleDto } from './dto/set-user-role.dto';
import { RejectKycDto } from './dto/reject-kyc.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RoleProfile } from '@prisma/client';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * GET /admin/users/hosts-queue
   * File dédiée à la modération et l'administration des hôtes & propriétaires
   */
  @Get('hosts-queue')
  async getHostsQueue(@Query() dto: GetHostsQueueDto) {
    return this.usersService.getHostsQueue(dto);
  }

  /**
   * GET /admin/users/hosts/:id/health-360
   * Vue 360° de décision et santé de l'hôte (score de risque, flotte, séquestre)
   */
  @Get('hosts/:id/health-360')
  async getHostHealth360(@Param('id') id: string) {
    return this.usersService.getHostHealth360(id);
  }

  /**
   * GET /admin/users/tenants-queue
   * File dédiée à la supervision et l'administration des locataires & voyageurs
   */
  @Get('tenants-queue')
  async getTenantsQueue(@Query() dto: GetTenantsQueueDto) {
    return this.usersService.getTenantsQueue(dto);
  }

  /**
   * GET /admin/users/tenants/:id/health-360
   * Vue 360° de décision et santé du locataire (permis, score de risque, historique réservations & cautions)
   */
  @Get('tenants/:id/health-360')
  async getTenantHealth360(@Param('id') id: string) {
    return this.usersService.getTenantHealth360(id);
  }

  /**
   * PATCH /admin/users/tenants/:id/permis/approve
   * Valide le permis de conduire du locataire
   */
  @Patch('tenants/:id/permis/approve')
  async approveTenantPermis(@Param('id') id: string) {
    return this.usersService.approveTenantPermis(id);
  }

  /**
   * PATCH /admin/users/tenants/:id/permis/reject
   * Rejette le permis de conduire du locataire avec motif
   */
  @Patch('tenants/:id/permis/reject')
  async rejectTenantPermis(@Param('id') id: string, @Body() dto: RejectKycDto) {
    return this.usersService.rejectTenantPermis(id, dto.raison);
  }

  /**
   * POST /admin/users/hosts/:id/fleet-action
   * Action administrative en 1 clic sur l'ensemble de la flotte de l'hôte (suspendre, activer)
   */
  @Post('hosts/:id/fleet-action')
  async executeHostFleetAction(
    @Param('id') id: string,
    @Body() dto: HostFleetActionDto,
  ) {
    return this.usersService.executeHostFleetAction(id, dto.action, dto.raison);
  }

  /**
   * GET /admin/users/users-queue
   * File unifiée de modération & gestion de tous les utilisateurs (Profile + Utilisateur)
   */
  @Get('users-queue')
  async getUsersQueue(@Query() dto: GetUsersQueueDto) {
    return this.usersService.getUsersQueue(dto);
  }

  /**
   * GET /admin/users/kyc-queue
   * File de modération KYC optimisée avec recherche, filtrage et statistiques.
   */
  @Get('kyc-queue')
  async getKycQueue(@Query() dto: GetKycQueueDto) {
    return this.usersService.getKycQueue(dto);
  }

  /**
   * GET /admin/users?kycStatus=EN_ATTENTE
   * Liste des utilisateurs.
   */
  @Get()
  async listUsers(@Query() dto: GetAdminUsersDto) {
    return this.usersService.listAdminUsers(dto.kycStatus, dto.page ?? 1);
  }

  @Get(':id')
  async getAdminUserDetail(@Param('id') id: string) {
    return this.usersService.getAdminUserDetail(id);
  }

  @Patch(':id/status')
  async setUserStatus(@Param('id') id: string, @Body() dto: BanUserDto) {
    return this.usersService.setUserStatus(id, dto);
  }

  @Patch(':id/role')
  async setUserRole(@Param('id') id: string, @Body() dto: SetUserRoleDto) {
    return this.usersService.setUserRole(id, dto.role);
  }

  /**
   * PATCH /admin/users/:id/kyc/approve
   * Valide le KYC et promeut les véhicules BROUILLON → EN_ATTENTE_VALIDATION.
   */
  @Patch(':id/kyc/approve')
  async approveKyc(@Param('id') id: string) {
    return this.usersService.approveKyc(id);
  }

  /**
   * PATCH /admin/users/:id/kyc/reject
   * Rejette le KYC avec une raison optionnelle.
   */
  @Patch(':id/kyc/reject')
  @HttpCode(HttpStatus.OK)
  async rejectKyc(
    @Param('id') id: string,
    @Body() body: RejectKycDto,
  ) {
    return this.usersService.rejectKyc(id, body.raison);
  }
}

