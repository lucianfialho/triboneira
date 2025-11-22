/**
 * Adaptive Rate Limiter
 * Adjusts request intervals based on championship mode and handles backoff on errors
 */
export class AdaptiveRateLimiter {
  private lastRequest: number = 0;
  private interval: number;
  private readonly baseInterval: number;
  private readonly championshipInterval: number;
  private readonly maxInterval: number = 10000; // 10s max backoff

  constructor(championshipMode: boolean = false) {
    this.championshipInterval = 1000; // 1s for championship mode
    this.baseInterval = 2000; // 2s for normal mode
    this.interval = championshipMode ? this.championshipInterval : this.baseInterval;
  }

  /**
   * Wait before making next request
   */
  async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequest;

    if (elapsed < this.interval) {
      const waitTime = this.interval - elapsed;
      await this.sleep(waitTime);
    }

    this.lastRequest = Date.now();
  }

  /**
   * Increase interval on error (exponential backoff)
   */
  increaseInterval(): void {
    this.interval = Math.min(this.interval * 1.5, this.maxInterval);
    console.log(`⚠️  Rate limit increased to ${this.interval}ms`);
  }

  /**
   * Reset interval to base value
   */
  resetInterval(championshipMode: boolean = false): void {
    this.interval = championshipMode ? this.championshipInterval : this.baseInterval;
  }

  /**
   * Get current interval
   */
  getCurrentInterval(): number {
    return this.interval;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Global rate limiter instance
 */
let globalRateLimiter: AdaptiveRateLimiter | null = null;

export function getRateLimiter(championshipMode: boolean = false): AdaptiveRateLimiter {
  if (!globalRateLimiter) {
    globalRateLimiter = new AdaptiveRateLimiter(championshipMode);
  }
  return globalRateLimiter;
}

export function resetRateLimiter(): void {
  globalRateLimiter = null;
}
