import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches, teams, events } from '@/lib/db/schema';
import { eq, and, desc, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const championshipMode = searchParams.get('championshipMode');

    // Build conditions
    let conditions = [];

    if (eventId) {
      conditions.push(eq(matches.eventId, parseInt(eventId)));
    }

    if (status) {
      conditions.push(eq(matches.status, status));
    }

    // Get matches
    let matchesQuery = db
      .select()
      .from(matches)
      .orderBy(desc(matches.date));

    if (conditions.length > 0) {
      matchesQuery = matchesQuery.where(and(...conditions));
    }

    const matchesData = await matchesQuery;

    // Get unique event IDs
    const eventIds = [...new Set(matchesData.map(m => m.eventId))];

    // Get events (filter by championship mode if needed)
    let eventsQuery = db
      .select()
      .from(events)
      .where(inArray(events.id, eventIds));

    if (championshipMode === 'true') {
      eventsQuery = eventsQuery.where(eq(events.championshipMode, true));
    }

    const eventsData = await eventsQuery;
    const eventsMap = new Map(eventsData.map(e => [e.id, e]));

    // Filter matches by championship mode if needed
    let filteredMatches = matchesData;
    if (championshipMode === 'true') {
      filteredMatches = matchesData.filter(m => eventsMap.has(m.eventId));
    }

    // Get unique team IDs (filter out nulls)
    const teamIds = [
      ...new Set([
        ...filteredMatches.map(m => m.team1Id).filter(id => id !== null),
        ...filteredMatches.map(m => m.team2Id).filter(id => id !== null),
      ])
    ] as number[];

    // Get teams
    const teamsData = teamIds.length > 0
      ? await db.select().from(teams).where(inArray(teams.id, teamIds))
      : [];

    const teamsMap = new Map(teamsData.map(t => [t.id, t]));

    // Build response
    const result = filteredMatches.map((match) => {
      const metadata = match.metadata as any;
      const event = eventsMap.get(match.eventId);

      return {
        id: match.id,
        externalId: match.externalId,
        eventId: match.eventId,
        date: match.date,
        format: match.format,
        status: match.status,
        winnerId: match.winnerId,
        scoreTeam1: match.scoreTeam1,
        scoreTeam2: match.scoreTeam2,
        maps: match.maps,
        team1: match.team1Id && teamsMap.has(match.team1Id)
          ? teamsMap.get(match.team1Id)
          : {
              id: null,
              name: metadata?.team1Name || 'TBD',
              logo: null,
            },
        team2: match.team2Id && teamsMap.has(match.team2Id)
          ? teamsMap.get(match.team2Id)
          : {
              id: null,
              name: metadata?.team2Name || 'TBD',
              logo: null,
            },
        event,
        createdAt: match.createdAt,
        updatedAt: match.updatedAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: result,
      count: result.length,
    });
  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
