import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, eventParticipants } from '@/lib/db/schema';
import { eq, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ externalId: string }> }
) {
    try {
        const { externalId } = await context.params;

        // Fetch event with participant count
        const eventData = await db
            .select({
                id: events.id,
                externalId: events.externalId,
                name: events.name,
                dateStart: events.dateStart,
                dateEnd: events.dateEnd,
                prizePool: events.prizePool,
                location: events.location,
                status: events.status,
                championshipMode: events.championshipMode,
                totalTeams: sql<number>`COUNT(DISTINCT ${eventParticipants.teamId})`,
            })
            .from(events)
            .leftJoin(eventParticipants, eq(events.id, eventParticipants.eventId))
            .where(eq(events.externalId, externalId))
            .groupBy(events.id)
            .limit(1);

        if (!eventData || eventData.length === 0) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(eventData[0]);
    } catch (error: any) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event data', details: error.message },
            { status: 500 }
        );
    }
}
