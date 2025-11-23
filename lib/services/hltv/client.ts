import { HLTV } from 'hltv';
import { BaseFetcher } from '../core/base-fetcher';
import { getPlaywrightScraper, closePlaywrightScraper } from './playwright-scraper';
import type {
  HLTVEvent,
  HLTVMatch,
  HLTVTeam,
  HLTVPlayer,
  HLTVNews,
  HLTVMatchStats,
} from '../../../types/hltv';

/**
 * HLTV Client
 * Wrapper around the HLTV library with rate limiting and error handling
 */
export class HLTVClient {
  private fetcher: BaseFetcher;

  constructor(championshipMode: boolean = false) {
    this.fetcher = new BaseFetcher(championshipMode);
  }

  /**
   * Get all events
   */
  async getEvents(): Promise<HLTVEvent[]> {
    return this.fetcher.fetch(async () => {
      const events = await HLTV.getEvents();
      return events as unknown as HLTVEvent[];
    });
  }

  /**
   * Get event details by ID
   */
  async getEvent(id: number): Promise<HLTVEvent> {
    return this.fetcher.fetch(async () => {
      const event = await HLTV.getEvent({ id });
      return event as unknown as HLTVEvent;
    });
  }

  /**
   * Get matches with optional filters
   * Using Playwright scraper to bypass Cloudflare
   */
  async getMatches(options?: {
    eventIds?: number[];
    teamIds?: number[];
  }): Promise<HLTVMatch[]> {
    return this.fetcher.fetch(async () => {
      console.log('🎭 Using Playwright scraper to fetch matches...');

      const scraper = await getPlaywrightScraper();
      const scrapedMatches = await scraper.scrapeMatches();

      // Convert scraped matches to HLTV format
      const matches: HLTVMatch[] = scrapedMatches.map(match => ({
        id: match.id,
        team1: {
          id: match.team1.id,
          name: match.team1.name,
        },
        team2: {
          id: match.team2.id,
          name: match.team2.name,
        },
        date: match.date ? match.date.getTime() : undefined,
        format: match.format || undefined,
        event: match.event ? {
          id: match.event.id,
          name: match.event.name,
        } : undefined,
        live: match.live,
        stars: 0,
        result: undefined,
        stats: undefined,
      }));

      // Filter by eventIds if provided
      let filteredMatches = matches;
      if (options?.eventIds && options.eventIds.length > 0) {
        filteredMatches = matches.filter(match =>
          match.event && options.eventIds!.includes(match.event.id)
        );
      }

      // Filter by teamIds if provided
      if (options?.teamIds && options.teamIds.length > 0) {
        filteredMatches = filteredMatches.filter(match =>
          (match.team1 && options.teamIds!.includes(match.team1.id)) ||
          (match.team2 && options.teamIds!.includes(match.team2.id))
        );
      }

      console.log(`✅ Playwright scraper returned ${filteredMatches.length} matches (filtered from ${matches.length})`);

      return filteredMatches as unknown as HLTVMatch[];
    });
  }

  /**
   * Get match details by ID
   */
  async getMatch(id: number): Promise<HLTVMatch> {
    return this.fetcher.fetch(async () => {
      const match = await HLTV.getMatch({ id });
      return match as unknown as HLTVMatch;
    });
  }

  /**
   * Get match statistics
   */
  async getMatchStats(id: number): Promise<HLTVMatchStats> {
    return this.fetcher.fetch(async () => {
      const stats = await HLTV.getMatchStats({ id });
      return stats as unknown as HLTVMatchStats;
    }, { timeout: 45000 }); // Longer timeout for stats
  }

  /**
   * Get team details
   */
  async getTeam(id: number): Promise<HLTVTeam & { players?: HLTVPlayer[] }> {
    return this.fetcher.fetch(async () => {
      const team = await HLTV.getTeam({ id });
      return team as unknown as HLTVTeam & { players?: HLTVPlayer[] };
    });
  }

  /**
   * Get team by name
   */
  async getTeamByName(name: string): Promise<HLTVTeam> {
    return this.fetcher.fetch(async () => {
      const team = await HLTV.getTeamByName({ name });
      return team as unknown as HLTVTeam;
    });
  }

  /**
   * Get player details
   */
  async getPlayer(id: number): Promise<HLTVPlayer> {
    return this.fetcher.fetch(async () => {
      const player = await HLTV.getPlayer({ id });
      return player as unknown as HLTVPlayer;
    });
  }

  /**
   * Get team ranking
   */
  async getTeamRanking(): Promise<HLTVTeam[]> {
    return this.fetcher.fetch(async () => {
      const ranking = await HLTV.getTeamRanking();
      return ranking as unknown as HLTVTeam[];
    });
  }

  /**
   * Get news
   */
  async getNews(): Promise<HLTVNews[]> {
    return this.fetcher.fetch(async () => {
      const news = await HLTV.getNews();
      return news.slice(0, 50) as unknown as HLTVNews[]; // Limit to 50 most recent
    });
  }

  /**
   * Enable/disable championship mode
   */
  setChampionshipMode(enabled: boolean): void {
    this.fetcher.setChampionshipMode(enabled);
  }
}

/**
 * Global HLTV client instance
 */
let globalHLTVClient: HLTVClient | null = null;

export function getHLTVClient(championshipMode: boolean = false): HLTVClient {
  if (!globalHLTVClient) {
    globalHLTVClient = new HLTVClient(championshipMode);
  }
  return globalHLTVClient;
}

export function resetHLTVClient(): void {
  globalHLTVClient = null;
}
