import { AdaptiveRateLimiter } from './rate-limiter';

export interface FetchOptions {
  maxRetries?: number;
  retryDelay?: number;
  timeout?: number;
}

export class CloudflareBlockedError extends Error {
  constructor(message: string = 'Request blocked by Cloudflare') {
    super(message);
    this.name = 'CloudflareBlockedError';
  }
}

/**
 * Base Fetcher with rate limiting, retry logic, and error handling
 */
export class BaseFetcher {
  private rateLimiter: AdaptiveRateLimiter;

  constructor(championshipMode: boolean = false) {
    this.rateLimiter = new AdaptiveRateLimiter(championshipMode);
  }

  /**
   * Execute a function with rate limiting and retry logic
   */
  async fetch<T>(
    fn: () => Promise<T>,
    options: FetchOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 5000,
      timeout = 30000,
    } = options;

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Apply rate limiting
        await this.rateLimiter.throttle();

        // Execute with timeout
        const result = await this.withTimeout(fn(), timeout);

        // Reset rate limiter on success
        this.rateLimiter.resetInterval();

        return result;
      } catch (error: any) {
        lastError = error;

        // Check for Cloudflare block
        if (this.isCloudflareError(error)) {
          console.error('🚫 Cloudflare block detected');
          this.rateLimiter.increaseInterval();

          if (attempt < maxRetries) {
            console.log(`⏳ Waiting ${retryDelay}ms before retry (attempt ${attempt + 1}/${maxRetries})`);
            await this.sleep(retryDelay);
            continue;
          }

          throw new CloudflareBlockedError(error.message);
        }

        // Check for timeout
        if (error.name === 'TimeoutError') {
          console.error('⏱️  Request timeout');
          if (attempt < maxRetries) {
            await this.sleep(retryDelay);
            continue;
          }
        }

        // Other errors - retry if attempts remain
        if (attempt < maxRetries) {
          console.warn(`⚠️  Error on attempt ${attempt + 1}/${maxRetries}: ${error.message}`);
          await this.sleep(retryDelay);
          continue;
        }

        // Max retries reached
        throw error;
      }
    }

    throw lastError || new Error('Max retries reached');
  }

  /**
   * Check if error is from Cloudflare
   */
  private isCloudflareError(error: any): boolean {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorString = error.toString?.()?.toLowerCase() || '';

    return (
      errorMessage.includes('cloudflare') ||
      errorMessage.includes('access denied') ||
      errorMessage.includes('403') ||
      errorString.includes('cloudflare') ||
      error.status === 403 ||
      error.statusCode === 403
    );
  }

  /**
   * Execute function with timeout
   */
  private withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => {
          const error = new Error(`Request timeout after ${timeoutMs}ms`);
          error.name = 'TimeoutError';
          reject(error);
        }, timeoutMs)
      ),
    ]);
  }

  /**
   * Sleep utility
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update rate limiter mode
   */
  setChampionshipMode(enabled: boolean): void {
    this.rateLimiter.resetInterval(enabled);
  }
}
