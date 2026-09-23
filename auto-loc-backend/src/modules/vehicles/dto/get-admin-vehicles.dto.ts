import { IsIn, IsOptional, IsPositive, IsInt } from 'class-validator';
import { Type } from 'class-transformer';
import { StatutVehicule } from '@prisma/client';

export class GetAdminVehiclesDto {
  @IsOptional()
  @IsIn([...Object.values(StatutVehicule), 'PENDING'])
  statut?: StatutVehicule | 'PENDING';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number;
}

export class GetVehicleModerationQueueDto {
  @IsOptional()
  @IsIn([...Object.values(StatutVehicule), 'PENDING', 'ALL'])
  statut?: StatutVehicule | 'PENDING' | 'ALL';

  @IsOptional()
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  limit?: number = 20;
}

