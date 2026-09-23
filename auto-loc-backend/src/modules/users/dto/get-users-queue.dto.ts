import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';


export enum UserQueueStatusFilter {
  ALL = 'ALL',
  ACTIVE = 'ACTIVE',
  BANNED = 'BANNED',
  PENDING_KYC = 'PENDING_KYC',
  STUCK_ONBOARDING = 'STUCK_ONBOARDING',
}

export class GetUsersQueueDto {
  @IsOptional()
  @IsString()
  role?: string; // RoleProfile | 'ALL'

  @IsOptional()
  @IsEnum(UserQueueStatusFilter)
  status?: UserQueueStatusFilter;

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
