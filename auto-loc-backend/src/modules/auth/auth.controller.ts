import {
  BadRequestException,
  Body, Controller, Get, Patch, Post,
  UploadedFiles, UseFilters, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MulterExceptionFilter } from '../upload/multer-exception.filter';
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
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';

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

  @Post('phone/send-otp')
  @UseGuards(JwtAuthGuard)
  async sendPhoneOtp(
    @CurrentUser() user: RequestUser,
  ): Promise<{ expiresIn: number }> {
    return this.authService.requestPhoneOtp(user);
  }

  @Post('phone/update')
  @UseGuards(JwtAuthGuard)
  async updatePhone(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePhoneDto,
  ): Promise<ProfileResponse> {
    return this.authService.updatePhone(user, dto.telephone);
  }

  @Post('phone/verify-otp')
  @UseGuards(JwtAuthGuard)
  async verifyPhoneOtp(
    @CurrentUser() user: RequestUser,
    @Body() dto: VerifyPhoneOtpDto,
  ): Promise<ProfileResponse> {
    return this.authService.verifyPhoneOtp(user, dto.code);
  }

  /**
   * POST /auth/kyc/submit — Soumet les documents KYC (pièce recto/verso).
   * Multipart : champ "documentFront" (recto) + champ "documentBack" (verso).
   * Uploadé sur Cloudinary → statutKyc passe à EN_ATTENTE.
   */
  @Post('kyc/submit')
  @UseGuards(JwtAuthGuard)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'documentFront', maxCount: 1 }, { name: 'documentBack', maxCount: 1 }],
      { storage: memoryStorage(), limits: { fileSize: 8 * 1024 * 1024, files: 2 } },
    ),
  )
  async submitKyc(
    @CurrentUser() user: RequestUser,
    @UploadedFiles() files: { documentFront?: Express.Multer.File[]; documentBack?: Express.Multer.File[] },
  ): Promise<ProfileResponse> {
    const front = files?.documentFront?.[0];
    const back  = files?.documentBack?.[0];
    if (!front?.buffer) throw new BadRequestException('Le fichier "documentFront" est requis.');
    if (!back?.buffer)  throw new BadRequestException('Le fichier "documentBack" est requis.');
    return this.authService.submitKyc(user, front.buffer, back.buffer);
  }
}
