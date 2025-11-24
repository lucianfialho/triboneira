import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { matches } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic'; // No caching for real-time data

export async function GET(
    request: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await context.params;
        const matchId = parseInt(id);

        if (isNaN(matchId)) {
            return NextResponse.json(
                { error: 'Invalid match ID' },
                { status: 400 }
            );
        }

        // Fetch match with all relations
        const match = await db.query.matches.findFirst({
            where: eq(matches.id, matchId),
            with: {
                event: {
                    columns: {
                        id: true,
                        name: true,
                        dateStart: true,
                        dateEnd: true,
                    }
                },
                team1: {
                    columns: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        rank: true,
                        country: true,
                    }
                },
                team2: {
                    columns: {
                        id: true,
                        name: true,
                        logoUrl: true,
                        rank: true,
                        country: true,
                    }
                },
                winner: {
                    columns: {
                        id: true,
                        name: true,
                        logoUrl: true,
                    }
                },
                playerOfTheMatch: {
                    columns: {
                        id: true,
                        nickname: true,
                        photoUrl: true,
                        country: true,
                    }
                },
                vetoes: {
                    with: {
                        team: {
                            columns: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: (vetoes, { asc }) => [asc(vetoes.vetoOrder)]
                },
                maps: {
                    orderBy: (maps, { asc }) => [asc(maps.mapNumber)]
                },
                playerStats: {
                    with: {
                        player: {
                            columns: {
                                id: true,
                                nickname: true,
                                photoUrl: true,
                                country: true,
                            }
                        },
                        team: {
                            columns: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: (stats, { desc }) => [desc(stats.rating)]
                }
            }
        });

        if (!match) {
            return NextResponse.json(
                { error: 'Match not found' },
                { status: 404 }
            );
        }

        // Format vetoes response
        const vetoes = match.vetoes.map(veto => ({
            order: veto.vetoOrder,
            type: veto.vetoType,
            map: veto.mapName,
            team: veto.team ? {
                id: veto.team.id,
                name: veto.team.name,
            } : null
        }));

        // Format maps response
        const maps = match.maps.map(map => ({
            mapNumber: map.mapNumber,
            mapName: map.mapName,
            team1Score: map.team1Score,
            team2Score: map.team2Score,
            winnerTeamId: map.winnerTeamId,
            halfTeam1Score: map.halfTeam1Score,
            halfTeam2Score: map.halfTeam2Score,
            overtimeRounds: map.overtimeRounds,
            statsId: map.statsId,
        }));

        // Format player stats response (null if no stats available)
        const playerStats = match.hasStats && match.playerStats.length > 0
            ? match.playerStats.map(stat => ({
                player: {
                    id: stat.player.id,
                    nickname: stat.player.nickname,
                    photoUrl: stat.player.photoUrl,
                    country: stat.player.country,
                },
                team: stat.team ? {
                    id: stat.team.id,
                    name: stat.team.name,
                } : null,
                kills: stat.kills,
                deaths: stat.deaths,
                assists: stat.assists,
                adr: stat.adr ? parseFloat(stat.adr) : null,
                rating: stat.rating ? parseFloat(stat.rating) : null,
                kast: stat.kast ? parseFloat(stat.kast) : null,
                hsPercentage: stat.hsPercentage ? parseFloat(stat.hsPercentage) : null,
                flashAssists: stat.flashAssists,
                impact: stat.impact ? parseFloat(stat.impact) : null,
                firstKillsDiff: stat.firstKillsDiff,
                isPlayerOfTheMatch: stat.isPlayerOfTheMatch,
            }))
            : null;

        // Build response
        const response = {
            id: match.id,
            externalId: match.externalId,
            source: match.source,
            event: match.event,
            team1: match.team1,
            team2: match.team2,
            date: match.date ? match.date.toISOString() : null,
            format: match.format,
            status: match.status,
            winnerId: match.winnerId,
            scoreTeam1: match.scoreTeam1,
            scoreTeam2: match.scoreTeam2,
            significance: match.significance,
            hasStats: match.hasStats,
            statsLastSyncedAt: match.statsLastSyncedAt ? match.statsLastSyncedAt.toISOString() : null,
            winner: match.winner,
            playerOfTheMatch: match.playerOfTheMatch,
            vetoes,
            maps,
            playerStats,
        };

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Error fetching match:', error);
        return NextResponse.json(
            { error: 'Failed to fetch match', details: error.message },
            { status: 500 }
        );
    }
}
