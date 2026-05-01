import { IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class FeatureVehicleDto {
  @IsBoolean()
  active!: boolean;

  @IsOptional()
  @IsDateString()
  featuredUntil?: string;
}
