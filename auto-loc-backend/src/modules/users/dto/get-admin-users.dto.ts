import { IsEnum, IsInt, IsOptional, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutKyc } from '@prisma/client';

export class GetAdminUsersDto {
  @IsOptional()
  @IsEnum(StatutKyc)
  kycStatus?: StatutKyc;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;
}
