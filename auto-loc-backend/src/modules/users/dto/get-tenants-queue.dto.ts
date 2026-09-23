import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum TenantQueueStatusFilter {
  ALL = 'ALL',
  VERIFIED = 'VERIFIED',
  PENDING_PERMIS = 'PENDING_PERMIS',
  RISK_WARNING = 'RISK_WARNING',
  BANNED = 'BANNED',
}

export class GetTenantsQueueDto {
  @IsOptional()
  @IsEnum(TenantQueueStatusFilter)
  status?: TenantQueueStatusFilter;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}
