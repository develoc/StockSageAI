interface ApiCallRecord {
  timestamp: number;
  key: string;
}

class RateLimiter {
  private calls: ApiCallRecord[] = [];
  private maxCallsPer24h = 25;
  private maxCallsPerMin = 5;

  private cleanOldCalls() {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000; // 24 hours ago
    this.calls = this.calls.filter(call => call.timestamp > oneDayAgo);
  }

  canMakeCall(apiKey: string): boolean {
    this.cleanOldCalls();
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    // Count calls in the last minute for this key
    const callsLastMinute = this.calls.filter(
      call => call.timestamp > oneMinuteAgo && call.key === apiKey
    ).length;

    // Count calls in the last 24 hours for this key
    const callsLast24h = this.calls.filter(
      call => call.key === apiKey
    ).length;

    return callsLastMinute < this.maxCallsPerMin && callsLast24h < this.maxCallsPer24h;
  }

  recordCall(apiKey: string) {
    this.calls.push({
      timestamp: Date.now(),
      key: apiKey
    });
  }

  getRemainingCalls(apiKey: string): { daily: number; perMinute: number } {
    this.cleanOldCalls();
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;

    const callsLastMinute = this.calls.filter(
      call => call.timestamp > oneMinuteAgo && call.key === apiKey
    ).length;

    const callsLast24h = this.calls.filter(
      call => call.key === apiKey
    ).length;

    return {
      daily: this.maxCallsPer24h - callsLast24h,
      perMinute: this.maxCallsPerMin - callsLastMinute
    };
  }

  clearCallHistory() {
    this.calls = [];
  }
}

export const alphaVantageRateLimiter = new RateLimiter();
