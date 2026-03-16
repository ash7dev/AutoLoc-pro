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
