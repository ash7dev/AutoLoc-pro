import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { RequestUser } from '../../common/types/auth.types';
import { ProfileResponse } from '../../common/types/auth.types';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { LoginWithSupabaseDto } from './dto/login-with-supabase.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RoleProfile } from '@prisma/client';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: RequestUser): Promise<ProfileResponse> {
    const profile = await this.authService.getOrCreateProfile(user);
    // Debug local
    // eslint-disable-next-line no-console
    console.log('[Auth] /me', {
      userId: profile.userId,
      role: profile.role,
      hasUtilisateur: profile.hasUtilisateur,
    });
    return profile;
  }

  @Post('login')
  async loginWithSupabase(
    @Body() dto: LoginWithSupabaseDto,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile }> {
    return this.authService.loginWithSupabase(dto.accessToken);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile }> {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('complete-profile')
  @UseGuards(JwtAuthGuard)
  async completeProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: CompleteProfileDto,
  ): Promise<ProfileResponse> {
    return this.authService.completeProfile(user, dto);
  }

  @Patch('switch-role')
  @UseGuards(JwtAuthGuard)
  async switchRole(
    @CurrentUser() user: RequestUser,
    @Body() dto: SwitchRoleDto,
  ): Promise<{ role: RoleProfile }> {
    return this.authService.switchRole(user, dto);
  }
}
