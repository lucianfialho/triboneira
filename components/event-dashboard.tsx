'use client';

import { useState, useEffect } from 'react';
import { Play, Clock, Trophy, Tv, Users, Plus, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';

interface Team {
  id: number;
  name: string;
  logoUrl: string | null;
  rank: number | null;
}

interface Match {
  id: number;
  externalId: string;
  date: string | null;
  team1: Team | null;
  team2: Team | null;
  scoreTeam1: number | null;
  scoreTeam2: number | null;
  format: string | null;
  significance: string | null;
}

interface Stream {
  id: number;
  url: string;
  platform: string;
  channelName: string;
  language: string | null;
  viewerCount: number | null;
  isOfficial: boolean;
  isLive: boolean;
}

interface EventData {
  id: number;
  name: string;
  status: string;
  prizePool: string | null;
  location: string | null;
}

interface OverlayData {
  event: EventData;
  liveMatches: Match[];
  upcomingMatches: Match[];
  finishedMatches: Match[];
  topPlayers: any[];
  topTeams: any[];
  streams: Stream[];
}

interface EventDashboardProps {
  slug: string;
  eventId: string;
  onStartMultistream: (streams: SelectedStream[]) => void;
}

export interface SelectedStream {
  id: string;
  url: string;
  platform: 'twitch' | 'youtube' | 'kick';
  title: string;
  channelName: string;
  viewerCount: number;
  isMuted: boolean;
  volume: number;
  isLive: boolean;
}

export function EventDashboard({ slug, eventId, onStartMultistream }: EventDashboardProps) {
  const [data, setData] = useState<OverlayData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStreams, setSelectedStreams] = useState<Set<number>>(new Set());

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/events/slug/${slug}/overlay`);
        if (response.ok) {
          const overlayData = await response.json();
          setData(overlayData);
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [slug]);

  const toggleStream = (streamId: number) => {
    setSelectedStreams(prev => {
      const newSet = new Set(prev);
      if (newSet.has(streamId)) {
        newSet.delete(streamId);
      } else {
        newSet.add(streamId);
      }
      return newSet;
    });
  };

  const handleStartMultistream = () => {
    if (!data) return;

    const streams: SelectedStream[] = Array.from(selectedStreams)
      .map(streamId => {
        const stream = data.streams.find(s => s.id === streamId);
        if (!stream) return null;

        return {
          id: `stream-${stream.id}`,
          url: stream.url,
          platform: stream.platform as 'twitch' | 'youtube' | 'kick',
          title: `${data.event.name} - ${stream.channelName}`,
          channelName: stream.channelName,
          viewerCount: stream.viewerCount || 0,
          isMuted: false,
          volume: 50,
          isLive: stream.isLive,
        };
      })
      .filter((s): s is SelectedStream => s !== null);

    // Primeiro stream sem mute, demais mutados
    streams.forEach((s, i) => {
      s.isMuted = i > 0;
    });

    onStartMultistream(streams);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[hsl(var(--primary))] mx-auto mb-4"></div>
          <p className="text-[hsl(var(--muted-foreground))]">Carregando evento...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[hsl(var(--background))] flex items-center justify-center">
        <p className="text-[hsl(var(--muted-foreground))]">Erro ao carregar dados do evento</p>
      </div>
    );
  }

  const { event, liveMatches, upcomingMatches, streams } = data;

  return (
    <div className="min-h-screen bg-[hsl(var(--background))] p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            {event.status === 'ongoing' && (
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs font-medium text-red-500 uppercase">Ao Vivo</span>
              </div>
            )}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{event.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            {event.prizePool && (
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                {event.prizePool}
              </div>
            )}
            {event.location && (
              <div className="flex items-center gap-2">
                📍 {event.location}
              </div>
            )}
          </div>
        </div>

        {/* Live Matches */}
        {liveMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              🔴 Jogos ao Vivo
              <Badge variant="default">{liveMatches.length}</Badge>
            </h2>
            <div className="space-y-4">
              {liveMatches.map((match) => (
                <div key={match.id} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    {/* Team 1 */}
                    <div className="flex items-center gap-3 flex-1">
                      {match.team1?.logoUrl && (
                        <Image
                          src={match.team1.logoUrl}
                          alt={match.team1.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain"
                          unoptimized
                        />
                      )}
                      <div>
                        <div className="font-bold text-lg">{match.team1?.name || 'TBD'}</div>
                        {match.team1?.rank && (
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            #{match.team1.rank} no ranking
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Score */}
                    <div className="px-6">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold">{match.scoreTeam1 ?? 0}</span>
                        <span className="text-[hsl(var(--muted-foreground))]">-</span>
                        <span className="text-3xl font-bold">{match.scoreTeam2 ?? 0}</span>
                      </div>
                      {match.format && (
                        <div className="text-xs text-center text-[hsl(var(--muted-foreground))] mt-1">
                          {match.format.toUpperCase()}
                        </div>
                      )}
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-3 flex-1 flex-row-reverse">
                      {match.team2?.logoUrl && (
                        <Image
                          src={match.team2.logoUrl}
                          alt={match.team2.name}
                          width={48}
                          height={48}
                          className="w-12 h-12 object-contain"
                          unoptimized
                        />
                      )}
                      <div className="text-right">
                        <div className="font-bold text-lg">{match.team2?.name || 'TBD'}</div>
                        {match.team2?.rank && (
                          <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            #{match.team2.rank} no ranking
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Matches (Finished) */}
        {data.finishedMatches && data.finishedMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📋 Jogos Recentes
              <Badge variant="outline">{data.finishedMatches.length}</Badge>
            </h2>
            <div className="grid gap-3">
              {data.finishedMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="glass-card p-4 flex items-center justify-between gap-4 opacity-75">
                  {/* Horário */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-sm text-[hsl(var(--muted-foreground))]">
                      {match.date ? new Date(match.date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'TBD'}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex items-center gap-3 flex-1 justify-center">
                    {/* Team 1 */}
                    <div className="flex items-center gap-2">
                      {match.team1?.logoUrl && (
                        <Image
                          src={match.team1.logoUrl}
                          alt={match.team1.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                          unoptimized
                        />
                      )}
                      <span className="font-medium">{match.team1?.name || 'TBD'}</span>
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 px-3">
                      <span className="font-bold text-lg">{match.scoreTeam1 ?? 0}</span>
                      <span className="text-[hsl(var(--muted-foreground))]">-</span>
                      <span className="font-bold text-lg">{match.scoreTeam2 ?? 0}</span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{match.team2?.name || 'TBD'}</span>
                      {match.team2?.logoUrl && (
                        <Image
                          src={match.team2.logoUrl}
                          alt={match.team2.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>

                  {/* Format */}
                  {match.format && (
                    <Badge variant="secondary" className="flex-shrink-0">{match.format.toUpperCase()}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Matches */}
        {upcomingMatches.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              📅 Próximos Jogos
              <Badge variant="outline">{upcomingMatches.length}</Badge>
            </h2>
            <div className="grid gap-3">
              {upcomingMatches.slice(0, 5).map((match) => (
                <div key={match.id} className="glass-card p-4 flex items-center justify-between gap-4">
                  {/* Horário */}
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Clock className="w-4 h-4 text-[hsl(var(--muted-foreground))]" />
                    <div className="text-sm">
                      {match.date ? new Date(match.date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'TBD'}
                    </div>
                  </div>

                  {/* Times */}
                  <div className="flex items-center gap-3 flex-1 justify-center">
                    {/* Team 1 */}
                    <div className="flex items-center gap-2">
                      {match.team1?.logoUrl && (
                        <Image
                          src={match.team1.logoUrl}
                          alt={match.team1.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                          unoptimized
                        />
                      )}
                      <span className="font-medium">{match.team1?.name || 'TBD'}</span>
                    </div>

                    <span className="text-[hsl(var(--muted-foreground))]">vs</span>

                    {/* Team 2 */}
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{match.team2?.name || 'TBD'}</span>
                      {match.team2?.logoUrl && (
                        <Image
                          src={match.team2.logoUrl}
                          alt={match.team2.name}
                          width={24}
                          height={24}
                          className="w-6 h-6 object-contain"
                          unoptimized
                        />
                      )}
                    </div>
                  </div>

                  {/* Format */}
                  {match.format && (
                    <Badge variant="outline" className="flex-shrink-0">{match.format.toUpperCase()}</Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Streams Available */}
        {streams.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Tv className="w-5 h-5" />
              Streams Disponíveis
              <Badge variant="default">{streams.length}</Badge>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {streams.map((stream) => {
                const isSelected = selectedStreams.has(stream.id);
                return (
                  <button
                    key={stream.id}
                    onClick={() => toggleStream(stream.id)}
                    className={`glass-card p-4 text-left transition-all hover:scale-105 ${
                      isSelected ? 'ring-2 ring-[hsl(var(--primary))] bg-[hsl(var(--primary))]/10' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${stream.isLive ? 'bg-red-500' : 'bg-gray-500'}`} />
                        <Badge variant={stream.isOfficial ? 'default' : 'outline'}>
                          {stream.platform}
                        </Badge>
                      </div>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        isSelected ? 'bg-[hsl(var(--primary))]' : 'bg-white/10'
                      }`}>
                        {isSelected ? (
                          <Check className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                    <div className="font-bold mb-1">{stream.channelName}</div>
                    {stream.viewerCount !== null && (
                      <div className="flex items-center gap-1 text-sm text-[hsl(var(--muted-foreground))]">
                        <Users className="w-3 h-3" />
                        {stream.viewerCount.toLocaleString('pt-BR')} assistindo
                      </div>
                    )}
                    {stream.language && (
                      <div className="text-xs text-[hsl(var(--muted-foreground))] mt-1">
                        {stream.language}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* No streams available */}
        {streams.length === 0 && (
          <div className="glass-card p-8 text-center">
            <Tv className="w-12 h-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))]" />
            <h3 className="text-lg font-bold mb-2">Nenhuma stream disponível no momento</h3>
            <p className="text-[hsl(var(--muted-foreground))]">
              As streams aparecerão aqui quando o evento estiver ao vivo
            </p>
          </div>
        )}

        {/* Action Button */}
        {streams.length > 0 && (
          <div className="sticky bottom-4 flex justify-center">
            <Button
              onClick={handleStartMultistream}
              disabled={selectedStreams.size === 0}
              size="lg"
              className="gradient-button shadow-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Assistir {selectedStreams.size > 0 && `(${selectedStreams.size})`}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
