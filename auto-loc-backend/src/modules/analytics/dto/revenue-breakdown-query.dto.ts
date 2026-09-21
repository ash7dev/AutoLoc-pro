import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum GroupByPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class RevenueBreakdownQueryDto {
  @IsOptional()
  @IsString()
  startDate?: string;

  @IsOptional()
  @IsString()
  endDate?: string;

  @IsOptional()
  @IsEnum(GroupByPeriod)
  groupBy?: GroupByPeriod = GroupByPeriod.MONTH;

  @IsOptional()
  @IsString()
  timezone?: string = 'Africa/Dakar';
}
