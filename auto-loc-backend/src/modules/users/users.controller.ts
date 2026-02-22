import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { BanUserDto } from './dto/ban-user.dto';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { RolesGuard } from '../../shared/guards/roles.guard';
import { Roles } from '../../shared/decorators/roles.decorator';
import { RoleProfile } from '@prisma/client';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(RoleProfile.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch(':id/status')
  async setUserStatus(@Param('id') id: string, @Body() dto: BanUserDto) {
    return this.usersService.setUserStatus(id, dto);
  }
}
