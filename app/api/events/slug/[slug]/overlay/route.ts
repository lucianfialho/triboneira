import { NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { events } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export const revalidate = 300; // ISR: 5 minutos (mais frequente para dados ao vivo)

const FASTAPI_URL = process.env.FASTAPI_URL || 'https://multistream-cron-service-production.up.railway.app';

/**
 * GET /api/events/slug/[slug]/overlay
 * API otimizada que agrega TODOS os dados necessários para o event overlay:
 * - Informações básicas do evento
 * - Matches (da API FastAPI)
 * - Top Players (da API FastAPI)
 * - Top Teams (da API FastAPI)
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

    // 2. Buscar dados da API FastAPI com limites maiores
    // - matches_limit: 500 (para eventos grandes)
    // - teams_limit: 50 (todos os times do evento)
    // - players_limit: 50 (top 50 jogadores quando disponível)
    const fastapiData = await fetch(
      `${FASTAPI_URL}/api/events/${slug}/overlay?matches_limit=500&teams_limit=50&players_limit=50`,
      { next: { revalidate: 300 } }
    ).then(res => res.ok ? res.json() : null).catch(() => null);

    // 3. Processar dados da FastAPI
    const matches = fastapiData?.matches || [];
    const topPlayers = fastapiData?.topPlayers || [];
    const topTeams = fastapiData?.topTeams || [];
    const highlights = fastapiData?.highlights || [];
    const fastapiEventStatus = fastapiData?.event?.status || event.status || 'upcoming';

    // Separar matches por status
    const liveMatches = matches.filter((m: any) => m.status === 'live');
    const upcomingMatches = matches.filter((m: any) => m.status === 'upcoming' || m.status === 'scheduled');

    // Se o evento acabou, mostra TODAS as partidas finalizadas (histórico completo)
    // Se ainda está rolando, mostra apenas as 10 mais recentes
    const allFinishedMatches = matches.filter((m: any) => m.status === 'finished');
    const finishedMatches = fastapiEventStatus === 'finished'
      ? allFinishedMatches  // Evento acabou: mostra todas
      : allFinishedMatches.slice(0, 10);  // Evento ativo: mostra só as 10 mais recentes

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
        status: fastapiEventStatus,  // Use status from FastAPI (source of truth)
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
      highlights: highlights.map((h: any) => ({
        title: h.title,
        url: h.url,
        embed_url: h.embed_url,
        thumbnail: h.thumbnail,
        video_id: h.video_id,
        duration: h.duration,
        platform: h.platform,
        view_count: h.view_count,
      })),
      streams: [], // TODO: Buscar streams quando disponível
    });
  } catch (error) {
    console.error('Error fetching event overlay data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
