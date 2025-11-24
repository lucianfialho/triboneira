import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { news, events, eventParticipants, teams } from '@/lib/db/schema';
import { eq, desc, or, and, sql, ilike } from 'drizzle-orm';

export const runtime = 'nodejs';
export const revalidate = 600; // Cache for 10 minutes

export async function GET(
    request: Request,
    context: { params: Promise<{ externalId: string }> }
) {
    try {
        const { externalId } = await context.params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        // First get the event and its details
        const event = await db
            .select({
                id: events.id,
                name: events.name,
                gameId: events.gameId,
            })
            .from(events)
            .where(eq(events.externalId, externalId))
            .limit(1);

        if (!event || event.length === 0) {
            return NextResponse.json(
                { error: 'Event not found' },
                { status: 404 }
            );
        }

        const eventData = event[0];

        // Get all team names participating in the event
        const participatingTeams = await db
            .select({ name: teams.name })
            .from(eventParticipants)
            .innerJoin(teams, eq(eventParticipants.teamId, teams.id))
            .where(eq(eventParticipants.eventId, eventData.id));

        const teamNames = participatingTeams.map(t => t.name);

        // Build ILIKE conditions for filtering news
        const eventNameConditions = [
            ilike(news.title, `%${eventData.name}%`),
            ilike(news.description, `%${eventData.name}%`),
        ];

        // Add team name conditions
        const teamConditions = teamNames.flatMap(teamName => [
            ilike(news.title, `%${teamName}%`),
            ilike(news.description, `%${teamName}%`),
        ]);

        // Combine all conditions with OR
        const allConditions = [...eventNameConditions, ...teamConditions];

        // Fetch news filtered by event name or team names
        const newsData = await db
            .select({
                id: news.id,
                externalId: news.externalId,
                title: news.title,
                description: news.description,
                link: news.link,
                publishedAt: news.publishedAt,
                country: news.country,
            })
            .from(news)
            .where(
                and(
                    eq(news.gameId, eventData.gameId),
                    or(...allConditions)
                )
            )
            .orderBy(desc(news.publishedAt))
            .limit(limit);

        return NextResponse.json({ news: newsData, totalTeams: teamNames.length });
    } catch (error: any) {
        console.error('Error fetching news:', error);
        return NextResponse.json(
            { error: 'Failed to fetch news', details: error.message },
            { status: 500 }
        );
    }
}
