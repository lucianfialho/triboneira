import { db } from '../../db/client';
import { matches, teams } from '../../db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export interface UpsetDetection {
  matchId: number;
  matchExternalId: string;
  isUpset: boolean;
  rankDifference: number;
  favorite: {
    id: number;
    name: string;
    rank: number | null;
  };
  underdog: {
    id: number;
    name: string;
    rank: number | null;
  };
  winner: {
    id: number;
    name: string;
    rank: number | null;
  };
  score: {
    team1: number | null;
    team2: number | null;
  };
  upsetLevel: 'minor' | 'moderate' | 'major' | 'massive';
}

/**
 * Detect if a match result is an upset based on team rankings
 */
export async function detectUpset(matchId: number): Promise<UpsetDetection | null> {
  // Get match with teams
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!match) {
    return null;
  }

  // Must be finished match with winner and both teams
  if (match.status !== 'finished' || !match.winnerId || !match.team1Id || !match.team2Id) {
    return null;
  }

  // Get team details
  const [team1] = await db.select().from(teams).where(eq(teams.id, match.team1Id));
  const [team2] = await db.select().from(teams).where(eq(teams.id, match.team2Id));
  const [winner] = await db.select().from(teams).where(eq(teams.id, match.winnerId));

  if (!team1 || !team2 || !winner) {
    return null;
  }

  // Both teams must have ranks to determine upset
  if (!team1.rank || !team2.rank) {
    return null;
  }

  // Determine favorite (lower rank number = better team)
  const favorite = team1.rank < team2.rank ? team1 : team2;
  const underdog = team1.rank < team2.rank ? team2 : team1;

  const rankDifference = Math.abs(team1.rank - team2.rank);
  const isUpset = winner.id === underdog.id;

  // Determine upset level based on rank difference
  let upsetLevel: 'minor' | 'moderate' | 'major' | 'massive';
  if (rankDifference >= 20) {
    upsetLevel = 'massive';
  } else if (rankDifference >= 15) {
    upsetLevel = 'major';
  } else if (rankDifference >= 10) {
    upsetLevel = 'moderate';
  } else {
    upsetLevel = 'minor';
  }

  return {
    matchId: match.id,
    matchExternalId: match.externalId,
    isUpset,
    rankDifference,
    favorite: {
      id: favorite.id,
      name: favorite.name,
      rank: favorite.rank,
    },
    underdog: {
      id: underdog.id,
      name: underdog.name,
      rank: underdog.rank,
    },
    winner: {
      id: winner.id,
      name: winner.name,
      rank: winner.rank,
    },
    score: {
      team1: match.scoreTeam1,
      team2: match.scoreTeam2,
    },
    upsetLevel,
  };
}

/**
 * Detect all upsets from recent matches
 */
export async function detectRecentUpsets(days: number = 7, minRankDiff: number = 10): Promise<UpsetDetection[]> {
  const since = new Date();
  since.setDate(since.getDate() - days);

  // Get recent finished matches
  const recentMatches = await db
    .select()
    .from(matches)
    .where(
      and(
        eq(matches.status, 'finished'),
        gte(matches.date, since)
      )
    )
    .orderBy(desc(matches.date));

  const upsets: UpsetDetection[] = [];

  for (const match of recentMatches) {
    try {
      const detection = await detectUpset(match.id);

      if (detection && detection.isUpset && detection.rankDifference >= minRankDiff) {
        upsets.push(detection);
      }
    } catch (error) {
      console.error(`Error detecting upset for match ${match.id}:`, error);
    }
  }

  return upsets;
}

/**
 * Detect overtimes in recent matches
 */
export interface OvertimeDetection {
  matchId: number;
  matchExternalId: string;
  team1: {
    id: number | null;
    name: string;
  };
  team2: {
    id: number | null;
    name: string;
  };
  maps: Array<{
    mapNumber: number;
    mapName: string | null;
    team1Score: number | null;
    team2Score: number | null;
    wentToOvertime: boolean;
    finalScore: string;
  }>;
  totalOvertimes: number;
}

export async function detectOvertimes(matchId: number): Promise<OvertimeDetection | null> {
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!match || match.status !== 'finished') {
    return null;
  }

  // Parse maps from JSONB
  const maps = match.maps as any[];
  if (!maps || maps.length === 0) {
    return null;
  }

  // Check each map for overtime (score >= 16 for either team in CS2)
  const overtimeMaps = maps.map((map, index) => {
    const team1Score = map.team1Score || 0;
    const team2Score = map.team2Score || 0;
    const wentToOvertime = team1Score >= 16 || team2Score >= 16;

    return {
      mapNumber: index + 1,
      mapName: map.mapName || map.name || null,
      team1Score,
      team2Score,
      wentToOvertime,
      finalScore: `${team1Score}-${team2Score}`,
    };
  });

  const totalOvertimes = overtimeMaps.filter(m => m.wentToOvertime).length;

  if (totalOvertimes === 0) {
    return null;
  }

  // Get team names
  let team1Name = 'Team 1';
  let team2Name = 'Team 2';

  if (match.team1Id) {
    const [team1] = await db.select().from(teams).where(eq(teams.id, match.team1Id));
    if (team1) team1Name = team1.name;
  }

  if (match.team2Id) {
    const [team2] = await db.select().from(teams).where(eq(teams.id, match.team2Id));
    if (team2) team2Name = team2.name;
  }

  return {
    matchId: match.id,
    matchExternalId: match.externalId,
    team1: {
      id: match.team1Id,
      name: team1Name,
    },
    team2: {
      id: match.team2Id,
      name: team2Name,
    },
    maps: overtimeMaps,
    totalOvertimes,
  };
}

/**
 * Detect epic series (close Bo3/Bo5 matches)
 */
export interface EpicSeriesDetection {
  matchId: number;
  matchExternalId: string;
  team1: {
    id: number | null;
    name: string;
  };
  team2: {
    id: number | null;
    name: string;
  };
  format: string | null;
  finalScore: {
    team1: number | null;
    team2: number | null;
  };
  wentToFinalMap: boolean;
  closeMaps: number; // Number of maps with <= 3 round difference
  totalMaps: number;
  averageRoundDifference: number;
  hadOvertime: boolean;
}

export async function detectEpicSeries(matchId: number): Promise<EpicSeriesDetection | null> {
  const [match] = await db
    .select()
    .from(matches)
    .where(eq(matches.id, matchId));

  if (!match || match.status !== 'finished') {
    return null;
  }

  // Must be Bo3 or Bo5
  if (match.format !== 'bo3' && match.format !== 'bo5') {
    return null;
  }

  const maps = match.maps as any[];
  if (!maps || maps.length === 0) {
    return null;
  }

  // Analyze maps
  let closeMaps = 0;
  let totalRoundDiff = 0;
  let hadOvertime = false;

  maps.forEach(map => {
    const team1Score = map.team1Score || 0;
    const team2Score = map.team2Score || 0;
    const roundDiff = Math.abs(team1Score - team2Score);

    if (roundDiff <= 3) {
      closeMaps++;
    }

    totalRoundDiff += roundDiff;

    if (team1Score >= 16 || team2Score >= 16) {
      hadOvertime = true;
    }
  });

  const averageRoundDifference = totalRoundDiff / maps.length;

  // Determine if it's an epic series
  // Criteria: went to final map OR at least 2 close maps OR had overtime
  const expectedMaps = match.format === 'bo3' ? 3 : 5;
  const wentToFinalMap = maps.length === expectedMaps;

  const isEpic = wentToFinalMap || closeMaps >= 2 || hadOvertime;

  if (!isEpic) {
    return null;
  }

  // Get team names
  let team1Name = 'Team 1';
  let team2Name = 'Team 2';

  if (match.team1Id) {
    const [team1] = await db.select().from(teams).where(eq(teams.id, match.team1Id));
    if (team1) team1Name = team1.name;
  }

  if (match.team2Id) {
    const [team2] = await db.select().from(teams).where(eq(teams.id, match.team2Id));
    if (team2) team2Name = team2.name;
  }

  return {
    matchId: match.id,
    matchExternalId: match.externalId,
    team1: {
      id: match.team1Id,
      name: team1Name,
    },
    team2: {
      id: match.team2Id,
      name: team2Name,
    },
    format: match.format,
    finalScore: {
      team1: match.scoreTeam1,
      team2: match.scoreTeam2,
    },
    wentToFinalMap,
    closeMaps,
    totalMaps: maps.length,
    averageRoundDifference,
    hadOvertime,
  };
}
