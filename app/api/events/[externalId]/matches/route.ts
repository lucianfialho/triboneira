import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches, teams, events } from '@/lib/db/schema';
import { eq, and, desc, asc, sql, gte, lte, isNotNull, or } from 'drizzle-orm';

export const runtime = 'nodejs';
export const revalidate = 600; // Cache for 10 minutes

export async function GET(
    request: Request,
    context: { params: Promise<{ externalId: string }> }
) {
    try {
        const { externalId } = await context.params;
        const { searchParams } = new URL(request.url);
        const statusFilter = searchParams.get('status'); // live, scheduled, finished

        // First get the event ID
        // Allow searching by internal ID if it's a number
        const searchConditions = [eq(events.externalId, externalId)];
        if (!isNaN(Number(externalId))) {
            searchConditions.push(eq(events.id, Number(externalId)));
        }

        const event = await db
            .select({ id: events.id })
            .from(events)
            .where(or(...searchConditions))
            .limit(1);

        if (!event || event.length === 0) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        const eventId = event[0].id;

        // Helper function to fetch matches by status with proper filters
        const fetchMatchesByStatus = async (status: string) => {
            // Build base conditions
            const conditions = [
                eq(matches.eventId, eventId),
                eq(matches.status, status),
                // Ensure at least team1 has ID (allow TBD for team2 in Swiss system)
                isNotNull(matches.team1Id),
            ];

            // Add date filters for scheduled matches (next 7 days)
            if (status === 'scheduled') {
                const now = new Date();
                const sevenDaysFromNow = new Date();
                sevenDaysFromNow.setDate(now.getDate() + 7);

                conditions.push(
                    isNotNull(matches.date),
                    gte(matches.date, now),
                    lte(matches.date, sevenDaysFromNow)
                );
            }

            const rawMatches = await db
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
                .where(and(...conditions))
                .orderBy(
                    status === 'finished'
                        ? desc(matches.date)  // Most recent first for finished
                        : asc(matches.date)   // Soonest first for scheduled/live
                )
                .limit(
                    status === 'scheduled' ? 10 :
                        status === 'finished' ? 5 :
                            100 // No limit for live (or very high)
                );

            return rawMatches;
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
