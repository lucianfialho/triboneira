import { HLTV } from 'hltv';
import { BaseFetcher } from '../core/base-fetcher';
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
      return events as HLTVEvent[];
    });
  }

  /**
   * Get event details by ID
   */
  async getEvent(id: number): Promise<HLTVEvent> {
    return this.fetcher.fetch(async () => {
      const event = await HLTV.getEvent({ id });
      return event as HLTVEvent;
    });
  }

  /**
   * Get matches with optional filters
   */
  async getMatches(options?: {
    eventIds?: number[];
    teamIds?: number[];
  }): Promise<HLTVMatch[]> {
    return this.fetcher.fetch(async () => {
      const matches = await HLTV.getMatches(options);
      return matches as HLTVMatch[];
    });
  }

  /**
   * Get match details by ID
   */
  async getMatch(id: number): Promise<HLTVMatch> {
    return this.fetcher.fetch(async () => {
      const match = await HLTV.getMatch({ id });
      return match as HLTVMatch;
    });
  }

  /**
   * Get match statistics
   */
  async getMatchStats(id: number): Promise<HLTVMatchStats> {
    return this.fetcher.fetch(async () => {
      const stats = await HLTV.getMatchStats({ id });
      return stats as HLTVMatchStats;
    }, { timeout: 45000 }); // Longer timeout for stats
  }

  /**
   * Get team details
   */
  async getTeam(id: number): Promise<HLTVTeam & { players?: HLTVPlayer[] }> {
    return this.fetcher.fetch(async () => {
      const team = await HLTV.getTeam({ id });
      return team as HLTVTeam & { players?: HLTVPlayer[] };
    });
  }

  /**
   * Get team by name
   */
  async getTeamByName(name: string): Promise<HLTVTeam> {
    return this.fetcher.fetch(async () => {
      const team = await HLTV.getTeamByName({ name });
      return team as HLTVTeam;
    });
  }

  /**
   * Get player details
   */
  async getPlayer(id: number): Promise<HLTVPlayer> {
    return this.fetcher.fetch(async () => {
      const player = await HLTV.getPlayer({ id });
      return player as HLTVPlayer;
    });
  }

  /**
   * Get team ranking
   */
  async getTeamRanking(): Promise<HLTVTeam[]> {
    return this.fetcher.fetch(async () => {
      const ranking = await HLTV.getTeamRanking();
      return ranking as HLTVTeam[];
    });
  }

  /**
   * Get news
   */
  async getNews(): Promise<HLTVNews[]> {
    return this.fetcher.fetch(async () => {
      const news = await HLTV.getNews();
      return news.slice(0, 50) as HLTVNews[]; // Limit to 50 most recent
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
