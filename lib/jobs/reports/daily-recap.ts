import { db } from '../../db/client';
import { matches, playerMatchStats, teams, events } from '../../db/schema';
import { gte, lte, eq, and, desc } from 'drizzle-orm';
import { detectRecentUpsets, detectOvertimes, detectEpicSeries } from '../analysis/detect-upsets';

export interface DailyRecap {
  date: Date;
  summary: {
    totalMatches: number;
    totalEvents: number;
    totalUpsets: number;
    totalOvertimes: number;
    epicSeries: number;
  };
  matches: Array<{
    id: number;
    externalId: string;
    team1: { id: number | null; name: string };
    team2: { id: number | null; name: string };
    winner: { id: number | null; name: string } | null;
    score: { team1: number | null; team2: number | null };
    event: { name: string } | null;
    isUpset: boolean;
    hadOvertime: boolean;
    isEpicSeries: boolean;
  }>;
  topPerformances: Array<{
    player: { id: number; nickname: string };
    team: { id: number | null; name: string };
    match: { id: number; externalId: string };
    stats: {
      kills: number | null;
      deaths: number | null;
      assists: number | null;
      rating: string | null;
      adr: string | null;
    };
  }>;
  upsets: Array<{
    matchId: number;
    favorite: { name: string; rank: number | null };
    underdog: { name: string; rank: number | null };
    rankDifference: number;
    upsetLevel: string;
  }>;
}

/**
 * Generate a daily recap for a specific date
 */
export async function generateDailyRecap(date: Date = new Date()): Promise<DailyRecap> {
  // Set to yesterday (since recap runs at end of day)
  const targetDate = new Date(date);
  targetDate.setDate(targetDate.getDate() - 1);

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  console.log(`📊 Generating daily recap for ${targetDate.toDateString()}...\n`);

  // Get all finished matches from that day
  const dayMatches = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.status, 'finished'),
        gte(matches.date, startOfDay),
        lte(matches.date, endOfDay)
      )
    )
    .orderBy(desc(matches.date));

  console.log(`   Found ${dayMatches.length} finished matches`);

  // Get event names for matches
  const matchesWithDetails = await Promise.all(
    dayMatches.map(async (match) => {
      let team1Name = 'TBD';
      let team2Name = 'TBD';
      let winnerName = null;
      let eventName = null;

      if (match.team1Id) {
        const [team1] = await db.select().from(teams).where(eq(teams.id, match.team1Id));
        if (team1) team1Name = team1.name;
      }

      if (match.team2Id) {
        const [team2] = await db.select().from(teams).where(eq(teams.id, match.team2Id));
        if (team2) team2Name = team2.name;
      }

      if (match.winnerId) {
        const [winner] = await db.select().from(teams).where(eq(teams.id, match.winnerId));
        if (winner) winnerName = winner.name;
      }

      if (match.eventId) {
        const [event] = await db.select().from(events).where(eq(events.id, match.eventId));
        if (event) eventName = event.name;
      }

      return {
        ...match,
        team1Name,
        team2Name,
        winnerName,
        eventName,
      };
    })
  );

  // Detect upsets from the day
  console.log(`   Detecting upsets...`);
  const upsets = await detectRecentUpsets(1, 10); // Last day, min rank diff 10
  console.log(`   Found ${upsets.length} upsets`);

  // Detect overtimes and epic series
  console.log(`   Analyzing match quality...`);
  let overtimeCount = 0;
  let epicSeriesCount = 0;

  const matchAnalysis = await Promise.all(
    dayMatches.map(async (match) => {
      const overtime = await detectOvertimes(match.id);
      const epicSeries = await detectEpicSeries(match.id);

      if (overtime) overtimeCount++;
      if (epicSeries) epicSeriesCount++;

      return {
        matchId: match.id,
        hadOvertime: !!overtime,
        isEpicSeries: !!epicSeries,
      };
    })
  );

  console.log(`   Found ${overtimeCount} matches with overtime`);
  console.log(`   Found ${epicSeriesCount} epic series`);

  // Get top player performances from the day
  console.log(`   Finding top performances...`);
  const topPerformances = await db
    .select({
      id: playerMatchStats.id,
      playerId: playerMatchStats.playerId,
      teamId: playerMatchStats.teamId,
      matchId: playerMatchStats.matchId,
      kills: playerMatchStats.kills,
      deaths: playerMatchStats.deaths,
      assists: playerMatchStats.assists,
      rating: playerMatchStats.rating,
      adr: playerMatchStats.adr,
    })
    .from(playerMatchStats)
    .where(
      and(
        // Only from matches that happened today
        // We'll need to join with matches to filter by date
      )
    )
    .orderBy(desc(playerMatchStats.rating))
    .limit(10);

  // Filter to only performances from today's matches
  const matchIds = new Set(dayMatches.map(m => m.id));
  const topPerformancesFiltered = topPerformances.filter(p => matchIds.has(p.matchId));

  // Enrich top performances with player and team data
  const enrichedPerformances = await Promise.all(
    topPerformancesFiltered.slice(0, 5).map(async (perf) => {
      const [player] = await db
        .select()
        .from(db.select().from(playerMatchStats))
        .where(eq(playerMatchStats.id, perf.id));

      // Get player details
      const [playerDetails] = await db.query.players.findMany({
        where: (players, { eq }) => eq(players.id, perf.playerId),
      });

      // Get team details
      let teamName = 'Unknown';
      if (perf.teamId) {
        const [team] = await db.select().from(teams).where(eq(teams.id, perf.teamId));
        if (team) teamName = team.name;
      }

      // Get match details
      const [match] = await db.select().from(matches).where(eq(matches.id, perf.matchId));

      return {
        player: {
          id: perf.playerId,
          nickname: playerDetails?.nickname || 'Unknown',
        },
        team: {
          id: perf.teamId,
          name: teamName,
        },
        match: {
          id: perf.matchId,
          externalId: match?.externalId || '',
        },
        stats: {
          kills: perf.kills,
          deaths: perf.deaths,
          assists: perf.assists,
          rating: perf.rating,
          adr: perf.adr,
        },
      };
    })
  );

  console.log(`   Found ${enrichedPerformances.length} top performances\n`);

  // Get unique events from matches
  const uniqueEventIds = new Set(
    dayMatches.filter(m => m.eventId).map(m => m.eventId)
  );

  // Build final recap
  const recap: DailyRecap = {
    date: targetDate,
    summary: {
      totalMatches: dayMatches.length,
      totalEvents: uniqueEventIds.size,
      totalUpsets: upsets.length,
      totalOvertimes: overtimeCount,
      epicSeries: epicSeriesCount,
    },
    matches: matchesWithDetails.map((match) => {
      const analysis = matchAnalysis.find(a => a.matchId === match.id);
      const isUpset = upsets.some(u => u.matchId === match.id);

      return {
        id: match.id,
        externalId: match.externalId,
        team1: { id: match.team1Id, name: match.team1Name },
        team2: { id: match.team2Id, name: match.team2Name },
        winner: match.winnerId ? { id: match.winnerId, name: match.winnerName! } : null,
        score: { team1: match.scoreTeam1, team2: match.scoreTeam2 },
        event: match.eventName ? { name: match.eventName } : null,
        isUpset,
        hadOvertime: analysis?.hadOvertime || false,
        isEpicSeries: analysis?.isEpicSeries || false,
      };
    }),
    topPerformances: enrichedPerformances,
    upsets: upsets.map(u => ({
      matchId: u.matchId,
      favorite: { name: u.favorite.name, rank: u.favorite.rank },
      underdog: { name: u.underdog.name, rank: u.underdog.rank },
      rankDifference: u.rankDifference,
      upsetLevel: u.upsetLevel,
    })),
  };

  console.log(`✅ Daily recap generated successfully`);
  console.log(`📊 Summary:`);
  console.log(`   ${recap.summary.totalMatches} matches`);
  console.log(`   ${recap.summary.totalEvents} events`);
  console.log(`   ${recap.summary.totalUpsets} upsets`);
  console.log(`   ${recap.summary.totalOvertimes} overtimes`);
  console.log(`   ${recap.summary.epicSeries} epic series`);
  console.log(`   ${recap.topPerformances.length} top performances\n`);

  return recap;
}
