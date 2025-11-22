import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/championship-mode
 * List all events with championship mode enabled
 */
export async function GET(request: Request) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.CRON_SECRET; // Reusing same secret for admin

    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all events with championship mode
    const championshipEvents = await db
      .select()
      .from(events)
      .where(eq(events.championshipMode, true));

    return NextResponse.json({
      success: true,
      count: championshipEvents.length,
      events: championshipEvents.map(e => ({
        id: e.id,
        externalId: e.externalId,
        name: e.name,
        status: e.status,
        dateStart: e.dateStart,
        dateEnd: e.dateEnd,
        prizePool: e.prizePool,
      })),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error getting championship events:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/championship-mode
 * Enable/disable championship mode for an event
 *
 * Body:
 * {
 *   "eventId": 123,  // Internal DB ID
 *   "enabled": true
 * }
 */
export async function POST(request: Request) {
  try {
    // Verify admin secret
    const authHeader = request.headers.get('authorization');
    const adminSecret = process.env.CRON_SECRET;

    if (adminSecret && authHeader !== `Bearer ${adminSecret}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { eventId, enabled } = body;

    if (!eventId || typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Missing or invalid parameters. Required: eventId (number), enabled (boolean)' },
        { status: 400 }
      );
    }

    // Update event
    const [updatedEvent] = await db
      .update(events)
      .set({
        championshipMode: enabled,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning();

    if (!updatedEvent) {
      return NextResponse.json(
        { error: `Event with ID ${eventId} not found` },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Championship mode ${enabled ? 'enabled' : 'disabled'} for event`,
      event: {
        id: updatedEvent.id,
        name: updatedEvent.name,
        championshipMode: updatedEvent.championshipMode,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error updating championship mode:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
