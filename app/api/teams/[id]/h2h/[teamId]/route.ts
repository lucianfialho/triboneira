import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { headToHead, matches } from '@/lib/db/schema';
import { eq, and, or, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string; teamId: string }> }
) {
    try {
        const { id, teamId } = await context.params;
        const team1Id = parseInt(id);
        const team2Id = parseInt(teamId);
        const { searchParams } = new URL(request.url);

        if (isNaN(team1Id) || isNaN(team2Id)) {
            return NextResponse.json(
                { error: 'Invalid team IDs' },
                { status: 400 }
            );
        }

        const eventId = searchParams.get('eventId');

        // Build where condition for h2h table
        // Note: h2h table might have either team as team1 or team2
        const h2hConditions = [
            or(
                and(
                    eq(headToHead.team1Id, team1Id),
                    eq(headToHead.team2Id, team2Id)
                ),
                and(
                    eq(headToHead.team1Id, team2Id),
                    eq(headToHead.team2Id, team1Id)
                )
            )
        ];

        if (eventId) {
            h2hConditions.push(eq(headToHead.eventId, parseInt(eventId)));
        } else {
            // Get all-time h2h (where eventId is null)
            h2hConditions.push(eq(headToHead.eventId, null as any));
        }

        // Fetch head-to-head record
        const h2hRecord = await db.query.headToHead.findFirst({
            where: and(...h2hConditions),
        });

        // Fetch recent matches between these teams
        const recentMatches = await db.query.matches.findMany({
            where: and(
                or(
                    and(
                        eq(matches.team1Id, team1Id),
                        eq(matches.team2Id, team2Id)
                    ),
                    and(
                        eq(matches.team1Id, team2Id),
                        eq(matches.team2Id, team1Id)
                    )
                ),
                eventId ? eq(matches.eventId, parseInt(eventId)) : undefined
            ),
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
            limit: 10,
        });

        // Format h2h record  
        const record = h2hRecord ? {
            matchesPlayed: h2hRecord.matchesPlayed,
            team1Wins: h2hRecord.team1Id === team1Id ? h2hRecord.team1Wins : h2hRecord.team2Wins,
            team2Wins: h2hRecord.team1Id === team1Id ? h2hRecord.team2Wins : h2hRecord.team1Wins,
            lastMatchDate: h2hRecord.lastMatchDate ? h2hRecord.lastMatchDate.toISOString() : null,
        } : {
            matchesPlayed: 0,
            team1Wins: 0,
            team2Wins: 0,
            lastMatchDate: null,
        };

        // Format matches
        const matchesList = recentMatches.map(m => ({
            id: m.id,
            event: m.event,
            team1: m.team1,
            team2: m.team2,
            date: m.date ? m.date.toISOString() : null,
            status: m.status,
            winnerId: m.winnerId,
            scoreTeam1: m.scoreTeam1,
            scoreTeam2: m.scoreTeam2,
        }));

        return NextResponse.json({
            team1Id,
            team2Id,
            record,
            recentMatches: matchesList,
        });

    } catch (error: any) {
        console.error('Error fetching head-to-head:', error);
        return NextResponse.json(
            { error: 'Failed to fetch head-to-head', details: error.message },
            { status: 500 }
        );
    }
}
