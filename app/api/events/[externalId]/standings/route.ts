import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, matches, teams, eventParticipants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface TeamStanding {
  position: number;
  team: {
    id: number;
    name: string;
    logoUrl: string | null;
    country: string | null;
    seed: number | null;
  };
  stats: {
    played: number;
    wins: number;
    losses: number;
    mapsWon: number;
    mapsLost: number;
    mapDiff: number;
    points: number;
    winRate: number;
  };
  placement: string | null;
  recentForm: ('W' | 'L')[];  // Últimos 5 resultados
}

interface StandingsResponse {
  event: {
    id: number;
    name: string;
    status: string;
  };
  standings: TeamStanding[];
  totalTeams: number;
  completedMatches: number;
  ongoingMatches: number;
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

    // Get all participants (teams in the event)
    const participants = await db
      .select({
        teamId: eventParticipants.teamId,
        seed: eventParticipants.seed,
        placement: eventParticipants.placement,
        team: {
          id: teams.id,
          name: teams.name,
          logoUrl: teams.logoUrl,
          country: teams.country,
        },
      })
      .from(eventParticipants)
      .innerJoin(teams, eq(eventParticipants.teamId, teams.id))
      .where(eq(eventParticipants.eventId, eventId));

    // Get all finished matches for this event
    const finishedMatches = await db
      .select({
        id: matches.id,
        team1Id: matches.team1Id,
        team2Id: matches.team2Id,
        winnerId: matches.winnerId,
        scoreTeam1: matches.scoreTeam1,
        scoreTeam2: matches.scoreTeam2,
        status: matches.status,
        date: matches.date,
      })
      .from(matches)
      .where(eq(matches.eventId, eventId))
      .orderBy(matches.date);

    // Calculate statistics for each team
    const teamStatsMap = new Map<number, {
      played: number;
      wins: number;
      losses: number;
      mapsWon: number;
      mapsLost: number;
      points: number;
      recentMatches: { won: boolean; date: Date }[];
    }>();

    // Initialize stats for all participants
    participants.forEach(p => {
      teamStatsMap.set(p.teamId, {
        played: 0,
        wins: 0,
        losses: 0,
        mapsWon: 0,
        mapsLost: 0,
        points: 0,
        recentMatches: [],
      });
    });

    // Process only finished matches
    const completedMatches = finishedMatches.filter(m => m.status === 'finished' && m.winnerId);
    const ongoingMatches = finishedMatches.filter(m => m.status === 'live');

    completedMatches.forEach(match => {
      const { team1Id, team2Id, winnerId, scoreTeam1, scoreTeam2, date } = match;

      // Update team1 stats
      if (teamStatsMap.has(team1Id)) {
        const stats = teamStatsMap.get(team1Id)!;
        stats.played++;
        stats.mapsWon += scoreTeam1 || 0;
        stats.mapsLost += scoreTeam2 || 0;

        if (winnerId === team1Id) {
          stats.wins++;
          stats.points += 3;  // 3 points for win (Swiss system)
          stats.recentMatches.push({ won: true, date: date || new Date() });
        } else {
          stats.losses++;
          stats.recentMatches.push({ won: false, date: date || new Date() });
        }
      }

      // Update team2 stats
      if (teamStatsMap.has(team2Id)) {
        const stats = teamStatsMap.get(team2Id)!;
        stats.played++;
        stats.mapsWon += scoreTeam2 || 0;
        stats.mapsLost += scoreTeam1 || 0;

        if (winnerId === team2Id) {
          stats.wins++;
          stats.points += 3;
          stats.recentMatches.push({ won: true, date: date || new Date() });
        } else {
          stats.losses++;
          stats.recentMatches.push({ won: false, date: date || new Date() });
        }
      }
    });

    // Build standings
    const standings: TeamStanding[] = participants.map(p => {
      const stats = teamStatsMap.get(p.teamId)!;
      const mapDiff = stats.mapsWon - stats.mapsLost;
      const winRate = stats.played > 0 ? (stats.wins / stats.played) * 100 : 0;

      // Get last 5 matches for form
      const recentMatches = stats.recentMatches
        .sort((a, b) => b.date.getTime() - a.date.getTime())
        .slice(0, 5);

      const recentForm: ('W' | 'L')[] = recentMatches.map(m => m.won ? 'W' : 'L');

      return {
        position: 0, // Will be set after sorting
        team: {
          id: p.team.id,
          name: p.team.name,
          logoUrl: p.team.logoUrl,
          country: p.team.country,
          seed: p.seed,
        },
        stats: {
          played: stats.played,
          wins: stats.wins,
          losses: stats.losses,
          mapsWon: stats.mapsWon,
          mapsLost: stats.mapsLost,
          mapDiff,
          points: stats.points,
          winRate: parseFloat(winRate.toFixed(1)),
        },
        placement: p.placement,
        recentForm,
      };
    });

    // Sort standings: by points, then map diff, then maps won
    standings.sort((a, b) => {
      if (b.stats.points !== a.stats.points) {
        return b.stats.points - a.stats.points;
      }
      if (b.stats.mapDiff !== a.stats.mapDiff) {
        return b.stats.mapDiff - a.stats.mapDiff;
      }
      return b.stats.mapsWon - a.stats.mapsWon;
    });

    // Set positions
    standings.forEach((standing, index) => {
      standing.position = index + 1;
    });

    const response: StandingsResponse = {
      event: {
        id: eventData.id,
        name: eventData.name,
        status: eventData.status,
      },
      standings,
      totalTeams: participants.length,
      completedMatches: completedMatches.length,
      ongoingMatches: ongoingMatches.length,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching standings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch standings', details: error.message },
      { status: 500 }
    );
  }
}
