import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, matches, teams, swissRounds, eventParticipants } from '@/lib/db/schema';
import { eq, sql, asc, or, and } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Disable caching for real-time updates

interface SwissTeam {
  id: number;
  name: string;
  logoUrl: string | null;
  seed: number | null;
}

interface SwissMatch {
  id: number | null;
  team1: SwissTeam;
  team2: SwissTeam | null;
  winner: SwissTeam | null;
  score: {
    team1: number | null;
    team2: number | null;
  };
  status: string;
  date: string | null;
  team1Record: { wins: number; losses: number };
  team2Record: { wins: number; losses: number };
}

interface SwissBucket {
  bucket: string;
  matches: SwissMatch[];
}

interface SwissRound {
  roundNumber: number;
  buckets: SwissBucket[];
}

interface QualifiedTeam extends SwissTeam {
  finalRecord: string;
  placement: number;
}

interface EliminatedTeam extends SwissTeam {
  finalRecord: string;
}

interface SwissResponse {
  event: {
    id: number;
    name: string;
  };
  rounds: SwissRound[];
  qualified: QualifiedTeam[];
  eliminated: EliminatedTeam[];
  currentRound: number;
  totalRounds: number;
}

// Swiss structure for 16 teams
const SWISS_STRUCTURE: { roundNumber: number; buckets: string[] }[] = [
  { roundNumber: 1, buckets: ['0:0'] },
  { roundNumber: 2, buckets: ['1:0', '0:1'] },
  { roundNumber: 3, buckets: ['2:0', '1:1', '0:2'] },
  { roundNumber: 4, buckets: ['3:0', '2:1', '1:2', '0:3'] },
  { roundNumber: 5, buckets: ['3:1', '2:2', '1:3'] },
];

const TBD_TEAM: SwissTeam = {
  id: 0,
  name: 'TBD',
  logoUrl: null,
  seed: null,
};

export async function GET(
  request: Request,
  context: { params: Promise<{ externalId: string }> }
) {
  try {
    const { externalId } = await context.params;

    // 1. Get event data
    const searchConditions = [eq(events.externalId, externalId)];
    if (!isNaN(Number(externalId))) {
      searchConditions.push(eq(events.id, Number(externalId)));
    }

    const eventResult = await db
      .select({
        id: events.id,
        name: events.name,
      })
      .from(events)
      .where(or(...searchConditions))
      .limit(1);

    if (!eventResult || eventResult.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = eventResult[0];
    const eventId = event.id;

    // 2. Fetch Swiss Rounds data from database
    const swissData = await db
      .select({
        roundNumber: swissRounds.roundNumber,
        bucket: swissRounds.bucket,
        team1Record: swissRounds.team1Record,
        team2Record: swissRounds.team2Record,
        match: {
          id: matches.id,
          status: matches.status,
          date: matches.date,
          scoreTeam1: matches.scoreTeam1,
          scoreTeam2: matches.scoreTeam2,
          winnerId: matches.winnerId,
        },
        team1: {
          id: teams.id,
          name: teams.name,
          logoUrl: teams.logoUrl,
          seed: sql<number | null>`(
            SELECT seed FROM ${eventParticipants}
            WHERE event_id = ${eventId} AND team_id = ${teams.id}
            LIMIT 1
          )`,
        },
        team2: {
          id: sql<number | null>`t2.id`,
          name: sql<string | null>`t2.name`,
          logoUrl: sql<string | null>`t2.logo_url`,
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
        },
      })
      .from(swissRounds)
      .leftJoin(matches, eq(swissRounds.matchId, matches.id))
      .leftJoin(teams, eq(swissRounds.team1Id, teams.id))
      .leftJoin(sql`teams AS t2`, sql`${swissRounds.team2Id} = t2.id`)
      .leftJoin(sql`teams AS w`, sql`${matches.winnerId} = w.id`)
      .where(eq(swissRounds.eventId, eventId))
      .orderBy(asc(swissRounds.roundNumber), asc(swissRounds.bucket));

    // 3. Process data into rounds structure
    const rounds: SwissRound[] = [];
    let currentRound = 1;

    // Initialize rounds based on structure
    SWISS_STRUCTURE.forEach(struct => {
      const roundBuckets: SwissBucket[] = struct.buckets.map(bucket => ({
        bucket,
        matches: []
      }));
      rounds.push({
        roundNumber: struct.roundNumber,
        buckets: roundBuckets
      });
    });

    // Helper to parse record string "W-L"
    const parseRecord = (record: string | null) => {
      if (!record) return { wins: 0, losses: 0 };
      const [wins, losses] = record.split('-').map(Number);
      return { wins: isNaN(wins) ? 0 : wins, losses: isNaN(losses) ? 0 : losses };
    };

    // Populate matches into buckets
    swissData.forEach(row => {
      const roundIndex = row.roundNumber - 1;
      if (roundIndex >= 0 && roundIndex < rounds.length) {
        const bucket = rounds[roundIndex].buckets.find(b => b.bucket === row.bucket);
        if (bucket) {
          // Determine if match is finished to update current round
          if (row.match?.status === 'finished') {
            currentRound = Math.max(currentRound, row.roundNumber + (row.roundNumber < 5 ? 1 : 0));
          } else if (row.match?.status === 'live') {
            currentRound = Math.max(currentRound, row.roundNumber);
          }

          bucket.matches.push({
            id: row.match?.id ?? null,
            team1: row.team1?.id ? {
              id: row.team1.id,
              name: row.team1.name,
              logoUrl: row.team1.logoUrl,
              seed: row.team1.seed
            } : TBD_TEAM,
            team2: row.team2?.id ? {
              id: row.team2.id,
              name: row.team2.name!, // Name should not be null if ID exists
              logoUrl: row.team2.logoUrl,
              seed: row.team2.seed
            } : null, // Allow null for TBD
            winner: row.winner?.id ? {
              id: row.winner.id,
              name: row.winner.name!,
              logoUrl: row.winner.logoUrl,
              seed: null
            } : null,
            score: {
              team1: row.match?.scoreTeam1 ?? null,
              team2: row.match?.scoreTeam2 ?? null,
            },
            status: row.match?.status ?? 'scheduled',
            date: row.match?.date ? new Date(row.match.date).toISOString() : null,
            team1Record: parseRecord(row.team1Record),
            team2Record: parseRecord(row.team2Record),
          });
        }
      }
    });

    // 4. Calculate Qualified and Eliminated teams
    // We can infer this from records: 3 wins = qualified, 3 losses = eliminated
    const qualified: QualifiedTeam[] = [];
    const eliminated: EliminatedTeam[] = [];
    const teamStats = new Map<number, { wins: number, losses: number, team: SwissTeam }>();

    // Iterate all matches to build current stats
    swissData.forEach(row => {
      if (row.match?.status === 'finished' && row.match.winnerId) {
        // Update winner stats
        const winnerId = row.match.winnerId;
        if (!teamStats.has(winnerId)) {
          const rawTeam = row.team1?.id === winnerId ? row.team1 : row.team2;
          if (rawTeam && rawTeam.id) {
            const team: SwissTeam = {
              id: rawTeam.id,
              name: rawTeam.name!,
              logoUrl: rawTeam.logoUrl,
              seed: rawTeam.seed
            };
            teamStats.set(winnerId, { wins: 0, losses: 0, team });
          }
        }
        const winnerStats = teamStats.get(winnerId);
        if (winnerStats) winnerStats.wins++;

        // Update loser stats
        const loserId = row.team1?.id === winnerId ? row.team2?.id : row.team1?.id;
        if (loserId) {
          if (!teamStats.has(loserId)) {
            const rawTeam = row.team1?.id === loserId ? row.team1 : row.team2;
            if (rawTeam && rawTeam.id) {
              const team: SwissTeam = {
                id: rawTeam.id,
                name: rawTeam.name!,
                logoUrl: rawTeam.logoUrl,
                seed: rawTeam.seed
              };
              teamStats.set(loserId, { wins: 0, losses: 0, team });
            }
          }
          const loserStats = teamStats.get(loserId);
          if (loserStats) loserStats.losses++;
        }
      }
    });

    // Classify teams
    teamStats.forEach(stats => {
      if (stats.wins >= 3) {
        qualified.push({
          ...stats.team,
          finalRecord: `${stats.wins}-${stats.losses}`,
          placement: 0 // Will sort later
        });
      } else if (stats.losses >= 3) {
        eliminated.push({
          ...stats.team,
          finalRecord: `${stats.wins}-${stats.losses}`
        });
      }
    });

    // Sort qualified teams (3-0 > 3-1 > 3-2)
    qualified.sort((a, b) => {
      const aLosses = parseInt(a.finalRecord.split('-')[1]);
      const bLosses = parseInt(b.finalRecord.split('-')[1]);
      return aLosses - bLosses;
    });
    qualified.forEach((t, i) => t.placement = i + 1);

    return NextResponse.json({
      event: {
        id: event.id,
        name: event.name,
      },
      rounds,
      qualified,
      eliminated,
      currentRound,
      totalRounds: 5,
    });

  } catch (error: any) {
    console.error('Error fetching swiss data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swiss data', details: error.message },
      { status: 500 }
    );
  }
}
