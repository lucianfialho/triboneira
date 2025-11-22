import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches, teams, events } from '@/lib/db/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ externalId: string }> }
) {
    try {
        const { externalId } = await context.params;
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status'); // live, scheduled, finished

        // First get the event ID
        const event = await db
            .select({ id: events.id })
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

        // Helper function to fetch matches by status
        const fetchMatchesByStatus = async (status: string) => {
            return await db
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
                        rank: teams.rank,
                        country: teams.country,
                    },
                    team2: {
                        id: sql<number>`t2.id`,
                        externalId: sql<string>`t2.external_id`,
                        name: sql<string>`t2.name`,
                        logoUrl: sql<string>`t2.logo_url`,
                        rank: sql<number>`t2.rank`,
                        country: sql<string>`t2.country`,
                    },
                    winner: {
                        id: sql<number | null>`w.id`,
                        name: sql<string | null>`w.name`,
                    },
                })
                .from(matches)
                .innerJoin(teams, eq(matches.team1Id, teams.id))
                .innerJoin(sql`teams AS t2`, sql`${matches.team2Id} = t2.id`)
                .leftJoin(sql`teams AS w`, sql`${matches.winnerId} = w.id`)
                .where(
                    and(
                        eq(matches.eventId, eventId),
                        eq(matches.status, status)
                    )
                )
                .orderBy(desc(matches.date))
                .limit(status === 'live' ? 10 : 5);
        };

        // If specific status requested, return only that
        if (statusFilter) {
            const matchesData = await fetchMatchesByStatus(statusFilter);
            return NextResponse.json({ [statusFilter]: matchesData });
        }

        // Otherwise, return all statuses
        const [live, scheduled, finished] = await Promise.all([
            fetchMatchesByStatus('live'),
            fetchMatchesByStatus('scheduled'),
            fetchMatchesByStatus('finished'),
        ]);

        return NextResponse.json({
            live,
            scheduled,
            finished,
        });
    } catch (error: any) {
        console.error('Error fetching matches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch matches', details: error.message },
            { status: 500 }
        );
    }
}
