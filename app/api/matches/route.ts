import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches } from '@/lib/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // Query parameters
    const eventId = searchParams.get('eventId');
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build where conditions
    const conditions = [];
    if (eventId) {
      conditions.push(eq(matches.eventId, parseInt(eventId)));
    }
    if (status) {
      conditions.push(eq(matches.status, status));
    }

    // Fetch matches
    const matchesList = await db.query.matches.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        event: {
          columns: {
            id: true,
            name: true,
            championshipMode: true,
          }
        },
        team1: {
          columns: {
            id: true,
            name: true,
            logoUrl: true,
            rank: true,
          }
        },
        team2: {
          columns: {
            id: true,
            name: true,
            logoUrl: true,
            rank: true,
          }
        },
        winner: {
          columns: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: desc(matches.date),
      limit,
      offset,
    });

    // Format response (simplified for list view - no vetoes/maps for performance)
    const response = matchesList.map(match => ({
      id: match.id,
      externalId: match.externalId,
      event: match.event,
      team1: match.team1,
      team2: match.team2,
      date: match.date ? match.date.toISOString() : null,
      format: match.format,
      status: match.status,
      winnerId: match.winnerId,
      scoreTeam1: match.scoreTeam1,
      scoreTeam2: match.scoreTeam2,
      significance: match.significance,
      hasStats: match.hasStats,
    }));

    return NextResponse.json({
      matches: response,
      pagination: {
        limit,
        offset,
        total: response.length,
      }
    });

  } catch (error: any) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches', details: error.message },
      { status: 500 }
    );
  }
}
