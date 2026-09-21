import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum SortByFleetMetric {
  REVENUE = 'revenue',
  OCCUPANCY = 'occupancy',
  CONVERSION = 'conversion',
  VIEWS = 'views',
}

export class FleetPerformanceQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(SortByFleetMetric)
  sortBy?: SortByFleetMetric = SortByFleetMetric.REVENUE;
}
