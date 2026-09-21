import { IsOptional, IsString, IsUUID } from 'class-validator';

export class OccupancyQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsUUID()
  vehiculeId?: string;
}
