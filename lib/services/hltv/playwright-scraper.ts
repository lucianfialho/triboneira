import { chromium, Browser, Page } from 'playwright';

interface ScrapedMatch {
  id: number;
  team1: { id: number; name: string };
  team2: { id: number; name: string };
  date: Date | null;
  format: string | null;
  event: { id: number; name: string } | null;
  live: boolean;
}

interface ScrapedEvent {
  id: number;
  name: string;
  dateStart: number;
  dateEnd: number | null;
  prizePool: string | null;
  teams: Array<{ id: number; name: string }>;
  location: { name: string; code: string } | null;
  numberOfTeams: number | null;
}

interface ScrapedEventSummary {
  id: number;
  name: string;
  dateStart: number;
  dateEnd: number | null;
}

interface ScrapedNews {
  title: string;
  link: string;
  date: number | null;
}

export class HLTVPlaywrightScraper {
  private browser: Browser | null = null;
  private page: Page | null = null;

  async init(): Promise<void> {
    if (this.browser) return;

    this.browser = await chromium.launch({
      headless: true,
      args: [
        '--disable-blink-features=AutomationControlled',
        '--no-sandbox',
        '--disable-setuid-sandbox'
      ]
    });

    const context = await this.browser.newContext({
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 },
      locale: 'en-US',
    });

    this.page = await context.newPage();
  }

  async reset(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }

  async scrapeMatches(): Promise<ScrapedMatch[]> {
    await this.init();
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔍 Scraping matches from HLTV...');

    await this.page.goto('https://www.hltv.org/matches', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for Cloudflare challenge
    await this.page.waitForTimeout(15000);

    const matches: ScrapedMatch[] = [];

    // Get all match wrappers (live and upcoming)
    const matchWrappers = this.page.locator('.match-wrapper[data-match-wrapper]');
    const count = await matchWrappers.count();

    console.log(`📊 Found ${count} matches on page`);

    for (let i = 0; i < count; i++) {
      try {
        const wrapper = matchWrappers.nth(i);

        // Extract basic data from attributes
        const matchId = await wrapper.getAttribute('data-match-id');
        const eventId = await wrapper.getAttribute('data-event-id');
        const team1Id = await wrapper.getAttribute('team1');
        const team2Id = await wrapper.getAttribute('team2');
        const isLive = (await wrapper.getAttribute('live')) === 'true';

        if (!matchId || !team1Id || !team2Id) continue;

        // Extract team names
        const teamNames = await wrapper.locator('.match-teamname').allTextContents();
        const team1Name = teamNames[0]?.trim() || 'Unknown';
        const team2Name = teamNames[1]?.trim() || 'Unknown';

        // Extract date
        let date: Date | null = null;
        const timeElement = wrapper.locator('.match-time[data-unix]');
        if (await timeElement.count() > 0) {
          const unixTime = await timeElement.getAttribute('data-unix');
          if (unixTime) {
            date = new Date(parseInt(unixTime));
          }
        }

        // Extract format
        const formatElements = await wrapper.locator('.match-meta').allTextContents();
        const format = formatElements.find(text =>
          text.toLowerCase().includes('bo') ||
          text.toLowerCase().includes('best of')
        ) || null;

        // Extract event info
        let event: { id: number; name: string } | null = null;
        const eventElement = wrapper.locator('.match-event');
        if (await eventElement.count() > 0) {
          const eventName = await eventElement.textContent();
          if (eventId && eventName) {
            event = {
              id: parseInt(eventId),
              name: eventName.trim()
            };
          }
        }

        matches.push({
          id: parseInt(matchId),
          team1: {
            id: parseInt(team1Id),
            name: team1Name
          },
          team2: {
            id: parseInt(team2Id),
            name: team2Name
          },
          date,
          format,
          event,
          live: isLive
        });

      } catch (error) {
        console.error(`Error parsing match ${i}:`, error);
      }
    }

    console.log(`✅ Successfully scraped ${matches.length} matches\n`);

    return matches;
  }

  async scrapeEvents(): Promise<ScrapedEventSummary[]> {
    await this.init();
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔍 Scraping events from HLTV...');

    await this.page.goto('https://www.hltv.org/events', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.page.waitForTimeout(20000);

    const events: ScrapedEventSummary[] = [];

    // Get all types of events: ongoing, big, and small
    const eventCards = this.page.locator('.ongoing-event, .big-event, .small-event');
    const count = await eventCards.count();

    console.log(`📊 Found ${count} events on page`);

    for (let i = 0; i < count; i++) {
      try {
        const card = eventCards.nth(i);

        const link = await card.getAttribute('href');
        if (!link) continue;

        const idMatch = link.match(/\/events\/(\d+)\//);
        if (!idMatch) continue;

        const id = parseInt(idMatch[1]);

        // Try different selectors for event name
        let name = 'Unknown';

        // Check for big-event name
        const bigEventNameElement = card.locator('.big-event-name').first();
        if (await bigEventNameElement.count() > 0) {
          const text = await bigEventNameElement.textContent();
          if (text && text.trim()) {
            name = text.trim();
          }
        }

        // If not found, try small-event name
        if (name === 'Unknown') {
          const smallEventNameElement = card.locator('.event-name-small .text-ellipsis').first();
          if (await smallEventNameElement.count() > 0) {
            const text = await smallEventNameElement.textContent();
            if (text && text.trim()) {
              name = text.trim();
            }
          }
        }

        // Try to get dates
        let dateStart = Date.now();
        let dateEnd: number | null = null;

        // Get all data-unix elements
        const dateElements = card.locator('[data-unix]');
        const dateCount = await dateElements.count();

        if (dateCount > 0) {
          const firstDate = await dateElements.nth(0).getAttribute('data-unix');
          if (firstDate) {
            dateStart = parseInt(firstDate);
          }

          if (dateCount > 1) {
            const lastDate = await dateElements.nth(dateCount - 1).getAttribute('data-unix');
            if (lastDate) {
              dateEnd = parseInt(lastDate);
            }
          }
        }

        events.push({
          id,
          name,
          dateStart,
          dateEnd
        });

      } catch (error) {
        console.error(`Error parsing event ${i}:`, error);
      }
    }

    console.log(`✅ Successfully scraped ${events.length} events\n`);

    return events;
  }

  async scrapeEvent(eventId: number): Promise<ScrapedEvent | null> {
    await this.init();
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔍 Scraping event ${eventId} from HLTV...`);

    await this.page.goto(`https://www.hltv.org/events/${eventId}`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.page.waitForTimeout(25000);

    try {
      const name = await this.page.locator('.event-hub-title').textContent() || 'Unknown';

      // Get dates
      let dateStart = Date.now();
      let dateEnd: number | null = null;

      const dateElement = this.page.locator('.eventdate');
      if (await dateElement.count() > 0) {
        const startAttr = await dateElement.getAttribute('data-unix');
        if (startAttr) dateStart = parseInt(startAttr);
      }

      // Get prize pool
      const prizeElement = this.page.locator('.prizepool');
      const prizePool = await prizeElement.count() > 0
        ? await prizeElement.textContent()
        : null;

      // Get location
      let location: { name: string; code: string } | null = null;
      const locationElement = this.page.locator('.location');
      if (await locationElement.count() > 0) {
        const locationText = await locationElement.textContent();
        if (locationText) {
          location = {
            name: locationText.trim(),
            code: ''
          };
        }
      }

      // Get teams
      const teams: Array<{ id: number; name: string }> = [];
      const teamElements = this.page.locator('.team-box');
      const teamCount = await teamElements.count();

      for (let i = 0; i < Math.min(teamCount, 50); i++) {
        const teamEl = teamElements.nth(i);
        const teamLink = await teamEl.locator('a').getAttribute('href');
        const teamName = await teamEl.locator('.team-name, .text-ellipsis').first().textContent();

        if (teamLink && teamName) {
          const teamIdMatch = teamLink.match(/\/team\/(\d+)\//);
          if (teamIdMatch) {
            teams.push({
              id: parseInt(teamIdMatch[1]),
              name: teamName.trim()
            });
          }
        }
      }

      console.log(`✅ Successfully scraped event ${eventId}\n`);

      return {
        id: eventId,
        name: name.trim(),
        dateStart,
        dateEnd,
        prizePool,
        teams,
        location,
        numberOfTeams: teams.length > 0 ? teams.length : null
      };

    } catch (error) {
      console.error(`Error scraping event ${eventId}:`, error);
      return null;
    }
  }

  async scrapeSwissGroupData(eventId: number): Promise<any> {
    await this.init();
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔍 Scraping Swiss group data for event ${eventId}...`);

    // Try main event page first (where Swiss bracket is usually displayed)
    await this.page.goto(`https://www.hltv.org/events/${eventId}/-`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for Cloudflare challenge
    await this.page.waitForTimeout(20000);

    try {
      // Extract BOTH data-group-json attributes:
      // 1. Bracket data (matches/rounds)
      // 2. Standings data (qualificados/eliminados)

      const groupContainers = this.page.locator('[data-group-json]');
      const count = await groupContainers.count();

      if (count === 0) {
        console.log('⚠️  No Swiss group data found on page');
        return null;
      }

      console.log(`📊 Found ${count} data-group-json containers`);

      let bracketData = null;
      let standingsData = null;

      // Extract all data-group-json attributes
      for (let i = 0; i < count; i++) {
        const container = groupContainers.nth(i);
        const groupJsonAttr = await container.getAttribute('data-group-json');

        if (!groupJsonAttr) continue;

        const groupData = JSON.parse(groupJsonAttr);

        // Check if this is bracket data (has groups array with matches)
        if (groupData.groups && Array.isArray(groupData.groups)) {
          bracketData = groupData;
          console.log(`✅ Found bracket data with ${groupData.groups.length} groups`);
        }

        // Check if this is standings data (has structure.groupResults)
        if (groupData.structure?.groupResults) {
          standingsData = groupData;
          console.log(`✅ Found standings data with ${groupData.slotIdToTeamInfo?.length || 0} teams`);
        }
      }

      // Return both types of data
      const result = {
        bracket: bracketData,
        standings: standingsData
      };

      if (!bracketData && !standingsData) {
        console.log('⚠️  No valid Swiss data found');
        return null;
      }

      return result;

    } catch (error) {
      console.error('Error extracting Swiss group data:', error);
      return null;
    }
  }

  async scrapeEventMatches(eventId: number): Promise<ScrapedMatch[]> {
    await this.init();
    if (!this.page) throw new Error('Page not initialized');

    console.log(`🔍 Scraping matches for event ${eventId}...`);

    await this.page.goto(`https://www.hltv.org/events/${eventId}/matches`, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait for Cloudflare challenge
    await this.page.waitForTimeout(15000);

    const matches: ScrapedMatch[] = [];

    // Get all match cards
    const matchCards = this.page.locator('.match');
    const count = await matchCards.count();

    console.log(`📊 Found ${count} match cards on page`);

    for (let i = 0; i < count; i++) {
      try {
        const card = matchCards.nth(i);

        // Extract match ID from link
        const matchLink = card.locator('a[href*="/matches/"]').first();
        if (await matchLink.count() === 0) continue;

        const href = await matchLink.getAttribute('href');
        if (!href) continue;

        const matchIdMatch = href.match(/\/matches\/(\d+)\//);
        if (!matchIdMatch) continue;

        const matchId = parseInt(matchIdMatch[1]);

        // Extract teams
        let team1Name: string | null = null;
        let team2Name: string | null = null;
        let team1Id = 0;
        let team2Id = 0;

        const teamNames = card.locator('.match-teamname');
        const teamCount = await teamNames.count();

        if (teamCount >= 2) {
          // Team 1
          const team1Text = await teamNames.nth(0).textContent();
          if (team1Text) {
            team1Name = team1Text.trim();
          }

          // Team 2
          const team2Text = await teamNames.nth(1).textContent();
          if (team2Text) {
            team2Name = team2Text.trim();
          }
        } else if (teamCount === 1) {
          // Only one team defined, the other is TBD
          const definedTeamText = await teamNames.first().textContent();
          if (definedTeamText) {
            // Check if this is team1 or team2 based on parent class
            const parent = teamNames.first().locator('..');
            const parentClass = await parent.getAttribute('class');
            if (parentClass?.includes('team1')) {
              team1Name = definedTeamText.trim();
              team2Name = 'TBD';
            } else {
              team1Name = 'TBD';
              team2Name = definedTeamText.trim();
            }
          }
        } else {
          // Both teams are TBD
          team1Name = 'TBD';
          team2Name = 'TBD';
        }

        // Skip if we couldn't extract team info
        if (!team1Name && !team2Name) continue;

        // Extract date from match-time
        let matchDate: Date | null = null;
        const timeDiv = card.locator('.match-time[data-unix]');
        if (await timeDiv.count() > 0) {
          const dateAttr = await timeDiv.first().getAttribute('data-unix');
          if (dateAttr) {
            matchDate = new Date(parseInt(dateAttr));
          }
        }

        // Extract format (bo1, bo3, bo5)
        let format: string | null = null;
        const formatDiv = card.locator('.match-meta');
        if (await formatDiv.count() > 0) {
          const formatText = await formatDiv.first().textContent();
          if (formatText) {
            format = formatText.trim().toLowerCase();
          }
        }

        matches.push({
          id: matchId,
          team1: { id: team1Id, name: team1Name || 'TBD' },
          team2: { id: team2Id, name: team2Name || 'TBD' },
          date: matchDate,
          format,
          event: { id: eventId, name: '' },
          live: false
        });

      } catch (error) {
        console.error(`Error parsing match card ${i}:`, error);
      }
    }

    console.log(`✅ Successfully scraped ${matches.length} matches\n`);

    return matches;
  }

  async scrapeNews(): Promise<ScrapedNews[]> {
    await this.init();
    if (!this.page) throw new Error('Page not initialized');

    console.log('🔍 Scraping news from HLTV...');

    await this.page.goto('https://www.hltv.org/', {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    await this.page.waitForTimeout(25000);

    const news: ScrapedNews[] = [];

    const newsCards = this.page.locator('.newsline.article');
    const count = await newsCards.count();

    console.log(`📊 Found ${count} news items on page`);

    for (let i = 0; i < Math.min(count, 50); i++) {
      try {
        const card = newsCards.nth(i);

        const link = await card.getAttribute('href');
        if (!link) continue;

        // Try different selectors for title
        let title = '';

        const normalTitleElement = card.locator('.newstext').first();
        if (await normalTitleElement.count() > 0) {
          const text = await normalTitleElement.textContent();
          if (text && text.trim()) {
            title = text.trim();
          }
        }

        // If not found, try featured news title
        if (!title) {
          const featuredTitleElement = card.locator('.featured-newstext').first();
          if (await featuredTitleElement.count() > 0) {
            const text = await featuredTitleElement.textContent();
            if (text && text.trim()) {
              title = text.trim();
            }
          }
        }

        if (!title) continue;

        // Try to get date
        let date: number | null = null;
        const dateElement = card.locator('.newsrecent');
        if (await dateElement.count() > 0) {
          const dateAttr = await dateElement.getAttribute('data-unix');
          if (dateAttr) {
            date = parseInt(dateAttr);
          }
        }

        news.push({
          title,
          link: link.startsWith('http') ? link : `https://www.hltv.org${link}`,
          date
        });

      } catch (error) {
        console.error(`Error parsing news ${i}:`, error);
      }
    }

    console.log(`✅ Successfully scraped ${news.length} news items\n`);

    return news;
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
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

export async function closePlaywrightScraper(): Promise<void> {
  if (scraperInstance) {
    await scraperInstance.close();
    scraperInstance = null;
  }
}

// Export singleton instance for direct use
export const playwrightScraper = new HLTVPlaywrightScraper();
