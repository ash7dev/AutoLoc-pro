import { IsEnum, IsOptional, IsString } from 'class-validator';

export enum AdminPeriod {
  DAYS_7 = '7d',
  DAYS_30 = '30d',
  DAYS_90 = '90d',
  MONTHS_12 = '12m',
  YTD = 'ytd',
}

export enum GroupByPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
}

export class AdminAnalyticsQueryDto {
  @IsOptional()
  @IsEnum(AdminPeriod)
  period?: AdminPeriod = AdminPeriod.DAYS_30;

  @IsOptional()
  @IsEnum(GroupByPeriod)
  groupBy?: GroupByPeriod;

  @IsOptional()
  @IsString()
  ville?: string;
}
