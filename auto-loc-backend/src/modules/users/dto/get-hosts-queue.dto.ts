import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export enum HostQueueStatusFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  PENDING_KYC = 'PENDING_KYC',
  BANNED = 'BANNED',
  STUCK_ONBOARDING = 'STUCK_ONBOARDING',
}

export class GetHostsQueueDto {
  @IsOptional()
  @IsEnum(HostQueueStatusFilter)
  status?: HostQueueStatusFilter;

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
