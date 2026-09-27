import { Injectable } from '@nestjs/common';

interface ActiveSession {
  sessionId: string;
  lastSeen: number;
  pageUrl: string;
  city?: string;
}

@Injectable()
export class LiveVisitorsTrackerService {
  private sessions = new Map<string, ActiveSession>();
  private readonly TTL_MS = 60 * 1000; // Exact 60 seconds active window

  recordHeartbeat(sessionId: string, pageUrl?: string, city?: string): void {
    if (!sessionId) return;
    this.sessions.set(sessionId, {
      sessionId,
      lastSeen: Date.now(),
      pageUrl: pageUrl || '/',
      city: city || 'Dakar',
    });
    this.cleanup();
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastSeen > this.TTL_MS) {
        this.sessions.delete(id);
      }
    }
  }

  getLiveStats() {
    this.cleanup();
    const activeSessions = Array.from(this.sessions.values());
    const activeVisitorsCount = activeSessions.length;

    // Group real in-memory active page URLs
    const pageCounts = new Map<string, number>();
    for (const s of activeSessions) {
      const cleanUrl = s.pageUrl.split('?')[0] || '/';
      pageCounts.set(cleanUrl, (pageCounts.get(cleanUrl) || 0) + 1);
    }

    // Group real in-memory active cities
    const cityCounts = new Map<string, number>();
    for (const s of activeSessions) {
      if (s.city) {
        cityCounts.set(s.city, (cityCounts.get(s.city) || 0) + 1);
      }
    }

    const activePages = Array.from(pageCounts.entries())
      .map(([url, count]) => ({ url, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const activeCities = Array.from(cityCounts.entries())
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      activeVisitorsCount,
      activePages,
      activeCities,
      timestamp: new Date().toISOString(),
    };
  }
}
