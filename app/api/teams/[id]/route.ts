import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { teams, matches } from '@/lib/db/schema';
import { eq, or, desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const teamId = parseInt(id);

        if (isNaN(teamId)) {
            return NextResponse.json(
                { error: 'Invalid team ID' },
                { status: 400 }
            );
        }

        // Fetch team with relations
        const team = await db.query.teams.findFirst({
            where: eq(teams.id, teamId),
            with: {
                game: {
                    columns: {
                        id: true,
                        slug: true,
                        name: true,
                    }
                },
                rosters: {
                    where: (rosters, { eq }) => eq(rosters.active, true),
                    with: {
                        player: {
                            columns: {
                                id: true,
                                nickname: true,
                                realName: true,
                                country: true,
                                photoUrl: true,
                            }
                        }
                    }
                },
                stats: {
                    where: (stats, { isNull }) => isNull(stats.eventId), // all-time stats
                    limit: 1,
                }
            }
        });

        if (!team) {
            return NextResponse.json(
                { error: 'Team not found' },
                { status: 404 }
            );
        }

        // Get recent matches (last 10)
        const recentMatches = await db.query.matches.findMany({
            where: or(
                eq(matches.team1Id, teamId),
                eq(matches.team2Id, teamId)
            ),
            with: {
                event: {
                    columns: {
                        id: true,
                        name: true,
                    }
                },
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
            orderBy: desc(matches.date),
            limit: 10,
        });

        // Format roster
        const roster = team.rosters.map(r => ({
            role: r.role,
            joinedAt: r.joinedAt ? r.joinedAt.toISOString() : null,
            player: r.player,
        }));

        // Format stats
        const stats = team.stats[0] ? {
            matchesPlayed: team.stats[0].matchesPlayed,
            wins: team.stats[0].wins,
            losses: team.stats[0].losses,
            draws: team.stats[0].draws,
            winRate: team.stats[0].winRate ? parseFloat(team.stats[0].winRate) : null,
            mapsPlayed: team.stats[0].mapsPlayed,
            mapsWon: team.stats[0].mapsWon,
            roundsWon: team.stats[0].roundsWon,
            roundsLost: team.stats[0].roundsLost,
            avgRoundDiff: team.stats[0].avgRoundDiff ? parseFloat(team.stats[0].avgRoundDiff) : null,
        } : null;

        // Format matches
        const matchesList = recentMatches.map(m => ({
            id: m.id,
            event: m.event,
            team1: m.team1,
            team2: m.team2,
            date: m.date ? m.date.toISOString() : null,
            status: m.status,
            winnerId: m.winnerId,
            scoreTeam1: m.scoreTeam1,
            scoreTeam2: m.scoreTeam2,
            // Indicate if this team won
            result: m.winnerId === teamId ? 'win' : (m.winnerId ? 'loss' : 'draw'),
        }));

        // Build response
        const response = {
            id: team.id,
            externalId: team.externalId,
            name: team.name,
            country: team.country,
            logoUrl: team.logoUrl,
            rank: team.rank,
            active: team.active,
            game: team.game,
            roster,
            stats,
            recentMatches: matchesList,
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Error fetching team:', error);
        return NextResponse.json(
            { error: 'Failed to fetch team', details: error.message },
            { status: 500 }
        );
    }
}
