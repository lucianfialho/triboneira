'use client';

import { useState, useEffect } from 'react';
import { X, Trophy, Calendar, MapPin, DollarSign, Gamepad2, Award, Users, Newspaper } from 'lucide-react';
import { DialogContent, Dialog, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEventInfo } from '@/hooks/use-event-info';
import { useEventMatches } from '@/hooks/use-event-matches';
import TeamsTab from '@/components/event-info/teams-tab';
import NewsTab from '@/components/event-info/news-tab';
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
                        <TabsTrigger
                            value="teams"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--primary))] rounded-none px-4 py-3 data-[state=active]:bg-transparent flex items-center gap-2"
                        >
                            <Users className="w-4 h-4" />
                            Teams
                        </TabsTrigger>
                        <TabsTrigger
                            value="news"
                            className="data-[state=active]:border-b-2 data-[state=active]:border-[hsl(var(--primary))] rounded-none px-4 py-3 data-[state=active]:bg-transparent flex items-center gap-2"
                        >
                            <Newspaper className="w-4 h-4" />
                            News
                        </TabsTrigger>
                    </TabsList>

                    <div className="flex-1 overflow-y-auto p-6">
                        <TabsContent value="matches" className="mt-0">
                            <MatchesTab matchesData={matchesData} loading={matchesLoading} />
                        </TabsContent>
                        <TabsContent value="bracket" className="mt-0">
                            <VisualBracketTab externalId={externalId} enabled={activeTab === 'bracket'} />
                        </TabsContent>
                        <TabsContent value="teams" className="mt-0">
                            <TeamsTab externalId={externalId} enabled={activeTab === 'teams'} />
                        </TabsContent>
                        <TabsContent value="news" className="mt-0">
                            <NewsTab externalId={externalId} enabled={activeTab === 'news'} />
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}

// Placeholder components - will be created separately
function MatchesTab({ matchesData, loading }: any) {
    if (loading) {
        return <div className="text-center text-[hsl(var(--muted-foreground))] py-12">Loading matches...</div>;
    }

    return (
        <div className="space-y-6">
            {matchesData.live.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        Live Matches ({matchesData.live.length})
                    </h3>
                    <div className="space-y-2">
                        {matchesData.live.map((match: any) => (
                            <MatchCard key={match.id} match={match} isLive />
                        ))}
                    </div>
                </div>
            )}

            {matchesData.scheduled.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Upcoming Matches</h3>
                    <div className="space-y-2">
                        {matchesData.scheduled.map((match: any) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                </div>
            )}

            {matchesData.finished.length > 0 && (
                <div>
                    <h3 className="text-lg font-semibold text-white mb-3">Recent Results</h3>
                    <div className="space-y-2">
                        {matchesData.finished.map((match: any) => (
                            <MatchCard key={match.id} match={match} />
                        ))}
                    </div>
                </div>
            )}

            {matchesData.live.length === 0 && matchesData.scheduled.length === 0 && matchesData.finished.length === 0 && (
                <div className="text-center text-[hsl(var(--muted-foreground))] py-12">
                    No matches available
                </div>
            )}
        </div>
    );
}

function MatchCard({ match, isLive = false }: { match: any; isLive?: boolean }) {
    return (
        <div className="glass-card p-4 hover:bg-[hsl(var(--surface-elevated))] transition-all">
            <div className="flex items-center justify-between">
                <div className="flex-1 grid grid-cols-[1fr_auto_1fr] items-center gap-4">
                    {/* Team 1 */}
                    <div className="flex items-center gap-3 justify-end">
                        <span className="text-sm font-semibold text-white truncate">{match.team1.name}</span>
                        {match.team1.logoUrl && (
                            <img src={match.team1.logoUrl} alt={match.team1.name} className="w-8 h-8 rounded" />
                        )}
                        {match.scoreTeam1 !== null && (
                            <span className="text-xl font-bold text-white tabular-nums w-8 text-center">
                                {match.scoreTeam1}
                            </span>
                        )}
                    </div>

                    {/* VS / Score */}
                    <div className="text-center">
                        <span className="text-xs text-[hsl(var(--muted-foreground))] px-3">vs</span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-3">
                        {match.scoreTeam2 !== null && (
                            <span className="text-xl font-bold text-white tabular-nums w-8 text-center">
                                {match.scoreTeam2}
                            </span>
                        )}
                        {match.team2.logoUrl && (
                            <img src={match.team2.logoUrl} alt={match.team2.name} className="w-8 h-8 rounded" />
                        )}
                        <span className="text-sm font-semibold text-white truncate">{match.team2.name}</span>
                    </div>
                </div>

                {/* Match Info */}
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
            </div>
        </div>
    );
}
