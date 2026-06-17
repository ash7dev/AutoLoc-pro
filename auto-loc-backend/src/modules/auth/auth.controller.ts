import {
  BadRequestException,
  Body, Controller, Get, Patch, Post, Query,
  UploadedFile, UploadedFiles, UseFilters, UseGuards, UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { MulterExceptionFilter } from '../upload/multer-exception.filter';
import { JwtAuthGuard } from '../../shared/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthService } from './auth.service';
import { AccountStatusGuard } from '../../shared/guards/account-status.guard';
import { RequestUser } from '../../common/types/auth.types';
import { ProfileResponse } from '../../common/types/auth.types';
import { CompleteProfileDto } from './dto/complete-profile.dto';
import { SwitchRoleDto } from './dto/switch-role.dto';
import { LoginWithSupabaseDto } from './dto/login-with-supabase.dto';
import { RefreshDto } from './dto/refresh.dto';
import { RoleProfile } from '@prisma/client';
import { VerifyPhoneOtpDto } from './dto/verify-phone-otp.dto';
import { UpdatePhoneDto } from './dto/update-phone.dto';
import { PhoneLoginSendOtpDto, PhoneLoginVerifyOtpDto } from './dto/phone-login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Get('check-availability')
  async checkAvailability(
    @Query('email') email?: string,
    @Query('phone') phone?: string,
  ): Promise<{ available: boolean; message?: string }> {
    return this.authService.checkAvailability(email, phone);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async me(@CurrentUser() user: RequestUser): Promise<ProfileResponse> {
    const profile = await this.authService.getOrCreateProfile(user);
    // Debug local
    // eslint-disable-next-line no-console
    console.log('[Auth] /me', {
      userId: profile.userId,
      role: profile.role,
      hasUtilisateur: profile.hasUtilisateur,
      prenom: profile.prenom,
      nom: profile.nom,
      dateNaissance: profile.dateNaissance,
      phoneVerified: profile.phoneVerified,
    });
    return profile;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logout(@CurrentUser() user: RequestUser): Promise<{ ok: boolean }> {
    await this.authService.logout(user.sub);
    return { ok: true };
  }

  @Post('login')
  async loginWithSupabase(
    @Body() dto: LoginWithSupabaseDto,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile; profile: ProfileResponse }> {
    return this.authService.loginWithSupabase(dto.accessToken);
  }

  @Post('refresh')
  async refresh(
    @Body() dto: RefreshDto,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile; profile: ProfileResponse }> {
    return this.authService.refresh(dto.refreshToken);
  }


  @Post('complete-profile')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async completeProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: CompleteProfileDto,
  ): Promise<ProfileResponse> {
    return this.authService.completeProfile(user, dto);
  }

  @Patch('switch-role')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async switchRole(
    @CurrentUser() user: RequestUser,
    @Body() dto: SwitchRoleDto,
  ): Promise<{ role: RoleProfile; accessToken: string; refreshToken: string }> {
    return this.authService.switchRole(user, dto);
  }

  @Post('phone/send-otp')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async sendPhoneOtp(
    @CurrentUser() user: RequestUser,
  ): Promise<{ expiresIn: number }> {
    return this.authService.requestPhoneOtp(user);
  }

  @Post('phone/update')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async updatePhone(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdatePhoneDto,
  ): Promise<ProfileResponse> {
    return this.authService.updatePhone(user, dto.telephone);
  }

  @Post('phone/verify-otp')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async verifyPhoneOtp(
    @CurrentUser() user: RequestUser,
    @Body() dto: VerifyPhoneOtpDto,
  ): Promise<ProfileResponse> {
    return this.authService.verifyPhoneOtp(user, dto.code);
  }

  /* ── Phone Login (unauthenticated) ────────────────────────────────────── */

  @Post('phone-login/send-otp')
  async sendPhoneLoginOtp(
    @Body() dto: PhoneLoginSendOtpDto,
  ): Promise<{ expiresIn: number }> {
    return this.authService.requestPhoneLoginOtp(dto.phone);
  }

  @Post('phone-login/verify-otp')
  async verifyPhoneLoginOtp(
    @Body() dto: PhoneLoginVerifyOtpDto,
  ): Promise<{ accessToken: string; refreshToken: string; activeRole: RoleProfile; profile: ProfileResponse }> {
    return this.authService.verifyPhoneLoginOtp(dto.phone, dto.code);
  }

  /**
   * POST /auth/kyc/submit — Soumet les documents KYC (pièce recto/verso).
   * Multipart : champ "documentFront" (recto) + champ "documentBack" (verso).
   * Uploadé sur Cloudinary → statutKyc passe à EN_ATTENTE.
   */
  /**
   * POST /auth/kyc/submit — Soumet les documents KYC (pièce recto/verso).
   * @deprecated Utilisez l'upload direct via kyc/upload-signature et kyc/submit-links pour plus de rapidité.
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
    const back = files?.documentBack?.[0];
    if (!front?.buffer) throw new BadRequestException('Le fichier "documentFront" est requis.');
    if (!back?.buffer) throw new BadRequestException('Le fichier "documentBack" est requis.');
    return this.authService.submitKyc(user, front.buffer, back.buffer);
  }

  /**
   * GET /auth/kyc/upload-signature — Signature Cloudinary pour upload direct KYC.
   */
  @Get('kyc/upload-signature')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async getKycUploadSignature() {
    return this.authService.getKycUploadSignature();
  }

  /**
   * POST /auth/kyc/submit-links — Valide le KYC avec les liens Cloudinary déjà uploadés.
   * Beaucoup plus rapide car pas de transfert de gros fichiers vers le serveur métier.
   */
  @Post('kyc/submit-links')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async submitKycLinks(
    @CurrentUser() user: RequestUser,
    @Body() body: { documentFrontUrl: string; documentBackUrl: string },
  ) {
    return this.authService.submitKycLinks(user, body);
  }

  /**
   * POST /auth/permis/upload — Upload permis de conduire.
   * @deprecated Utilisez l'upload direct vers Cloudinary + /auth/permis/link.
   */
  @Post('permis/upload')
  @UseGuards(JwtAuthGuard)
  @UseFilters(MulterExceptionFilter)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 8 * 1024 * 1024, files: 1 },
    }),
  )
  async uploadPermis(
    @CurrentUser() user: RequestUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    if (!file?.buffer) throw new BadRequestException('Le fichier "file" est requis.');
    return this.authService.uploadPermis(user, file.buffer);
  }

  /**
   * POST /auth/permis/link — Valide le permis avec un lien Cloudinary déjà uploadé en direct.
   * Standard pour les mobiles (plus rapide et évite les limites de payload).
   */
  @Post('permis/link')
  @UseGuards(JwtAuthGuard, AccountStatusGuard)
  async linkPermis(
    @CurrentUser() user: RequestUser,
    @Body() body: { url: string; publicId: string },
  ) {
    return this.authService.linkPermis(user, body);
  }
}
