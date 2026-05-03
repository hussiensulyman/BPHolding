type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

export class InMemoryRateLimiter {
  private readonly records = new Map<string, RateLimitRecord>();

  constructor(
    private readonly maxRequests: number,
    private readonly windowMs: number,
  ) {}

  consume(key: string, currentTime = Date.now()): RateLimitResult {
    const existing = this.records.get(key);

    if (!existing || currentTime >= existing.resetAt) {
      this.records.set(key, { count: 1, resetAt: currentTime + this.windowMs });
      return {
        allowed: true,
        remaining: this.maxRequests - 1,
        retryAfterSeconds: 0,
      };
    }

    if (existing.count >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.ceil((existing.resetAt - currentTime) / 1000),
      };
    }

    existing.count += 1;
    this.records.set(key, existing);

    return {
      allowed: true,
      remaining: this.maxRequests - existing.count,
      retryAfterSeconds: 0,
    };
  }
}