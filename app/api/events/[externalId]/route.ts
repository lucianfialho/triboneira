import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq, asc, desc, or } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ externalId: string }> }
) {
    try {
        const { externalId } = await context.params;

        // Fetch event with full details
        const searchConditions = [eq(events.externalId, externalId)];
        if (!isNaN(Number(externalId))) {
            searchConditions.push(eq(events.id, Number(externalId)));
        }

        const event = await db.query.events.findFirst({
            where: or(...searchConditions),
            with: {
                game: {
                    columns: {
                        id: true,
                        slug: true,
                        name: true,
                    }
                },
                participants: {
                    with: {
                        team: {
                            columns: {
                                id: true,
                                name: true,
                                logoUrl: true,
                                rank: true,
                                country: true,
                            }
                        }
                    },
                    orderBy: (participants, { asc }) => [asc(participants.seed)],
                },
                matches: {
                    with: {
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
                    orderBy: (matches, { desc }) => [desc(matches.date)],
                    limit: 50,
                }
            }
        });

        if (!event) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        // Format participants
        const participants = event.participants.map(p => ({
            seed: p.seed,
            placement: p.placement,
            prizeMoney: p.prizeMoney,
            team: p.team,
        }));

        // Format matches
        const matches = event.matches.map(m => ({
            id: m.id,
            externalId: m.externalId,
            team1: m.team1,
            team2: m.team2,
            date: m.date ? m.date.toISOString() : null,
            format: m.format,
            status: m.status,
            winnerId: m.winnerId,
            scoreTeam1: m.scoreTeam1,
            scoreTeam2: m.scoreTeam2,
            significance: m.significance,
        }));

        // Build response
        const response = {
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
            metadata: event.metadata,
            participants,
            matches,
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Error fetching event:', error);
        return NextResponse.json(
            { error: 'Failed to fetch event', details: error.message },
            { status: 500 }
        );
    }
}
