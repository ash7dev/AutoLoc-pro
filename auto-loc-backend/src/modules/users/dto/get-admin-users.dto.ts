import { IsEnum, IsOptional } from 'class-validator';
import { StatutKyc } from '@prisma/client';

export class GetAdminUsersDto {
  @IsOptional()
  @IsEnum(StatutKyc)
  kycStatus?: StatutKyc;
}
