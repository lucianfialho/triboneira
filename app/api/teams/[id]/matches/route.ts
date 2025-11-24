import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches } from '@/lib/db/schema';
import { eq, or, desc, and } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const teamId = parseInt(id);
        const { searchParams } = new URL(request.url);

        if (isNaN(teamId)) {
            return NextResponse.json(
                { error: 'Invalid team ID' },
                { status: 400 }
            );
        }

        // Query parameters
        const eventId = searchParams.get('eventId');
        const status = searchParams.get('status');
        const limit = parseInt(searchParams.get('limit') || '20');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where conditions
        const conditions = [
            or(
                eq(matches.team1Id, teamId),
                eq(matches.team2Id, teamId)
            )
        ];

        if (eventId) {
            conditions.push(eq(matches.eventId, parseInt(eventId)));
        }
        if (status) {
            conditions.push(eq(matches.status, status));
        }

        // Fetch matches
        const matchesList = await db.query.matches.findMany({
            where: and(...conditions),
            with: {
                event: {
                    columns: {
                        id: true,
                        name: true,
                    }
                },
                team1: {
                    columns: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    }
                },
                team2: {
                    columns: {
                        id: true,
                        name: true,
                        logoUrl: true,
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

        // Format response
        const response = matchesList.map(m => ({
            id: m.id,
            externalId: m.externalId,
            event: m.event,
            team1: m.team1,
            team2: m.team2,
            date: m.date ? m.date.toISOString() : null,
            format: m.format,
            status: m.status,
            winnerId: m.winnerId,
            scoreTeam1: m.scoreTeam1,
            scoreTeam2: m.scoreTeam2,
            significance: m.significance,
            // Indicate if this team won
            result: m.winnerId === teamId ? 'win' : (m.winnerId ? 'loss' : null),
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
        console.error('Error fetching team matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team matches', details: error.message },
            { status: 500 }
        );
    }
}
