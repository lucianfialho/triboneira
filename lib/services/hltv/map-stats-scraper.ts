import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const execPromise = promisify(exec);

interface PlayerMapStats {
  playerName: string;
  playerId: number | null;
  kills: number | null;
  deaths: number | null;
  assists: number | null;
  kdDiff: number | null;
  adr: number | null;
  kast: number | null;
  rating: number | null;
  hsPercentage: number | null;
  flashAssists: number | null;
  impact: number | null;
}

interface TeamMapStats {
  name: string | null;
  players: PlayerMapStats[];
}

export interface MapStats {
  mapStatsId: number;
  matchId: number;
  mapName: string | null;
  team1: TeamMapStats;
  team2: TeamMapStats;
}

/**
 * Scrape player statistics for a specific map using Python curl_cffi scraper
 */
export async function scrapeMapStats(matchId: number, mapStatsId: number): Promise<MapStats | null> {
  const projectRoot = process.cwd();
  const scriptPath = path.join(projectRoot, 'scrapers/hltv_map_stats.py');
  const venvPython = path.join(projectRoot, 'scrapers/venv/bin/python');

  try {
    const { stdout, stderr } = await execPromise(`${venvPython} ${scriptPath} ${matchId} ${mapStatsId}`);

    if (stderr && stderr.includes('Error:')) {
      console.error(`❌ Python scraper error for map stats ${mapStatsId}:`, stderr);
      return null;
    }

    const stats: MapStats = JSON.parse(stdout);
    const totalPlayers = stats.team1.players.length + stats.team2.players.length;
    console.log(`✅ Python scraper fetched stats for map ${mapStatsId} (${totalPlayers} players)`);

    return stats;
  } catch (error: any) {
    console.error(`❌ Python scraper error for map stats ${mapStatsId}:`, error.message);
    if (error.stderr) {
      console.error(`   stderr:`, error.stderr);
    }
    return null;
  }
}
