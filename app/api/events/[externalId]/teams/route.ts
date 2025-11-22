import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { eventParticipants, teams, events } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ externalId: string }> }
) {
    try {
        const { externalId } = await context.params;

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

        // Fetch teams participating in the event
        const teamsData = await db
            .select({
                id: teams.id,
                externalId: teams.externalId,
                name: teams.name,
                rank: teams.rank,
                logoUrl: teams.logoUrl,
                country: teams.country,
                seed: eventParticipants.seed,
                placement: eventParticipants.placement,
            })
            .from(eventParticipants)
            .innerJoin(teams, eq(eventParticipants.teamId, teams.id))
            .where(eq(eventParticipants.eventId, eventId))
            .orderBy(
                sql`COALESCE(${eventParticipants.placement}::integer, 999)`,
                sql`COALESCE(${eventParticipants.seed}, 999)`,
                teams.rank
            );

        return NextResponse.json({ teams: teamsData });
    } catch (error: any) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams', details: error.message },
            { status: 500 }
        );
    }
}
