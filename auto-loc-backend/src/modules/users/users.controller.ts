import { Body, Controller, Get, Param, Patch, Query, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { BanUserDto } from './dto/ban-user.dto';
import { GetAdminUsersDto } from './dto/get-admin-users.dto';
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
   * GET /admin/users?kycStatus=EN_ATTENTE
   * Liste des utilisateurs (filtrable par statut KYC).
   */
  @Get()
  async listUsers(@Query() dto: GetAdminUsersDto) {
    return this.usersService.listAdminUsers(dto.kycStatus);
  }

  @Patch(':id/status')
  async setUserStatus(@Param('id') id: string, @Body() dto: BanUserDto) {
    return this.usersService.setUserStatus(id, dto);
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
    @Body() body: { raison?: string },
  ) {
    return this.usersService.rejectKyc(id, body.raison);
  }
}
