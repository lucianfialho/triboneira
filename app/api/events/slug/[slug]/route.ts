import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 600; // ISR: 10 minutos

/**
 * GET /api/events/slug/[slug]
 * Retorna informações básicas do evento
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    const event = await db.query.events.findFirst({
      where: eq(events.slug, slug),
      with: {
        game: {
          columns: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: event.id,
      externalId: event.externalId,
      slug: event.slug,
      name: event.name,
      game: event.game,
      dateStart: event.dateStart?.toISOString() || null,
      dateEnd: event.dateEnd?.toISOString() || null,
      prizePool: event.prizePool,
      location: event.location,
      status: event.status,
      championshipMode: event.championshipMode,
      streams: [], // TODO: Buscar streams quando disponível
    });
  } catch (error) {
    console.error('Error fetching event by slug:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
