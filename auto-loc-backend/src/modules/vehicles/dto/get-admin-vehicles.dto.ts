import { IsIn, IsOptional } from 'class-validator';
import { StatutVehicule } from '@prisma/client';

export class GetAdminVehiclesDto {
  @IsOptional()
  @IsIn([...Object.values(StatutVehicule), 'PENDING'])
  statut?: StatutVehicule | 'PENDING';
}
