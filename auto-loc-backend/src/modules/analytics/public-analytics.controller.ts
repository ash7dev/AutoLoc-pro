import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { LiveVisitorsTrackerService } from './live-visitors-tracker.service';

class HeartbeatDto {
  sessionId?: string;
  pageUrl?: string;
  city?: string;
}

@SkipThrottle()
@Controller('analytics/public')
export class PublicAnalyticsController {
  constructor(private readonly liveTracker: LiveVisitorsTrackerService) {}

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  heartbeat(@Body() body: any) {
    const sessionId = body?.sessionId || body?.id || 'sess_anon';
    const pageUrl = body?.pageUrl || body?.url || '/';
    const city = body?.city || 'Dakar';

    this.liveTracker.recordHeartbeat(sessionId, pageUrl, city);
    return { ok: true };
  }
}
