import { chromium, Browser, Page } from 'playwright';

let browser: Browser | null = null;
let page: Page | null = null;

interface SwissRoundData {
  roundNumber: number;
  matches: Array<{
    team1: string;
    team2: string;
    score1?: number;
    score2?: number;
    status: 'upcoming' | 'live' | 'finished';
  }>;
}

interface MatchStatsData {
  team1Name: string;
  team2Name: string;
  maps: Array<{
    name: string;
    score1: number;
    score2: number;
    halfScore1?: number;
    halfScore2?: number;
  }>;
  playerStats?: Array<{
    playerName: string;
    team: string;
    kills: number;
    deaths: number;
    assists: number;
    adr: number;
    kast: number;
    rating: number;
  }>;
}

class HLTVPlaywrightScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init() {
    if (!this.browser) {
      this.browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      this.page = await this.browser.newPage();

      // Set user agent to avoid bot detection
      await this.page.setExtraHTTPHeaders({
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      });
    }
    return this.page!;
  }

  async scrapeSwissData(eventId: number): Promise<SwissRoundData[]> {
    const page = await this.init();
    const url = `https://www.hltv.org/events/${eventId}/StarLadder`;

    try {
      console.log(`🌐 Navigating to: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for Swiss bracket section
      await page.waitForSelector('.swiss-bracket, .matchlist, .event-matches', { timeout: 10000 });

      // Extract Swiss rounds data
      const rounds: SwissRoundData[] = [];

      // Try to find round sections
      const roundElements = await page.$$('.swiss-round, .bracket-round, .matchlist-section');

      for (let i = 0; i < roundElements.length; i++) {
        const roundEl = roundElements[i];

        // Get round matches
        const matchCards = await roundEl.$$('.matchlist-match, .match-card');
        const matches = [];

        for (const matchCard of matchCards) {
          try {
            const team1El = await matchCard.$('.team1-name, .team-name:first-of-type');
            const team2El = await matchCard.$('.team2-name, .team-name:last-of-type');

            const team1 = team1El ? await team1El.textContent() : 'TBD';
            const team2 = team2El ? await team2El.textContent() : 'TBD';

            // Try to get scores
            const score1El = await matchCard.$('.team1-score, .score:first-of-type');
            const score2El = await matchCard.$('.team2-score, .score:last-of-type');

            const score1 = score1El ? parseInt(await score1El.textContent() || '0') : undefined;
            const score2 = score2El ? parseInt(await score2El.textContent() || '0') : undefined;

            // Determine status
            let status: 'upcoming' | 'live' | 'finished' = 'upcoming';
            if (score1 !== undefined && score2 !== undefined) {
              const isLive = await matchCard.$('.live-indicator, .match-live');
              status = isLive ? 'live' : 'finished';
            }

            matches.push({
              team1: team1?.trim() || 'TBD',
              team2: team2?.trim() || 'TBD',
              score1,
              score2,
              status
            });
          } catch (err) {
            console.log('⚠️  Error extracting match data:', err);
          }
        }

        if (matches.length > 0) {
          rounds.push({
            roundNumber: i + 1,
            matches
          });
        }
      }

      console.log(`✅ Found ${rounds.length} Swiss rounds`);
      return rounds;

    } catch (error: any) {
      console.error('❌ Error scraping Swiss data:', error.message);
      throw error;
    }
  }

  async scrapeMatchStats(matchId: number): Promise<MatchStatsData | null> {
    const page = await this.init();
    const url = `https://www.hltv.org/matches/${matchId}/match`;

    try {
      console.log(`🌐 Navigating to match: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      // Wait for main content
      await page.waitForSelector('.match-page, .standard-box', { timeout: 10000 });

      // Extract team names
      const team1El = await page.$('.team1-gradient .teamName, .team .teamName:first-of-type');
      const team2El = await page.$('.team2-gradient .teamName, .team .teamName:last-of-type');

      const team1Name = team1El ? await team1El.textContent() : 'Team 1';
      const team2Name = team2El ? await team2El.textContent() : 'Team 2';

      // Extract maps
      const maps = [];
      const mapElements = await page.$$('.mapholder, .map');

      for (const mapEl of mapElements) {
        const mapNameEl = await mapEl.$('.mapname, .map-name');
        const mapName = mapNameEl ? await mapNameEl.textContent() : 'unknown';

        const score1El = await mapEl.$('.team1-score, .results-team-score:first-of-type');
        const score2El = await mapEl.$('.team2-score, .results-team-score:last-of-type');

        const score1 = score1El ? parseInt(await score1El.textContent() || '0') : 0;
        const score2 = score2El ? parseInt(await score2El.textContent() || '0') : 0;

        // Try to get half scores
        const halfScore1El = await mapEl.$('.results-team-score.results-team-score--ct, .halftime-score:first-of-type');
        const halfScore2El = await mapEl.$('.results-team-score.results-team-score--t, .halftime-score:last-of-type');

        const halfScore1 = halfScore1El ? parseInt(await halfScore1El.textContent() || '0') : undefined;
        const halfScore2 = halfScore2El ? parseInt(await halfScore2El.textContent() || '0') : undefined;

        maps.push({
          name: mapName?.trim() || 'unknown',
          score1,
          score2,
          halfScore1,
          halfScore2
        });
      }

      // Try to extract player stats
      let playerStats = undefined;
      const statsTable = await page.$('.stats-table, .player-stats-table');

      if (statsTable) {
        playerStats = [];
        const rows = await statsTable.$$('tbody tr');

        for (const row of rows) {
          const cells = await row.$$('td');
          if (cells.length < 6) continue;

          const playerNameEl = await cells[0].$('.player-nick, .statsPlayerName');
          const playerName = playerNameEl ? await playerNameEl.textContent() : '';

          playerStats.push({
            playerName: playerName?.trim() || '',
            team: '', // Will be determined from context
            kills: parseInt(await cells[1].textContent() || '0'),
            deaths: parseInt(await cells[2].textContent() || '0'),
            assists: parseInt(await cells[3].textContent() || '0'),
            adr: parseFloat(await cells[4].textContent() || '0'),
            kast: parseFloat(await cells[5].textContent() || '0'),
            rating: parseFloat(await cells[6]?.textContent() || '0')
          });
        }
      }

      return {
        team1Name: team1Name?.trim() || 'Team 1',
        team2Name: team2Name?.trim() || 'Team 2',
        maps,
        playerStats
      };

    } catch (error: any) {
      console.error(`❌ Error scraping match stats for ${matchId}:`, error.message);
      return null;
    }
  }

  async scrapeMatchesForEvent(eventId: number): Promise<any[]> {
    const page = await this.init();
    const url = `https://www.hltv.org/events/${eventId}/matches`;

    try {
      console.log(`🌐 Navigating to event matches: ${url}`);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });

      await page.waitForSelector('.upcoming-matches, .results-holder', { timeout: 10000 });

      const matchCards = await page.$$('.upcoming-match, .result-con');
      const matches = [];

      for (const card of matchCards) {
        const linkEl = await card.$('a');
        const href = linkEl ? await linkEl.getAttribute('href') : null;

        if (href) {
          const matchIdMatch = href.match(/\/matches\/(\d+)\//);
          if (matchIdMatch) {
            matches.push({
              externalId: matchIdMatch[1],
              link: href
            });
          }
        }
      }

      console.log(`✅ Found ${matches.length} matches for event ${eventId}`);
      return matches;

    } catch (error: any) {
      console.error('❌ Error scraping event matches:', error.message);
      return [];
    }
  }

  async close() {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
    console.log('🔒 Playwright browser closed');
  }
}

// Singleton instance
let scraperInstance: HLTVPlaywrightScraper | null = null;

export async function getPlaywrightScraper(): Promise<HLTVPlaywrightScraper> {
  if (!scraperInstance) {
    scraperInstance = new HLTVPlaywrightScraper();
    await scraperInstance.init();
  }
  return scraperInstance;
}

export async function closePlaywrightScraper() {
  if (scraperInstance) {
    await scraperInstance.close();
    scraperInstance = null;
  }
}

// Export singleton for backward compatibility
export const playwrightScraper = {
  async scrapeMatchStats(matchId: number) {
    const scraper = await getPlaywrightScraper();
    return scraper.scrapeMatchStats(matchId);
  },
  async scrapeMatchesForEvent(eventId: number) {
    const scraper = await getPlaywrightScraper();
    return scraper.scrapeMatchesForEvent(eventId);
  }
};
