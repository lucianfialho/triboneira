import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, matches, teams, eventParticipants } from '@/lib/db/schema';
import { eq, and, desc, asc, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Types for bracket structure
interface BracketTeam {
  id: number;
  name: string;
  logoUrl: string | null;
  seed: number | null;
  isTBA: boolean;
}

interface BracketMatch {
  id: number;
  team1: BracketTeam;
  team2: BracketTeam;
  winner: BracketTeam | null;
  score: {
    team1: number | null;
    team2: number | null;
  };
  format: string | null;
  date: string | null;
  status: string;
  feeds: {
    team1From?: number; // Match ID that feeds team1
    team2From?: number; // Match ID that feeds team2
    feedsTo?: number;   // Match ID this match feeds to
  };
}

interface BracketRound {
  name: string;
  matches: BracketMatch[];
}

interface BracketResponse {
  currentStage: 'opening' | 'elimination' | 'playoffs';
  stageInfo: {
    format: string;
    description: string;
    totalRounds?: number;
  };
  bracket: BracketRound[];
}

// Helper: Create TBA team placeholder
function createTBATeam(seed: number | null = null): BracketTeam {
  return {
    id: -1,
    name: 'TBA',
    logoUrl: null,
    seed,
    isTBA: true,
  };
}

// Helper: Detect tournament stage based on dates and match data
function detectStage(
  eventStart: Date | null,
  eventEnd: Date | null,
  matchCount: number,
  finishedCount: number
): 'opening' | 'elimination' | 'playoffs' {
  const now = new Date();

  // If event hasn't started, it's opening
  if (eventStart && now < eventStart) {
    return 'opening';
  }

  // If we have playoff-style matches (8, 4, 2, or 1), it's playoffs
  if (matchCount <= 15 && matchCount >= 7) {
    return 'playoffs';
  }

  // If event is ongoing with many matches, likely elimination phase
  if (eventEnd && now < eventEnd && matchCount > 15) {
    return 'elimination';
  }

  // Default to playoffs if we have few matches
  return matchCount < 20 ? 'playoffs' : 'elimination';
}

// Helper: Organize matches into bracket rounds
function organizeBracketRounds(matchesData: any[]): BracketRound[] {
  // Sort matches by date
  const sorted = [...matchesData].sort((a, b) => {
    const dateA = a.date ? new Date(a.date).getTime() : 0;
    const dateB = b.date ? new Date(b.date).getTime() : 0;
    return dateA - dateB;
  });

  const rounds: BracketRound[] = [];

  // Detect bracket structure based on match count
  const totalMatches = sorted.length;

  if (totalMatches === 1) {
    // Grand Final only
    rounds.push({
      name: 'Grand Final',
      matches: sorted.map(m => convertToBracketMatch(m))
    });
  } else if (totalMatches === 2) {
    // Semi-Finals
    rounds.push({
      name: 'Semi-Finals',
      matches: sorted.slice(0, 2).map(m => convertToBracketMatch(m))
    });
  } else if (totalMatches === 3) {
    // Semi-Finals + Final
    rounds.push({
      name: 'Semi-Finals',
      matches: sorted.slice(0, 2).map(m => convertToBracketMatch(m))
    });
    rounds.push({
      name: 'Grand Final',
      matches: sorted.slice(2, 3).map(m => convertToBracketMatch(m))
    });
  } else if (totalMatches >= 4 && totalMatches <= 7) {
    // Quarter-Finals + Semi-Finals + Final
    const qfCount = totalMatches === 7 ? 4 : totalMatches === 6 ? 4 : 2;
    const sfStart = qfCount;
    const finalStart = sfStart + 2;

    if (qfCount > 0) {
      rounds.push({
        name: 'Quarter-Finals',
        matches: sorted.slice(0, qfCount).map(m => convertToBracketMatch(m))
      });
    }

    rounds.push({
      name: 'Semi-Finals',
      matches: sorted.slice(sfStart, finalStart).map(m => convertToBracketMatch(m))
    });

    if (finalStart < totalMatches) {
      rounds.push({
        name: 'Grand Final',
        matches: sorted.slice(finalStart).map(m => convertToBracketMatch(m))
      });
    }
  } else if (totalMatches >= 8) {
    // Full bracket: Round of 16 -> QF -> SF -> Final
    const ro16Count = totalMatches >= 15 ? 8 : 0;
    const qfStart = ro16Count;
    const qfCount = totalMatches >= 7 ? 4 : 0;
    const sfStart = qfStart + qfCount;
    const finalStart = sfStart + 2;

    if (ro16Count > 0) {
      rounds.push({
        name: 'Round of 16',
        matches: sorted.slice(0, ro16Count).map(m => convertToBracketMatch(m))
      });
    }

    if (qfCount > 0) {
      rounds.push({
        name: 'Quarter-Finals',
        matches: sorted.slice(qfStart, sfStart).map(m => convertToBracketMatch(m))
      });
    }

    rounds.push({
      name: 'Semi-Finals',
      matches: sorted.slice(sfStart, finalStart).map(m => convertToBracketMatch(m))
    });

    if (finalStart < totalMatches) {
      rounds.push({
        name: 'Grand Final',
        matches: sorted.slice(finalStart).map(m => convertToBracketMatch(m))
      });
    }
  }

  return rounds;
}

// Helper: Convert DB match to BracketMatch
function convertToBracketMatch(match: any): BracketMatch {
  const team1: BracketTeam = match.team1 ? {
    id: match.team1.id,
    name: match.team1.name,
    logoUrl: match.team1.logoUrl,
    seed: match.team1.seed,
    isTBA: false,
  } : createTBATeam();

  const team2: BracketTeam = match.team2 ? {
    id: match.team2.id,
    name: match.team2.name,
    logoUrl: match.team2.logoUrl,
    seed: match.team2.seed,
    isTBA: false,
  } : createTBATeam();

  const winner: BracketTeam | null = match.winner ? {
    id: match.winner.id,
    name: match.winner.name,
    logoUrl: match.winner.logoUrl,
    seed: match.winner.seed || null,
    isTBA: false,
  } : null;

  return {
    id: match.id,
    team1,
    team2,
    winner,
    score: {
      team1: match.scoreTeam1,
      team2: match.scoreTeam2,
    },
    format: match.format,
    date: match.date ? new Date(match.date).toISOString() : null,
    status: match.status,
    feeds: {}, // Will be calculated later
  };
}

// Helper: Calculate match connections/feeds
function calculateFeeds(rounds: BracketRound[]): BracketRound[] {
  // Create a flat map of all matches by ID
  const matchMap = new Map<number, BracketMatch>();
  rounds.forEach(round => {
    round.matches.forEach(match => {
      matchMap.set(match.id, match);
    });
  });

  // For each round (except the first), connect to previous round
  for (let i = 1; i < rounds.length; i++) {
    const currentRound = rounds[i];
    const previousRound = rounds[i - 1];

    // Each match in current round takes winners from 2 matches in previous round
    currentRound.matches.forEach((match, matchIndex) => {
      const prevMatch1Index = matchIndex * 2;
      const prevMatch2Index = matchIndex * 2 + 1;

      if (prevMatch1Index < previousRound.matches.length) {
        const prevMatch1 = previousRound.matches[prevMatch1Index];
        match.feeds.team1From = prevMatch1.id;
        prevMatch1.feeds.feedsTo = match.id;
      }

      if (prevMatch2Index < previousRound.matches.length) {
        const prevMatch2 = previousRound.matches[prevMatch2Index];
        match.feeds.team2From = prevMatch2.id;
        prevMatch2.feeds.feedsTo = match.id;
      }
    });
  }

  return rounds;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ externalId: string }> }
) {
  try {
    const { externalId } = await context.params;

    // Get event data
    const event = await db
      .select({
        id: events.id,
        name: events.name,
        dateStart: events.dateStart,
        dateEnd: events.dateEnd,
        status: events.status,
      })
      .from(events)
      .where(eq(events.externalId, externalId))
      .limit(1);

    if (!event || event.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventId = event[0].id;
    const eventData = event[0];

    // Get all matches for the event
    const matchesData = await db
      .select({
        id: matches.id,
        externalId: matches.externalId,
        date: matches.date,
        format: matches.format,
        status: matches.status,
        scoreTeam1: matches.scoreTeam1,
        scoreTeam2: matches.scoreTeam2,
        team1: {
          id: teams.id,
          externalId: teams.externalId,
          name: teams.name,
          logoUrl: teams.logoUrl,
          seed: sql<number | null>`(
            SELECT seed FROM ${eventParticipants}
            WHERE event_id = ${eventId} AND team_id = ${teams.id}
            LIMIT 1
          )`,
        },
        team2: {
          id: sql<number>`t2.id`,
          externalId: sql<string>`t2.external_id`,
          name: sql<string>`t2.name`,
          logoUrl: sql<string>`t2.logo_url`,
          seed: sql<number | null>`(
            SELECT seed FROM ${eventParticipants}
            WHERE event_id = ${eventId} AND team_id = t2.id
            LIMIT 1
          )`,
        },
        winner: {
          id: sql<number | null>`w.id`,
          name: sql<string | null>`w.name`,
          logoUrl: sql<string | null>`w.logo_url`,
          seed: sql<number | null>`(
            SELECT seed FROM ${eventParticipants}
            WHERE event_id = ${eventId} AND team_id = w.id
            LIMIT 1
          )`,
        },
      })
      .from(matches)
      .innerJoin(teams, eq(matches.team1Id, teams.id))
      .innerJoin(sql`teams AS t2`, sql`${matches.team2Id} = t2.id`)
      .leftJoin(sql`teams AS w`, sql`${matches.winnerId} = w.id`)
      .where(eq(matches.eventId, eventId))
      .orderBy(asc(matches.date));

    // Filter for playoff matches only (you can adjust this based on metadata or naming)
    // For now, we'll take all matches and organize them
    const playoffMatches = matchesData.filter(m =>
      m.status !== 'cancelled' // && other filters if needed
    );

    // Detect stage
    const finishedCount = playoffMatches.filter(m => m.status === 'finished').length;
    const currentStage = detectStage(
      eventData.dateStart,
      eventData.dateEnd,
      playoffMatches.length,
      finishedCount
    );

    // If in playoffs, organize as bracket. Otherwise show all matches
    let bracketRounds: BracketRound[] = [];

    if (currentStage === 'playoffs') {
      // Organize into bracket rounds
      bracketRounds = organizeBracketRounds(playoffMatches);
      // Calculate feeds between matches
      bracketRounds = calculateFeeds(bracketRounds);
    } else {
      // For Swiss/Opening stages, show all matches grouped by status
      const liveMatches = playoffMatches.filter(m => m.status === 'live');
      const scheduledMatches = playoffMatches.filter(m => m.status === 'scheduled');
      const finishedMatches = playoffMatches.filter(m => m.status === 'finished');

      if (liveMatches.length > 0) {
        bracketRounds.push({
          name: 'Ao Vivo',
          matches: liveMatches.map(m => convertToBracketMatch(m))
        });
      }

      if (scheduledMatches.length > 0) {
        bracketRounds.push({
          name: 'Próximas Partidas',
          matches: scheduledMatches.map(m => convertToBracketMatch(m))
        });
      }

      if (finishedMatches.length > 0) {
        bracketRounds.push({
          name: 'Partidas Finalizadas',
          matches: finishedMatches.slice(-10).map(m => convertToBracketMatch(m)) // Last 10 only
        });
      }
    }

    // Build response
    const response: BracketResponse = {
      currentStage,
      stageInfo: {
        format: currentStage === 'playoffs'
          ? (playoffMatches.length >= 8 ? 'Single Elimination' : 'Playoffs')
          : 'Swiss System',
        description: currentStage === 'playoffs'
          ? 'Bracket de eliminação simples com as melhores equipes'
          : currentStage === 'elimination'
            ? 'Fase de eliminação em andamento - Sistema Suíço'
            : `Fase de abertura - ${playoffMatches.length} partidas no total`,
        totalRounds: bracketRounds.length,
      },
      bracket: bracketRounds,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching bracket:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bracket data', details: error.message },
      { status: 500 }
    );
  }
}
