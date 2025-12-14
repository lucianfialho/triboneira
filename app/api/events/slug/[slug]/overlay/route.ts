import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events, eventStreams } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const revalidate = 300; // ISR: 5 minutos (mais frequente para dados ao vivo)

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://multistream-cron-service-production.up.railway.app';

/**
 * GET /api/events/slug/[slug]/overlay
 * API otimizada que agrega TODOS os dados necessários para o event overlay:
 * - Informações básicas do evento
 * - Matches (da API FastAPI)
 * - Top Players (da API FastAPI)
 * - Top Teams (da API FastAPI)
 * - Streams ao vivo (do banco local)
 *
 * Usa queries paralelas para melhor performance
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;

    // 1. Buscar evento básico do banco local
    const event = await db.query.events.findFirst({
      where: eq(events.slug, slug),
      columns: {
        id: true,
        externalId: true,
        slug: true,
        name: true,
        status: true,
        dateStart: true,
        dateEnd: true,
        prizePool: true,
        location: true,
        championshipMode: true,
      },
    });

    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // 2. Queries paralelas: FastAPI overlay + streams locais
    const [fastapiData, streams] = await Promise.all([
      // Buscar dados da API FastAPI
      fetch(`${FASTAPI_URL}/api/events/${slug}/overlay`, {
        next: { revalidate: 300 } // 5 minutos de cache
      }).then(res => res.ok ? res.json() : null).catch(() => null),

      // Streams ao vivo do banco local
      db.query.eventStreams.findMany({
        where: and(
          eq(eventStreams.eventId, event.id),
          eq(eventStreams.isLive, true)
        ),
        orderBy: [desc(eventStreams.isOfficial), desc(eventStreams.viewerCount)],
      }),
    ]);

    // 3. Processar dados da FastAPI
    const matches = fastapiData?.matches || [];
    const topPlayers = fastapiData?.topPlayers || [];
    const topTeams = fastapiData?.topTeams || [];

    // Separar matches por status
    const liveMatches = matches.filter((m: any) => m.status === 'live');
    const upcomingMatches = matches.filter((m: any) => m.status === 'upcoming' || m.status === 'scheduled');
    const finishedMatches = matches.filter((m: any) => m.status === 'finished').slice(0, 10);

    // Converter formato da FastAPI para o formato esperado pelo frontend
    const convertMatch = (m: any) => ({
      id: m.id,
      externalId: m.external_id,
      date: m.date,
      team1: m.team1_name ? {
        id: 0,
        name: m.team1_name,
        logoUrl: m.team1_logo,
        rank: null,
      } : null,
      team2: m.team2_name ? {
        id: 0,
        name: m.team2_name,
        logoUrl: m.team2_logo,
        rank: null,
      } : null,
      scoreTeam1: m.team1_score,
      scoreTeam2: m.team2_score,
      format: m.map ? `${m.map}` : null,
      significance: null,
    });

    return NextResponse.json({
      event: {
        id: event.id,
        externalId: event.externalId,
        slug: event.slug,
        name: event.name,
        status: event.status,
        dateStart: event.dateStart?.toISOString() || null,
        dateEnd: event.dateEnd?.toISOString() || null,
        prizePool: event.prizePool,
        location: event.location,
        championshipMode: event.championshipMode,
      },
      liveMatches: liveMatches.map(convertMatch),
      upcomingMatches: upcomingMatches.map(convertMatch),
      finishedMatches: finishedMatches.map(convertMatch),
      topPlayers: topPlayers.map((p: any) => ({
        playerName: p.player_name,
        teamName: p.team_name,
        rating: p.rating,
        kdRatio: p.kd_ratio,
        mapsPlayed: p.maps_played,
      })),
      topTeams: topTeams.map((t: any) => ({
        teamName: t.team_name,
        teamLogo: t.team_logo,
        wins: t.wins,
        losses: t.losses,
        winRate: t.win_rate,
        mapsPlayed: t.maps_played,
      })),
      streams: streams.map((s) => ({
        id: s.id,
        url: s.streamUrl,
        platform: s.platform,
        channelName: s.channelName,
        language: s.language,
        country: s.country,
        isOfficial: s.isOfficial,
        viewerCount: s.viewerCount,
        isLive: s.isLive,
      })),
    });
  } catch (error) {
    console.error('Error fetching event overlay data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
