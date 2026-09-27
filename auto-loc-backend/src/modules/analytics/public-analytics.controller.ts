import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { LiveVisitorsTrackerService } from './live-visitors-tracker.service';

class HeartbeatDto {
  sessionId!: string;
  pageUrl?: string;
  city?: string;
}

@Controller('analytics/public')
export class PublicAnalyticsController {
  constructor(private readonly liveTracker: LiveVisitorsTrackerService) {}

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  heartbeat(@Body() body: HeartbeatDto) {
    this.liveTracker.recordHeartbeat(body.sessionId, body.pageUrl, body.city);
    return { ok: true };
  }
}
