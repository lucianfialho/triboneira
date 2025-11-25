import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, matches, teams, eventParticipants } from '@/lib/db/schema';
import { eq, sql, asc, inArray } from 'drizzle-orm';

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
  team2: SwissTeam;
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
  { roundNumber: 1, buckets: ['0:0'] },           // Round 1: 8 matches in 0:0
  { roundNumber: 2, buckets: ['1:0', '0:1'] },    // Round 2: 4 matches in 1:0, 4 in 0:1
  { roundNumber: 3, buckets: ['2:0', '1:1', '0:2'] }, // Round 3: 2 in 2:0, 4 in 1:1, 2 in 0:2
  { roundNumber: 4, buckets: ['3:0', '2:1', '1:2', '0:3'] },    // Round 4: 1 in 3:0, 2 in 2:1, 2 in 1:2, 1 in 0:3
  { roundNumber: 5, buckets: ['3:1', '2:2', '1:3'] },           // Round 5: 1 in 3:1, 3 in 2:2, 1 in 1:3
];

// Expected number of matches per bucket for a 16-team Swiss
const BUCKET_MATCH_COUNTS: Record<string, number> = {
  '0:0': 8,
  '1:0': 4,
  '0:1': 4,
  '2:0': 2,
  '1:1': 4,
  '0:2': 2,
  '3:0': 1,  // Qualified with 3-0
  '2:1': 2,
  '1:2': 2,
  '0:3': 1,  // Eliminated with 0-3
  '3:1': 1,  // Qualified with 3-1
  '2:2': 3,  // Round 5 advancement matches
  '1:3': 1,  // Eliminated with 1-3
  '3:2': 3,  // Qualified with 3-2 (from 2:2 bucket)
  '2:3': 3,  // Eliminated with 2-3 (from 2:2 bucket)
};

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

    // 1. Get event data with metadata
    const eventResult = await db
      .select({
        id: events.id,
        name: events.name,
        metadata: events.metadata,
      })
      .from(events)
      .where(eq(events.externalId, externalId))
      .limit(1);

    if (!eventResult || eventResult.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const event = eventResult[0];
    const eventId = event.id;
    const metadata = event.metadata as any;
    const swissData = metadata?.swissData;

    // 2. If no Swiss data in metadata, return message asking to sync
    if (!swissData) {
      return NextResponse.json({
        event: {
          id: event.id,
          name: event.name,
        },
        rounds: [],
        qualified: [],
        eliminated: [],
        currentRound: 0,
        totalRounds: 5,
        message: 'Swiss data not available. Please sync the event to load Swiss structure from HLTV.',
      });
    }

    // Extract both bracket and standings data
    const bracketData = swissData.bracket || swissData; // Backwards compatible
    const standingsData = swissData.standings || swissData; // Backwards compatible

    // 3. Build mapping from HLTV slot IDs to our team data
    const slotIdToTeamInfo = standingsData.slotIdToTeamInfo || bracketData.slotIdToTeamInfo || [];
    const slotIdToHltvTeamId = new Map<number, number>();

    slotIdToTeamInfo.forEach((team: any) => {
      if (team.teamId && team.eventGroupTeamSlotId) {
        slotIdToHltvTeamId.set(team.eventGroupTeamSlotId, team.teamId);
      }
    });

    // Get all unique HLTV team IDs from Swiss data
    const hltvTeamIds = Array.from(slotIdToHltvTeamId.values()).filter(id => id !== null);

    // Map HLTV team IDs to our database team IDs
    const teamsData = await db
      .select({
        id: teams.id,
        externalId: teams.externalId,
        name: teams.name,
        logoUrl: teams.logoUrl,
        seed: sql<number | null>`(
          SELECT seed FROM ${eventParticipants}
          WHERE event_id = ${eventId} AND team_id = ${teams.id}
          LIMIT 1
        )`,
      })
      .from(teams)
      .where(inArray(teams.externalId, hltvTeamIds.map(String)));

    // Build mapping from HLTV team ID -> our team data
    const hltvTeamIdToOurTeam = new Map<number, typeof teamsData[0]>();
    teamsData.forEach(team => {
      const hltvId = parseInt(team.externalId);
      if (!isNaN(hltvId)) {
        hltvTeamIdToOurTeam.set(hltvId, team);
      }
    });

    // Build mapping from slot ID -> our team data
    const slotIdToTeam = new Map<number, SwissTeam>();
    slotIdToTeamInfo.forEach((team: any) => {
      const slotId = team.eventGroupTeamSlotId;
      const hltvTeamId = team.teamId;

      if (slotId && hltvTeamId) {
        const ourTeam = hltvTeamIdToOurTeam.get(hltvTeamId);
        if (ourTeam) {
          slotIdToTeam.set(slotId, {
            id: ourTeam.id,
            name: ourTeam.name,
            logoUrl: ourTeam.logoUrl,
            seed: ourTeam.seed,
          });
        } else {
          // Team not in our database yet, use HLTV name
          slotIdToTeam.set(slotId, {
            id: 0,
            name: team.teamName || 'TBD',
            logoUrl: null,
            seed: null,
          });
        }
      }
    });

    // 4. Get all matches from database ordered by date
    const rawMatchesData = await db
      .select({
        id: matches.id,
        date: matches.date,
        status: matches.status,
        scoreTeam1: matches.scoreTeam1,
        scoreTeam2: matches.scoreTeam2,
        team1Id: matches.team1Id,
        team2Id: matches.team2Id,
        winnerId: matches.winnerId,
        metadata: matches.metadata,
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
      .from(matches)
      .leftJoin(teams, eq(matches.team1Id, teams.id))
      .leftJoin(sql`teams AS t2`, sql`${matches.team2Id} = t2.id`)
      .leftJoin(sql`teams AS w`, sql`${matches.winnerId} = w.id`)
      .where(eq(matches.eventId, eventId))
      .orderBy(asc(matches.date));

    // Filter out cancelled matches and format them
    const validMatches = rawMatchesData
      .filter(m => m.status !== 'cancelled')
      .map(match => {
        const metadata = match.metadata as any;
        return {
          ...match,
          team1: match.team1?.id ? match.team1 : {
            id: 0,
            name: metadata?.team1Name || 'TBD',
            logoUrl: null,
            seed: null,
          },
          team2: match.team2?.id ? match.team2 : {
            id: -1,
            name: metadata?.team2Name || 'TBD',
            logoUrl: null,
            seed: null,
          },
        };
      });

    // Sort matches by date to assign them to rounds
    const sortedMatches = [...validMatches].sort((a, b) => {
      if (!a.date && !b.date) return 0;
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // 5. Build team record map from standings data
    const teamRecordMap = new Map<string, { wins: number; losses: number }>();

    if (standingsData?.slotIdToTeamInfo) {
      standingsData.slotIdToTeamInfo.forEach((teamInfo: any) => {
        const teamName = teamInfo.teamName;
        const standing = teamInfo.currentStanding || '0-0';
        const [wins, losses] = standing.split('-').map((n: string) => parseInt(n.trim()));

        if (!isNaN(wins) && !isNaN(losses)) {
          teamRecordMap.set(teamName, { wins, losses });
        }
      });
    }

    // Helper function to get team record
    const getTeamRecord = (teamName: string): { wins: number; losses: number } => {
      return teamRecordMap.get(teamName) || { wins: 0, losses: 0 };
    };

    // 6. Build rounds structure by assigning matches chronologically to buckets
    const rounds: SwissRound[] = [];
    let matchIndex = 0;

    for (const roundStructure of SWISS_STRUCTURE) {
      const roundBuckets: SwissBucket[] = [];

      for (const bucketKey of roundStructure.buckets) {
        const [wins, losses] = bucketKey.split(':').map(Number);
        const expectedMatches = BUCKET_MATCH_COUNTS[bucketKey] || 0;
        const bucketMatches: SwissMatch[] = [];

        // Assign next N matches to this bucket
        for (let i = 0; i < expectedMatches; i++) {
          if (matchIndex < sortedMatches.length) {
            const match = sortedMatches[matchIndex];
            matchIndex++;

            bucketMatches.push({
              id: match.id,
              team1: {
                id: match.team1.id ?? 0,
                name: match.team1.name ?? 'TBD',
                logoUrl: match.team1.logoUrl,
                seed: match.team1.seed,
              },
              team2: {
                id: match.team2.id ?? 0,
                name: match.team2.name ?? 'TBD',
                logoUrl: match.team2.logoUrl,
                seed: match.team2.seed,
              },
              winner: match.winner?.id ? {
                id: match.winner.id,
                name: match.winner.name!,
                logoUrl: match.winner.logoUrl,
                seed: null,
              } : null,
              score: {
                team1: match.scoreTeam1,
                team2: match.scoreTeam2,
              },
              status: match.status,
              date: match.date ? new Date(match.date).toISOString() : null,
              team1Record: getTeamRecord(match.team1.name ?? ''),
              team2Record: getTeamRecord(match.team2.name ?? ''),
            });
          } else {
            // Fill remaining slots with TBD
            bucketMatches.push({
              id: null,
              team1: TBD_TEAM,
              team2: TBD_TEAM,
              winner: null,
              score: { team1: null, team2: null },
              status: 'scheduled',
              date: null,
              team1Record: { wins, losses },
              team2Record: { wins, losses },
            });
          }
        }

        if (bucketMatches.length > 0) {
          roundBuckets.push({
            bucket: bucketKey,
            matches: bucketMatches,
          });
        }
      }

      rounds.push({
        roundNumber: roundStructure.roundNumber,
        buckets: roundBuckets,
      });
    }

    // Determine current round based on team standings
    let currentRound = 1;
    const finishedMatches = sortedMatches.filter(m => m.status === 'finished').length;
    if (finishedMatches >= 8 && finishedMatches < 16) currentRound = 2;
    else if (finishedMatches >= 16 && finishedMatches < 24) currentRound = 3;
    else if (finishedMatches >= 24 && finishedMatches < 30) currentRound = 4;
    else if (finishedMatches >= 30) currentRound = 5;


    // 6. Get qualified and eliminated teams from HLTV standings data
    const qualified: QualifiedTeam[] = [];
    const eliminated: EliminatedTeam[] = [];

    const groupResults = standingsData.structure?.groupResults;

    if (groupResults) {
      // 3-0 teams (qualified)
      const threeZeros = groupResults.threeZeros || [];
      threeZeros.forEach((slotId: number) => {
        const team = slotIdToTeam.get(slotId);
        if (team) {
          qualified.push({
            ...team,
            finalRecord: '3-0',
            placement: qualified.length + 1,
          });
        }
      });

      // 3-1 or 3-2 teams (qualified via promotions)
      const promotions = groupResults.threeOneOrThreeTwoPromotions || [];
      promotions.forEach((slotId: number) => {
        const team = slotIdToTeam.get(slotId);
        if (team && team.id) {
          // Determine if it's 3-1 or 3-2 by counting losses
          const teamMatches = validMatches.filter(m =>
            (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'finished'
          );
          const losses = teamMatches.filter(m =>
            m.winnerId && m.winnerId !== team.id
          ).length;

          qualified.push({
            ...team,
            finalRecord: `3-${losses}`,
            placement: qualified.length + 1,
          });
        } else if (team) {
          // Team not in DB yet, assume 3-2
          qualified.push({
            ...team,
            finalRecord: '3-2',
            placement: qualified.length + 1,
          });
        }
      });

      // 0-3 teams (eliminated)
      const zeroThrees = groupResults.zeroThrees || [];
      zeroThrees.forEach((slotId: number) => {
        const team = slotIdToTeam.get(slotId);
        if (team) {
          eliminated.push({
            ...team,
            finalRecord: '0-3',
          });
        }
      });

      // 1-3 or 2-3 teams (eliminated)
      const eliminations = groupResults.oneThreeOrTwoThreeEliminations || [];
      eliminations.forEach((slotId: number) => {
        const team = slotIdToTeam.get(slotId);
        if (team && team.id) {
          // Determine if it's 1-3 or 2-3 by counting wins
          const teamMatches = validMatches.filter(m =>
            (m.team1Id === team.id || m.team2Id === team.id) && m.status === 'finished'
          );
          const wins = teamMatches.filter(m =>
            m.winnerId === team.id
          ).length;

          eliminated.push({
            ...team,
            finalRecord: `${wins}-3`,
          });
        } else if (team) {
          // Team not in DB yet, assume 2-3
          eliminated.push({
            ...team,
            finalRecord: '2-3',
          });
        }
      });
    }

    // Sort qualified by record (3-0 > 3-1 > 3-2)
    qualified.sort((a, b) => {
      const aLosses = parseInt(a.finalRecord.split('-')[1]);
      const bLosses = parseInt(b.finalRecord.split('-')[1]);
      return aLosses - bLosses;
    });

    // Update placements
    qualified.forEach((team, index) => {
      team.placement = index + 1;
    });

    const response: SwissResponse & { swissData: any } = {
      event: {
        id: event.id,
        name: event.name,
      },
      rounds,
      qualified,
      eliminated,
      currentRound,
      totalRounds: 5,
      swissData: {
        bracket: bracketData,
        standings: standingsData,
      },
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching swiss data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch swiss data', details: error.message },
      { status: 500 }
    );
  }
}
