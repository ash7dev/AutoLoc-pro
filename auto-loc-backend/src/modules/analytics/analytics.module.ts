import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AnalyticsController } from './analytics.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdminAnalyticsService } from './admin-analytics.service';
import { AnalyticsAggregationTask } from './analytics-aggregation.task';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, AdminAnalyticsController],
  providers: [AnalyticsService, AdminAnalyticsService, AnalyticsAggregationTask],
  exports: [AnalyticsService, AdminAnalyticsService],
})
export class AnalyticsModule { }
