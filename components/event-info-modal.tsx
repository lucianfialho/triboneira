'use client';
// Event Info Modal Component

import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, MapPin, DollarSign, Gamepad2, Award, Users, Newspaper } from 'lucide-react';
import { DialogContent, Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventInfo } from '@/hooks/use-event-info';
import { useEventMatches } from '@/hooks/use-event-matches';
import VisualBracketTab from '@/components/event-info/visual-bracket-tab';

interface EventInfoModalProps {
    externalId: string;
    open: boolean;
    onClose: () => void;
}

export default function EventInfoModal({ externalId, open, onClose }: EventInfoModalProps) {
    const [activeTab, setActiveTab] = useState('matches');
    const [brazilianTeams, setBrazilianTeams] = useState<string[]>([]);
    const { data: eventData, loading: eventLoading } = useEventInfo(open ? externalId : null);
    const { data: matchesData, loading: matchesLoading } = useEventMatches(
        open ? externalId : null,
        activeTab === 'matches'
    );

    // Fetch Brazilian teams
    useEffect(() => {
        if (!open || !externalId) return;

        const fetchBrazilianTeams = async () => {
            try {
                const response = await fetch(`/api/events/${externalId}/teams`);
                const data = await response.json();
                const brTeams = data.teams
                    ?.filter((team: any) => team.country === 'BR')
                    .map((team: any) => team.name) || [];
                setBrazilianTeams(brTeams);
            } catch (error) {
                console.error('Error fetching Brazilian teams:', error);
            }
        };

        fetchBrazilianTeams();
    }, [externalId, open]);

    const formatDate = (date: string | null) => {
        if (!date) return 'TBD';
        return new Date(date).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="w-screen h-screen max-w-none max-h-none overflow-hidden p-0 bg-black/95 backdrop-blur-2xl border-none m-0 rounded-none">
                {/* Header */}
                <DialogHeader className="p-6 pb-4 border-b border-[hsl(var(--border))] bg-gradient-to-b from-[hsl(var(--surface-elevated))] to-transparent">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <Trophy className="w-5 h-5 text-[hsl(var(--primary))]" />
                                <DialogTitle className="text-2xl font-bold text-white">
                                    {eventLoading ? 'Loading...' : eventData?.name || 'Event Info'}
                                </DialogTitle>

                                <div className="ml-auto flex items-center gap-2 mr-12">
                                    {/* Brazilian Teams Badge */}
                                    {brazilianTeams.length > 0 && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-green-500/30">
                                            <span className="text-xl">🇧🇷</span>
                                            <span className="text-sm font-semibold text-green-400">
                                                {brazilianTeams.length === 1
                                                    ? brazilianTeams[0]
                                                    : `${brazilianTeams.length} Times BR`}
                                            </span>
                                        </div>
                                    )}

                                    {/* Prize Pool Badge */}
                                    {eventData?.prizePool && (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
                                            <DollarSign className="w-5 h-5 text-yellow-500" />
                                            <span className="text-lg font-bold text-yellow-500">
                                                {eventData.prizePool}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {eventData && (
                                <div className="flex flex-wrap items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                                    {eventData.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            <span>{eventData.location}</span>
                                        </div>
                                    )}
                                    {eventData.dateStart && (
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-4 h-4" />
                                            <span>
                                                {formatDate(eventData.dateStart)} - {formatDate(eventData.dateEnd)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </DialogHeader>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="w-full justify-start border-b border-[hsl(var(--border))] rounded-none bg-transparent px-6 h-auto p-0">
                        <TabsTrigger
                            value="matches"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--primary))] rounded-none px-4 py-3 data-[state=active]:bg-transparent flex items-center gap-2"
                        >
                            <Gamepad2 className="w-4 h-4" />
                            Matches
                            {matchesData.live.length > 0 && (
                                <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-red-500 text-white">
                                    {matchesData.live.length} Live
                                </span>
                            )}
                        </TabsTrigger>
                        <TabsTrigger
                            value="bracket"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--primary))] rounded-none px-4 py-3 data-[state=active]:bg-transparent flex items-center gap-2"
                        >
                            <Award className="w-4 h-4" />
                            Swiss
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-6 min-h-[679px]">
                        <TabsContent value="matches" className="mt-0">
                            <MatchesTab matchesData={matchesData} loading={matchesLoading} externalId={externalId} />
                        </TabsContent>
                        <TabsContent value="bracket" className="mt-0">
                            <VisualBracketTab externalId={externalId} enabled={activeTab === 'bracket'} />
                        </TabsContent>

                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// News Card Component
function NewsCard({ news }: { news: any }) {
    const formatRelativeTime = (date: string | null) => {
        if (!date) return '';
        const now = new Date();
        const published = new Date(date);
        const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Agora';
        if (diffInHours < 24) return `${diffInHours}h`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1d';
        if (diffInDays < 7) return `${diffInDays}d`;
        return `${Math.floor(diffInDays / 7)}sem`;
    };

    return (
        <a
            href={news.link}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card p-3 hover:bg-[hsl(var(--surface-elevated))] transition-all block group"
        >
            <h4 className="text-sm font-semibold text-white mb-1 group-hover:text-[hsl(var(--primary))] transition-colors line-clamp-2">
                {news.title}
            </h4>
            {news.publishedAt && (
                <p className="text-xs text-[hsl(var(--subtle-foreground))]">
                    {formatRelativeTime(news.publishedAt)}
                </p>
            )}
        </a>
    );
}

// Matches Tab with Three Sections Layout
function MatchesTab({ matchesData, loading, externalId }: { matchesData: any; loading: boolean; externalId: string }) {
    const [teams, setTeams] = useState<any[]>([]);
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [news, setNews] = useState<any[]>([]);
    const [newsLoading, setNewsLoading] = useState(true);
    const [showOnlyBrazilian, setShowOnlyBrazilian] = useState(true);

    // Fetch teams when externalId is available
    useEffect(() => {
        if (!externalId) {
            setTeamsLoading(false);
            return;
        }

        const fetchTeams = async () => {
            try {
                const response = await fetch(`/api/events/${externalId}/teams`);
                const data = await response.json();
                setTeams(data.teams || []);
            } catch (error) {
                console.error('Error fetching teams:', error);
            } finally {
                setTeamsLoading(false);
            }
        };

        fetchTeams();
    }, [externalId]);

    // Fetch news when externalId is available
    useEffect(() => {
        if (!externalId) {
            setNewsLoading(false);
            return;
        }

        const fetchNews = async () => {
            try {
                const response = await fetch(`/api/events/${externalId}/news?limit=10`);
                const data = await response.json();
                setNews(data.news || []);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setNewsLoading(false);
            }
        };

        fetchNews();
    }, [externalId]);

    if (loading) {
        return <div className="text-center text-[hsl(var(--muted-foreground))] py-12">Loading matches...</div>;
    }

    const upcomingMatches = [...matchesData.live, ...matchesData.scheduled];
    const hasMatches = upcomingMatches.length > 0 || matchesData.finished.length > 0;

    if (!hasMatches) {
        return (
            <div className="text-center text-[hsl(var(--muted-foreground))] py-12">
                No matches available
            </div>
        );
    }

    // Filter teams based on showOnlyBrazilian
    const filteredTeams = showOnlyBrazilian
        ? teams.filter(team => team.country === 'BR')
        : teams;

    const brazilianTeamsCount = teams.filter(team => team.country === 'BR').length;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6">
            {/* Left Column: Upcoming Matches - More Compact */}
            <div className="space-y-6">
                {matchesData.live.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 sticky top-0 bg-black/95 backdrop-blur-sm py-2">
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                            Live Matches ({matchesData.live.length})
                        </h3>
                        <div className="space-y-2">
                            {matchesData.live.map((match: any) => (
                                <MatchCard key={match.id} match={match} isLive compact />
                            ))}
                        </div>
                    </div>
                )}

                {matchesData.scheduled.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 sticky top-0 bg-black/95 backdrop-blur-sm py-2">
                            Upcoming Matches
                        </h3>
                        <div className="space-y-2">
                            {matchesData.scheduled.slice(0, 10).map((match: any) => (
                                <MatchCard key={match.id} match={match} compact />
                            ))}
                        </div>
                    </div>
                )}

                {matchesData.finished.length > 0 && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-3 sticky top-0 bg-black/95 backdrop-blur-sm py-2">
                            Recent Results
                        </h3>
                        <div className="space-y-2">
                            {matchesData.finished.slice(0, 5).map((match: any) => (
                                <MatchCard key={match.id} match={match} compact />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Participating Teams + News */}
            <div className="space-y-6">
                {/* Teams Section */}
                <div>
                    <div className="flex items-center justify-between mb-3 sticky top-0 bg-black/95 backdrop-blur-sm py-2 z-10">
                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-[hsl(var(--primary))]" />
                            Participating Teams
                        </h3>
                        {teams.length > 0 && (
                            <button
                                onClick={() => setShowOnlyBrazilian(!showOnlyBrazilian)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${showOnlyBrazilian
                                    ? 'bg-gradient-to-r from-green-500/20 to-yellow-500/20 border border-green-500/30 text-green-400'
                                    : 'bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--surface))]'
                                    }`}
                            >
                                <span>🇧🇷</span>
                                {showOnlyBrazilian ? `${brazilianTeamsCount} BR` : `Filtrar BR ${brazilianTeamsCount > 0 ? `(${brazilianTeamsCount})` : ''}`}
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-4 gap-1">
                        {teamsLoading ? (
                            [...Array(8)].map((_, i) => (
                                <div key={i} className="flex flex-col items-center gap-2 p-2 rounded animate-pulse">
                                    <div className="w-12 h-12 bg-[hsl(var(--border))] rounded" />
                                    <div className="w-full h-3 bg-[hsl(var(--border))] rounded" />
                                </div>
                            ))
                        ) : filteredTeams.length > 0 ? (
                            filteredTeams.map((team) => (
                                <TeamListItem key={team.id} team={team} />
                            ))
                        ) : (
                            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8 col-span-4">
                                {showOnlyBrazilian ? 'Nenhum time brasileiro neste evento' : 'No teams data available'}
                            </p>
                        )}
                    </div>
                </div>

                {/* News Section */}
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2 sticky top-0 bg-black/95 backdrop-blur-sm py-2 z-10">
                        <Newspaper className="w-5 h-5 text-[hsl(var(--primary))]" />
                        Latest News
                    </h3>
                    <div className="space-y-2">
                        {newsLoading ? (
                            [...Array(3)].map((_, i) => (
                                <div key={i} className="glass-card p-3 animate-pulse">
                                    <div className="h-4 bg-[hsl(var(--border))] rounded w-3/4 mb-2" />
                                    <div className="h-3 bg-[hsl(var(--border))] rounded w-full mb-2" />
                                    <div className="h-2 bg-[hsl(var(--border))] rounded w-1/4" />
                                </div>
                            ))
                        ) : news.length > 0 ? (
                            news.map((item) => (
                                <NewsCard key={item.id} news={item} />
                            ))
                        ) : (
                            <p className="text-sm text-[hsl(var(--muted-foreground))] text-center py-8">
                                No news available
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MatchCard({ match, isLive = false, compact = false }: { match: any; isLive?: boolean; compact?: boolean }) {
    return (
        <div className="glass-card p-4 hover:bg-[hsl(var(--surface-elevated))] transition-all">
            <div className="flex items-center justify-between">
                <div className={`flex-1 grid ${compact ? 'grid-cols-[1fr_auto_1fr]' : 'grid-cols-[1fr_auto_1fr]'} items-center gap-3`}>
                    {/* Team 1 */}
                    <div className="flex items-center gap-2 justify-end">
                        <span className="text-sm font-semibold text-white truncate">{match.team1.name}</span>
                        {match.team1.logoUrl && (
                            <img src={match.team1.logoUrl} alt={match.team1.name} className="w-7 h-7 rounded" />
                        )}
                        {match.scoreTeam1 !== null && (
                            <span className="text-xl font-bold text-white tabular-nums w-8 text-center">
                                {match.scoreTeam1}
                            </span>
                        )}
                    </div>

                    {/* VS / Score */}
                    <div className="text-center">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] px-2">vs</span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-2">
                        {match.scoreTeam2 !== null && (
                            <span className="text-xl font-bold text-white tabular-nums w-8 text-center">
                                {match.scoreTeam2}
                            </span>
                        )}
                        {match.team2.logoUrl && (
                            <img src={match.team2.logoUrl} alt={match.team2.name} className="w-7 h-7 rounded" />
                        )}
                        <span className="text-sm font-semibold text-white truncate">{match.team2.name}</span>
                    </div>
                </div>

                {/* Match Info - Only show if not compact */}
                {!compact && (
                    <div className="flex items-center gap-3 ml-6">
                        {match.format && (
                            <span className="text-xs px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] uppercase">
                                {match.format}
                            </span>
                        )}
                        {isLive && (
                            <span className="text-xs px-2 py-1 rounded bg-red-500 text-white font-medium flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                LIVE
                            </span>
                        )}
                    </div>
                )}
                {compact && isLive && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-red-500 animate-pulse flex-shrink-0" />
                )}
            </div>
        </div>
    );
}

function TeamListItem({ team }: { team: any }) {
    const isBrazilian = team.country === 'BR';
    const getFlagEmoji = (countryCode: string): string => {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    };

    return (
        <div
            className={`flex flex-col items-center gap-1 p-1.5 rounded hover:bg-[hsl(var(--surface))] transition-colors ${isBrazilian ? 'bg-gradient-to-br from-green-500/10 to-yellow-500/10 border border-green-500/20' : ''
                }`}
        >
            {/* Team Logo with Badge */}
            <div className="w-12 h-12 flex-shrink-0 rounded bg-[hsl(var(--surface))] overflow-hidden relative">
                {team.logoUrl ? (
                    <img
                        src={team.logoUrl}
                        alt={team.name}
                        className="w-full h-full object-contain p-1"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm font-bold text-[hsl(var(--muted-foreground))]">
                        {team.name.charAt(0)}
                    </div>
                )}

                {/* Rank Badge - Positioned OVER the logo */}
                {team.rank && team.rank <= 30 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-[10px] font-bold text-white border-2 border-black shadow-lg z-10">
                        #{team.rank}
                    </div>
                )}
            </div>

            {/* Team Info */}
            <div className="w-full text-center space-y-0">
                <div className="flex items-center justify-center gap-0.5">
                    <h4 className="text-xs font-semibold text-white truncate">
                        {team.name}
                    </h4>
                    {isBrazilian && <span className="text-xs">🇧🇷</span>}
                </div>
                <div className="flex items-center justify-center gap-1 text-[9px] text-[hsl(var(--muted-foreground))]">
                    {team.country && !isBrazilian && (
                        <span className="flex items-center">
                            <span className="text-[10px]">{getFlagEmoji(team.country)}</span>
                        </span>
                    )}
                    {team.seed && (
                        <span className="px-1 py-0.5 rounded bg-[hsl(var(--surface-elevated))] text-[9px]">
                            #{team.seed}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
}
