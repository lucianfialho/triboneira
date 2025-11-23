import { HttpsProxyAgent } from 'https-proxy-agent';

interface ProxyInfo {
  url: string;
  ip: string;
  port: string;
  failures: number;
  lastUsed: Date;
}

/**
 * Manages a rotating pool of free public proxies
 * Fetches proxies from public APIs and rotates between them
 */
export class ProxyManager {
  private proxies: ProxyInfo[] = [];
  private currentIndex = 0;
  private readonly MAX_FAILURES = 3;
  private readonly REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes
  private lastRefresh: Date | null = null;

  constructor() {
    // Auto-refresh proxies on initialization
    this.refreshProxies();
  }

  /**
   * Fetch fresh proxies from public APIs
   */
  async refreshProxies(): Promise<void> {
    console.log('🔄 Fetching fresh proxies...');

    try {
      // Fetch from multiple sources
      const sources = [
        'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
        'https://www.proxy-list.download/api/v1/get?type=https',
        'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt'
      ];

      const newProxies: ProxyInfo[] = [];

      for (const source of sources) {
        try {
          const response = await fetch(source, {
            signal: AbortSignal.timeout(10000)
          });

          if (!response.ok) continue;

          const text = await response.text();
          const lines = text.split('\n').filter(line => line.trim());

          for (const line of lines) {
            const [ip, port] = line.trim().split(':');
            if (ip && port && /^\d+$/.test(port)) {
              newProxies.push({
                url: `http://${ip}:${port}`,
                ip,
                port,
                failures: 0,
                lastUsed: new Date(0)
              });
            }
          }
        } catch (error) {
          console.log(`⚠️  Failed to fetch from ${source}`);
        }
      }

      if (newProxies.length > 0) {
        this.proxies = newProxies;
        this.currentIndex = 0;
        this.lastRefresh = new Date();
        console.log(`✅ Loaded ${this.proxies.length} proxies`);
      } else {
        console.log('❌ No proxies found, keeping existing pool');
      }
    } catch (error) {
      console.error('❌ Error refreshing proxies:', error);
    }
  }

  /**
   * Get next proxy in rotation
   */
  getNextProxy(): HttpsProxyAgent<string> | null {
    // Refresh if needed
    if (
      !this.lastRefresh ||
      Date.now() - this.lastRefresh.getTime() > this.REFRESH_INTERVAL
    ) {
      // Async refresh, don't wait
      this.refreshProxies();
    }

    // Filter out failed proxies
    const workingProxies = this.proxies.filter(
      p => p.failures < this.MAX_FAILURES
    );

    if (workingProxies.length === 0) {
      console.log('⚠️  No working proxies available');
      return null;
    }

    // Round-robin selection
    this.currentIndex = (this.currentIndex + 1) % workingProxies.length;
    const proxy = workingProxies[this.currentIndex];
    proxy.lastUsed = new Date();

    console.log(`🔄 Using proxy: ${proxy.ip}:${proxy.port}`);

    return new HttpsProxyAgent(proxy.url);
  }

  /**
   * Mark proxy as failed
   */
  markProxyFailed(proxyUrl: string): void {
    const proxy = this.proxies.find(p => p.url === proxyUrl);
    if (proxy) {
      proxy.failures++;
      console.log(`❌ Proxy ${proxy.ip}:${proxy.port} failed (${proxy.failures}/${this.MAX_FAILURES})`);

      if (proxy.failures >= this.MAX_FAILURES) {
        console.log(`🗑️  Removing proxy ${proxy.ip}:${proxy.port} from pool`);
      }
    }
  }

  /**
   * Test a proxy by making a request to HLTV
   */
  async testProxy(proxy: HttpsProxyAgent<string>): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch('https://www.hltv.org', {
        // @ts-ignore - agent is valid for node fetch
        agent: proxy,
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });

      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get stats about proxy pool
   */
  getStats(): {
    total: number;
    working: number;
    failed: number;
  } {
    const working = this.proxies.filter(p => p.failures < this.MAX_FAILURES).length;
    return {
      total: this.proxies.length,
      working,
      failed: this.proxies.length - working
    };
  }
}

// Singleton instance
let proxyManagerInstance: ProxyManager | null = null;

export function getProxyManager(): ProxyManager {
  if (!proxyManagerInstance) {
    proxyManagerInstance = new ProxyManager();
  }
  return proxyManagerInstance;
}
