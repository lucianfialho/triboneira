import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface StageInfo {
  id: number;
  externalId: string;
  name: string;
  shortName: string;  // "Stage 1", "Stage 2", "Playoffs"
  type: 'swiss' | 'bracket' | 'qualifier' | 'other';
  status: string;
  dateStart: string | null;
  dateEnd: string | null;
  numberOfTeams: number | null;
}

interface StagesResponse {
  event: {
    id: number;
    externalId: string;
    name: string;
    status: string;
  };
  hasStages: boolean;
  stages: StageInfo[];
}

function detectStageType(name: string): 'swiss' | 'bracket' | 'qualifier' | 'other' {
  const lowerName = name.toLowerCase();

  if (lowerName.includes('qualifier')) return 'qualifier';
  if (lowerName.includes('stage 1') || lowerName.includes('stage 2')) return 'swiss';
  if (lowerName.includes('playoff') || (!lowerName.includes('stage') && !lowerName.includes('qualifier'))) {
    return 'bracket';
  }

  return 'other';
}

function extractShortName(name: string, mainEventName: string): string {
  // Remove o nome do evento principal para deixar só a parte do stage
  let shortName = name.replace(mainEventName, '').trim();

  // Se começar com hífen ou espaço, remove
  shortName = shortName.replace(/^[-\s]+/, '');

  // Casos específicos
  if (shortName.toLowerCase().includes('stage 1')) return 'Stage 1';
  if (shortName.toLowerCase().includes('stage 2')) return 'Stage 2';
  if (shortName === '') return 'Playoffs';
  if (shortName.toLowerCase().includes('qualifier')) {
    // Tenta extrair a região: "Europe Regional Qualifier" -> "Europe"
    const match = shortName.match(/^(\w+)\s+Regional\s+Qualifier/i);
    if (match) return match[1];
    return 'Qualifier';
  }

  return shortName;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ externalId: string }> }
) {
  try {
    const { externalId } = await context.params;

    // Get main event
    const mainEvent = await db
      .select({
        id: events.id,
        externalId: events.externalId,
        name: events.name,
        status: events.status,
        metadata: events.metadata,
      })
      .from(events)
      .where(eq(events.externalId, externalId))
      .limit(1);

    if (!mainEvent || mainEvent.length === 0) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = mainEvent[0];

    // Check if event has related events in metadata
    const metadata = eventData.metadata as any;
    const relatedEvents = metadata?.relatedEvents || [];

    if (relatedEvents.length === 0) {
      return NextResponse.json({
        event: {
          id: eventData.id,
          externalId: eventData.externalId,
          name: eventData.name,
          status: eventData.status,
        },
        hasStages: false,
        stages: [],
      });
    }

    // Extract external IDs from related events
    const relatedExternalIds = relatedEvents.map((e: any) => String(e.id));

    // Fetch all related events from database
    const relatedEventsData = await db
      .select({
        id: events.id,
        externalId: events.externalId,
        name: events.name,
        status: events.status,
        dateStart: events.dateStart,
        dateEnd: events.dateEnd,
        metadata: events.metadata,
      })
      .from(events)
      .where(inArray(events.externalId, relatedExternalIds));

    // Add main event to the list (it might be the Playoffs)
    const allEventsData = [...relatedEventsData];

    // Check if main event should be included (if it's not already in relatedEvents)
    const mainEventIncluded = relatedEventsData.some(e => e.externalId === eventData.externalId);
    if (!mainEventIncluded) {
      allEventsData.push({
        id: eventData.id,
        externalId: eventData.externalId,
        name: eventData.name,
        status: eventData.status,
        dateStart: null,
        dateEnd: null,
        metadata: eventData.metadata,
      });
    }

    // Extract base event name (e.g., "StarLadder Budapest Major 2025")
    // Remove "Stage X" or other suffixes from main event name
    const baseEventName = eventData.name
      .replace(/\s+(Stage\s+\d+|Playoffs?)$/i, '')
      .trim();

    // Build stages array
    const stages: StageInfo[] = allEventsData
      .map(event => {
        const metadata = event.metadata as any;
        const type = detectStageType(event.name);
        const shortName = extractShortName(event.name, baseEventName);

        return {
          id: event.id,
          externalId: event.externalId,
          name: event.name,
          shortName,
          type,
          status: event.status,
          dateStart: event.dateStart ? event.dateStart.toISOString() : null,
          dateEnd: event.dateEnd ? event.dateEnd.toISOString() : null,
          numberOfTeams: metadata?.numberOfTeams || null,
        };
      })
      // Filter: only keep events from the same Major + not qualifiers
      .filter(stage => {
        // Remove qualifiers
        if (stage.type === 'qualifier') return false;

        // Keep only events with same base name
        return stage.name.includes(baseEventName);
      })
      // Sort: Stage 1 -> Stage 2 -> Playoffs
      .sort((a, b) => {
        const order = { swiss: 1, bracket: 2, other: 3 };
        if (a.type !== b.type) {
          return (order[a.type] || 999) - (order[b.type] || 999);
        }
        // If same type, sort by name
        return a.name.localeCompare(b.name);
      });

    const response: StagesResponse = {
      event: {
        id: eventData.id,
        externalId: eventData.externalId,
        name: eventData.name,
        status: eventData.status,
      },
      hasStages: stages.length > 0,
      stages,
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('Error fetching stages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stages', details: error.message },
      { status: 500 }
    );
  }
}
