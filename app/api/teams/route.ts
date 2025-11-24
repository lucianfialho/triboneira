import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { teams } from '@/lib/db/schema';
import { eq, asc, isNotNull } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);

        // Query parameters
        const active = searchParams.get('active') !== 'false'; // default true
        const withRank = searchParams.get('withRank') === 'true'; // only ranked teams
        const limit = parseInt(searchParams.get('limit') || '50');
        const offset = parseInt(searchParams.get('offset') || '0');

        // Build where conditions
        const conditions = [];
        if (active) {
            conditions.push(eq(teams.active, true));
        }
        if (withRank) {
            conditions.push(isNotNull(teams.rank));
        }

        // Fetch teams
        const teamsList = await db.query.teams.findMany({
            where: conditions.length > 0 ? conditions.reduce((a, b) => ({ ...a, ...b })) : undefined,
            with: {
                game: {
                    columns: {
                        id: true,
                        slug: true,
                        name: true,
                    }
                }
            },
            orderBy: asc(teams.rank), // Order by rank (nulls last)
            limit,
            offset,
        });

        // Format response
        const response = teamsList.map(team => ({
            id: team.id,
            externalId: team.externalId,
            name: team.name,
            country: team.country,
            logoUrl: team.logoUrl,
            rank: team.rank,
            active: team.active,
            game: team.game,
        }));

        return NextResponse.json({
            teams: response,
            pagination: {
                limit,
                offset,
                total: response.length,
            }
        });

    } catch (error: any) {
        console.error('Error fetching teams:', error);
        return NextResponse.json(
            { error: 'Failed to fetch teams', details: error.message },
            { status: 500 }
        );
    }
}
