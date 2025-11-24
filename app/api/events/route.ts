import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq, desc, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Query parameters
        const status = searchParams.get('status') || 'ongoing';
        const limit = parseInt(searchParams.get('limit') || '10');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where condition
        let whereCondition;
        if (status === 'all') {
            whereCondition = undefined;
        } else if (status === 'active') {
            whereCondition = or(
                eq(events.status, 'ongoing'),
                eq(events.status, 'upcoming')
            );
        } else {
            whereCondition = eq(events.status, status);
        }

        // Fetch events
        const eventsList = await db.query.events.findMany({
            where: whereCondition,
            with: {
                game: {
                    columns: {
                        id: true,
                        slug: true,
                        name: true,
                    }
                }
            },
            orderBy: desc(events.dateStart),
            limit,
            offset,
        });

        // Format response
        const response = eventsList.map(event => ({
            id: event.id,
            externalId: event.externalId,
            name: event.name,
            game: event.game,
            dateStart: event.dateStart ? event.dateStart.toISOString() : null,
            dateEnd: event.dateEnd ? event.dateEnd.toISOString() : null,
            prizePool: event.prizePool,
            location: event.location,
            status: event.status,
            championshipMode: event.championshipMode,
        }));

        return NextResponse.json({
            events: response,
            pagination: {
                limit,
                offset,
                total: response.length,
            }
        });

    } catch (error: any) {
        console.error('Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events', details: error.message },
            { status: 500 }
        );
    }
}
