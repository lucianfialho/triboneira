import { chromium, Browser, Page } from 'playwright';
import * as fs from 'fs';
import * as fsPromises from 'fs/promises';
import * as path from 'path';
import Handlebars from 'handlebars';
import { GeneratedContent, ContentFormat, Platform } from './types';

/**
 * Visual Generator Service
 * Generates actual images/videos for social media posts using Playwright
 */

export interface VisualGeneratorOptions {
  outputDir?: string;
  quality?: number;
  debug?: boolean;
}

export interface GeneratedVisual {
  filePath: string;
  width: number;
  height: number;
  format: 'png' | 'jpeg';
  size: number;
}

export class VisualGenerator {
  private browser: Browser | null = null;
  private outputDir: string;
  private templatesDir: string;
  private quality: number;
  private debug: boolean;

  constructor(options: VisualGeneratorOptions = {}) {
    this.outputDir = options.outputDir || path.join(process.cwd(), 'generated-content');
    this.templatesDir = path.join(__dirname, 'templates', 'html');
    this.quality = options.quality || 95;
    this.debug = options.debug || false;

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Initialize browser with stealth args
   */
  private async initBrowser(): Promise<void> {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: !this.debug,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-infobars',
          '--window-position=0,0',
          '--ignore-certifcate-errors',
          '--ignore-certifcate-errors-spki-list',
          '--disable-blink-features=AutomationControlled', // Critical for bypassing detection
          '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        ]
      });
    }
  }

  /**
   * Close browser
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Get dimensions for platform and format
   */
  private getDimensions(platform: Platform, format: ContentFormat): { width: number; height: number } {
    const dimensions: Record<Platform, Record<ContentFormat, { width: number; height: number }>> = {
      instagram: {
        feed: { width: 1080, height: 1080 },
        story: { width: 1080, height: 1920 },
        reel: { width: 1080, height: 1920 },
        carousel: { width: 1080, height: 1080 },
        tweet: { width: 1200, height: 675 },
        thread: { width: 1200, height: 675 },
      },
      twitter: {
        feed: { width: 1200, height: 675 },
        story: { width: 1080, height: 1920 },
        reel: { width: 1080, height: 1920 },
        carousel: { width: 1200, height: 675 },
        tweet: { width: 1200, height: 675 },
        thread: { width: 1200, height: 675 },
      },
      tiktok: {
        feed: { width: 1080, height: 1920 },
        story: { width: 1080, height: 1920 },
        reel: { width: 1080, height: 1920 },
        carousel: { width: 1080, height: 1920 },
        tweet: { width: 1080, height: 1920 },
        thread: { width: 1080, height: 1920 },
      },
      discord: {
        feed: { width: 1200, height: 675 },
        story: { width: 1200, height: 675 },
        reel: { width: 1200, height: 675 },
        carousel: { width: 1200, height: 675 },
        tweet: { width: 1200, height: 675 },
        thread: { width: 1200, height: 675 },
      },
      telegram: {
        feed: { width: 1200, height: 675 },
        story: { width: 1200, height: 675 },
        reel: { width: 1200, height: 675 },
        carousel: { width: 1200, height: 675 },
        tweet: { width: 1200, height: 675 },
        thread: { width: 1200, height: 675 },
      },
    };

    return dimensions[platform][format];
  }

  /**
   * Generate visual from HTML template
   */
  async generateFromHTML(
    html: string,
    platform: Platform,
    format: ContentFormat,
    fileName: string
  ): Promise<GeneratedVisual> {
    await this.initBrowser();

    if (!this.browser) {
      throw new Error('Failed to initialize browser');
    }

    const page = await this.browser.newPage();

    try {
      const { width, height } = this.getDimensions(platform, format);

      // Set viewport size
      await page.setViewportSize({ width, height });

      // Load HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle',
      });

      // Wait a bit for fonts and images to load
      await page.waitForTimeout(1000);

      // Generate filename
      const timestamp = Date.now();
      const fullFileName = `${fileName}_${timestamp}.png`;
      const filePath = path.join(this.outputDir, fullFileName);

      // Take screenshot
      await page.screenshot({
        path: filePath,
        type: 'png',
        fullPage: false,
      });

      // Get file size
      const stats = fs.statSync(filePath);

      console.log(`✅ Generated visual: ${fullFileName} (${width}x${height}, ${(stats.size / 1024).toFixed(2)} KB)`);

      return {
        filePath,
        width,
        height,
        format: 'png',
        size: stats.size,
      };
    } finally {
      await page.close();
    }
  }

  /**
   * Generate visual from template data
   */
  async generate(
    templateId: string,
    data: Record<string, any>,
    platform: Platform,
    format: ContentFormat
  ): Promise<GeneratedVisual> {
    // Load and render HTML template
    const html = await this.renderTemplate(templateId, data);

    // Generate unique filename
    const fileName = `${templateId.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;

    return await this.generateFromHTML(html, platform, format, fileName);
  }

  /**
   * Convert image URL to base64 using Playwright to bypass protections
   */
  private async imageToBase64(url: string): Promise<string> {
    if (!url) return '';

    // Try to use cached version first
    const cacheDir = path.join(process.cwd(), '..', 'cached-logos');
    const urlHash = Buffer.from(url).toString('base64').replace(/[/+=]/g, '_');
    const cachedPath = path.join(cacheDir, `${urlHash}.cache`);

    try {
      if (fs.existsSync(cachedPath)) {
        console.log(`📁 Using cached logo for ${url.split('/').pop()}`);
        const cached = await fsPromises.readFile(cachedPath, 'utf-8');
        return cached;
      }
    } catch (e) {
      // Cache miss, continue to fetch
    }

    try {
      // Ensure browser is initialized
      await this.initBrowser();

      if (!this.browser) {
        throw new Error('Browser not initialized');
      }

      // Create a new context for the request
      const context = await this.browser.newContext({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
        deviceScaleFactor: 1,
        locale: 'en-US',
      });

      // Add stealth scripts
      await context.addInitScript(() => {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => undefined,
        });
      });

      try {
        const page = await context.newPage();

        // Set extra headers BEFORE any navigation
        await page.setExtraHTTPHeaders({
          'Referer': 'https://www.hltv.org/',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
        });

        // Navigate to home first to establish session/cookies and pass Cloudflare
        try {
          await page.goto('https://www.hltv.org/', { waitUntil: 'domcontentloaded', timeout: 30000 });
          // Wait longer for Cloudflare challenge to resolve
          await page.waitForTimeout(20000);
        } catch (e) {
          console.warn('Navigation to home failed or timed out, trying to proceed anyway...');
        }

        // Navigate directly to the image URL
        // This mimics a user opening the image in a new tab, which often bypasses API-level blocks
        const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });

        if (!response || !response.ok()) {
          console.warn(`Failed to fetch image: ${url} (${response?.status()})`);
          return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==';
        }

        const buffer = await response.body();
        const contentType = response.headers()['content-type'] || 'image/png';
        const base64Data = `data:${contentType};base64,${buffer.toString('base64')}`;

        // Cache the result for future use
        try {
          if (!fs.existsSync(cacheDir)) {
            fs.mkdirSync(cacheDir, { recursive: true });
          }
          await fsPromises.writeFile(cachedPath, base64Data, 'utf-8');
          console.log(`💾 Cached logo for ${url.split('/').pop()}`);
        } catch (cacheError) {
          console.warn('Failed to cache logo:', cacheError);
        }

        return base64Data;
      } finally {
        await context.close();
      }
    } catch (error) {
      console.warn(`Error converting image to base64: ${url}`, error);
      return 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48Y2lyY2xlIGN4PSI1MCIgY3k9IjUwIiByPSI1MCIgZmlsbD0iIzMzMyIvPjwvc3ZnPg==';
    }
  }

  /**
   * Render HTML template with data
   */
  private async renderTemplate(
    templateId: string,
    data: any
  ): Promise<string> {
    // Map template IDs to filenames
    const templateMap: Record<string, string> = {
      'instagram-match-result-feed': 'match-result-feed.html',
      'instagram-match-result-story': 'match-result-story.html',
      'instagram-upset-feed': 'upset-feed.html',
      // Fallback for others or future templates
      'default': 'match-result-feed.html'
    };

    const templateFile = templateMap[templateId] || templateMap['default'];
    const templatePath = path.join(this.templatesDir, templateFile);

    try {
      const templateContent = await fsPromises.readFile(templatePath, 'utf-8');
      const template = Handlebars.compile(templateContent);

      // Prepare data for template
      const preparedData = await this.prepareData(templateId, data);

      return template(preparedData);
    } catch (error) {
      console.error(`Error rendering template ${templateId}:`, error);
      throw error;
    }
  }

  /**
   * Prepare data for specific templates
   */
  private async prepareData(templateId: string, data: any): Promise<any> {
    // Helper to get team initials
    const getInitials = (name: string): string => {
      if (!name) return '??';
      const words = name.split(' ').filter(w => w.length > 0);
      if (words.length === 1) return words[0].substring(0, 3).toUpperCase();
      return words.map(w => w[0]).join('').substring(0, 3).toUpperCase();
    };

    // Add common helpers or data transformation if needed
    const commonData = {
      ...data,
      // Helper to determine winner color
      winnerColor: data.winnerSide === 'left' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.2)', // Default green
      // Add team initials for fallback
      team1Initials: getInitials(data.team1Name),
      team2Initials: getInitials(data.team2Name),
      underdogInitials: getInitials(data.underdogName),
      favoriteInitials: getInitials(data.favoriteName),
    };

    // Convert logos to base64
    if (commonData.team1Logo) commonData.team1Logo = await this.imageToBase64(commonData.team1Logo);
    if (commonData.team2Logo) commonData.team2Logo = await this.imageToBase64(commonData.team2Logo);
    if (commonData.underdogLogo) commonData.underdogLogo = await this.imageToBase64(commonData.underdogLogo);
    if (commonData.favoriteLogo) commonData.favoriteLogo = await this.imageToBase64(commonData.favoriteLogo);

    if (templateId.includes('match-result')) {
      return {
        ...commonData,
        team1Winner: data.winnerSide === 'left',
        team2Winner: data.winnerSide === 'right',
        // Ensure maps have won/lost flags
        maps: data.maps?.map((map: any) => {
          // Parse scores if they are strings "13-10" or numbers
          // Assuming map object has team1Score and team2Score as numbers or strings
          const t1Score = parseInt(String(map.team1Score));
          const t2Score = parseInt(String(map.team2Score));
          return {
            ...map,
            team1Won: t1Score > t2Score,
            team2Won: t2Score > t1Score
          };
        })
      };
    }

    if (templateId.includes('upset')) {
      // Map upset level to background color
      const intensityColors: Record<string, string> = {
        minor: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
        moderate: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
        major: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
        massive: 'linear-gradient(135deg, #7c2d12 0%, #431407 100%)',
      };

      return {
        ...commonData,
        backgroundColor: intensityColors[data.upsetLevel] || intensityColors.moderate
      };
    }

    return commonData;
  }
}

// Global instance
let globalGenerator: VisualGenerator | null = null;

export function getVisualGenerator(options?: VisualGeneratorOptions): VisualGenerator {
  if (!globalGenerator) {
    globalGenerator = new VisualGenerator(options);
  }
  return globalGenerator;
}

// Cleanup on process exit
process.on('exit', () => {
  if (globalGenerator) {
    globalGenerator.close();
  }
});
