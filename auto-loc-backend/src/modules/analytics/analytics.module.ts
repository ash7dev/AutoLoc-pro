import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { AnalyticsController } from './analytics.controller';
import { AdminAnalyticsController } from './admin-analytics.controller';
import { PublicAnalyticsController } from './public-analytics.controller';
import { AnalyticsService } from './analytics.service';
import { AdminAnalyticsService } from './admin-analytics.service';
import { LiveVisitorsTrackerService } from './live-visitors-tracker.service';
import { AnalyticsAggregationTask } from './analytics-aggregation.task';

@Module({
  imports: [PrismaModule],
  controllers: [AnalyticsController, AdminAnalyticsController, PublicAnalyticsController],
  providers: [AnalyticsService, AdminAnalyticsService, LiveVisitorsTrackerService, AnalyticsAggregationTask],
  exports: [AnalyticsService, AdminAnalyticsService, LiveVisitorsTrackerService],
})
export class AnalyticsModule { }

