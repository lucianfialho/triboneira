'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Calendar, Circle } from 'lucide-react';

interface Team {
    id: number;
    externalId: string;
    name: string;
    logoUrl: string | null;
    rank: number | null;
    country: string | null;
}

interface BracketMatch {
    id: number;
    externalId: string;
    date: string | null;
    format: string | null;
    status: string;
    scoreTeam1: number | null;
    scoreTeam2: number | null;
    team1: Team;
    team2: Team;
    winner: {
        id: number | null;
        name: string | null;
    };
    metadata?: {
        bracket?: 'upper' | 'lower';
        round?: string;
        roundNumber?: number;
    };
}

interface VisualBracketTabProps {
    externalId: string;
    enabled: boolean;
}

interface BracketSection {
    type: 'upper' | 'lower';
    rounds: BracketRound[];
}

interface BracketRound {
    name: string;
    roundNumber: number;
    matches: BracketMatch[];
}

export default function VisualBracketTab({ externalId, enabled }: VisualBracketTabProps) {
    const [matches, setMatches] = useState<BracketMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!enabled || !externalId) {
            setLoading(false);
            return;
        }

        const fetchMatches = async () => {
            try {
                const response = await fetch(`/api/events/${externalId}/matches`);
                const data = await response.json();

                const allMatches = [
                    ...(data.live || []),
                    ...(data.scheduled || []),
                    ...(data.finished || [])
                ];

                setMatches(allMatches);
            } catch (error) {
                console.error('Error fetching bracket matches:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [externalId, enabled]);

    // Organize matches into single elimination playoff bracket
    const organizeBracket = (matches: BracketMatch[]): BracketRound[] => {
        if (matches.length === 0) return [];

        // Sort by date
        const sorted = [...matches].sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        const rounds: BracketRound[] = [];
        const totalMatches = sorted.length;

        // CS:GO Major Playoffs format: 8 teams = 4 QF + 2 SF + 1 Final
        if (totalMatches >= 7) {
            // Full 8-team bracket
            rounds.push({
                name: 'Quarterfinals',
                roundNumber: 1,
                matches: sorted.slice(0, 4)
            });
            rounds.push({
                name: 'Semifinals',
                roundNumber: 2,
                matches: sorted.slice(4, 6)
            });
            rounds.push({
                name: 'Grand Final',
                roundNumber: 3,
                matches: sorted.slice(6, 7)
            });
        } else if (totalMatches >= 3) {
            // Semifinals + Final
            rounds.push({
                name: 'Semifinals',
                roundNumber: 1,
                matches: sorted.slice(0, 2)
            });
            rounds.push({
                name: 'Grand Final',
                roundNumber: 2,
                matches: sorted.slice(2, 3)
            });
        } else if (totalMatches === 1) {
            // Just final
            rounds.push({
                name: 'Grand Final',
                roundNumber: 1,
                matches: sorted
            });
        } else {
            // Generic playoff matches
            rounds.push({
                name: 'Playoffs',
                roundNumber: 1,
                matches: sorted
            });
        }

        return rounds;
    };

    // Detect if we're in Swiss System or Playoffs
    const detectTournamentStage = (matches: BracketMatch[]): 'swiss' | 'playoffs' => {
        // If we have playoff structure (4 QF + 2 SF + 1 F = 7 matches in specific order)
        // and they're all finished or in progress, we're in playoffs
        if (matches.length >= 7) {
            return 'playoffs';
        }

        // Otherwise, we're likely in Swiss System stages
        return 'swiss';
    };

    const tournamentStage = detectTournamentStage(matches);

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="h-64 bg-[hsl(var(--border))] rounded animate-pulse" />
                ))}
            </div>
        );
    }

    // If in Swiss System, show message and playoff template
    if (tournamentStage === 'swiss' || matches.length === 0) {
        return (
            <div className="space-y-8">
                {/* Info Banner */}
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-white mb-2">🎮 Tournament in Progress</h3>
                    <p className="text-[hsl(var(--muted-foreground))] mb-3">
                        The Major is currently in the <span className="text-white font-semibold">Swiss System Stages</span> (Opening Stage, Elimination Stage).
                    </p>
                    <p className="text-sm text-[hsl(var(--subtle-foreground))]">
                        The Playoff Bracket will be revealed when the top 8 teams qualify from the Swiss stages.
                        Check back after the stages are complete!
                    </p>
                </div>

                {/* Playoff Template Preview */}
                <div>
                    <h3 className="text-xl font-bold text-white mb-4">Playoff Structure Preview</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">
                        Single Elimination • Best of 3 • Top 8 Teams
                    </p>

                    <div className="flex gap-12 overflow-x-auto pb-4">
                        {/* Quarterfinals */}
                        <div className="flex flex-col gap-6 min-w-[300px]">
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-white mb-2">Quarterfinals</h4>
                                <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
                            </div>
                            <div className="flex flex-col gap-4">
                                {[1, 2, 3, 4].map(i => <TBAMatchCard key={i} matchNumber={i} />)}
                            </div>
                        </div>

                        {/* Semifinals */}
                        <div className="flex flex-col gap-6 min-w-[300px]" style={{ paddingTop: '40px' }}>
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-white mb-2">Semifinals</h4>
                                <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
                            </div>
                            <div className="flex flex-col gap-4">
                                {[1, 2].map(i => <TBAMatchCard key={i} matchNumber={i} />)}
                            </div>
                        </div>

                        {/* Grand Final */}
                        <div className="flex flex-col gap-6 min-w-[300px]" style={{ paddingTop: '80px' }}>
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-white mb-2">Grand Final</h4>
                                <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
                            </div>
                            <TBAMatchCard matchNumber={1} isFinal />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // If in Playoffs, show actual bracket
    const rounds = organizeBracket(matches);

    return (
        <div className="overflow-x-auto pb-4">
            {/* Playoff Bracket Header */}
            <div className="mb-6">
                <h3 className="text-xl font-bold text-white mb-1">Playoff Bracket</h3>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                    Single Elimination • Best of 3
                </p>
            </div>

            {/* Horizontal Bracket */}
            <div className="flex gap-12 min-w-max">
                {rounds.map((round, roundIdx) => (
                    <div key={roundIdx} className="flex flex-col gap-6 min-w-[300px]">
                        {/* Round Header */}
                        <div className="text-center">
                            <h4 className="text-lg font-bold text-white mb-2">
                                {round.name}
                            </h4>
                            <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
                        </div>

                        {/* Matches with spacing for visual balance */}
                        <div className="flex flex-col gap-6" style={{
                            paddingTop: roundIdx > 0 ? `${roundIdx * 40}px` : '0'
                        }}>
                            {round.matches.map((match) => (
                                <MatchCard
                                    key={match.id}
                                    match={match}
                                    isFinal={round.name === 'Grand Final'}
                                />
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// TBA Match Card Component
function TBAMatchCard({ matchNumber, isFinal = false }: { matchNumber: number; isFinal?: boolean }) {
    return (
        <div className="glass-card p-3 border-2 border-dashed border-[hsl(var(--border))] opacity-60">
            {isFinal && (
                <div className="flex items-center justify-center gap-1 mb-2">
                    <Trophy className="w-4 h-4 text-yellow-500" />
                    <span className="text-xs text-yellow-500 font-bold">CHAMPIONSHIP</span>
                </div>
            )}
            <div className="space-y-1">
                <div className="flex items-center justify-between px-2 py-2 rounded bg-[hsl(var(--surface))]">
                    <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">TBA</span>
                </div>
                <div className="flex items-center justify-center py-1">
                    <span className="text-xs text-[hsl(var(--subtle-foreground))]">vs</span>
                </div>
                <div className="flex items-center justify-between px-2 py-2 rounded bg-[hsl(var(--surface))]">
                    <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))]">TBA</span>
                </div>
            </div>
            <div className="mt-2 text-center">
                <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] uppercase">
                    BO3
                </span>
            </div>
        </div>
    );
}

interface MatchCardProps {
    match: BracketMatch;
    isFinal: boolean;
}

function MatchCard({ match, isFinal }: MatchCardProps) {
    const team1Won = match.winner?.id === match.team1.id;
    const team2Won = match.winner?.id === match.team2.id;

    return (
        <div className="glass-card p-3 border-2 border-[hsl(var(--border))] hover:bg-[hsl(var(--surface-elevated))] transition-all relative">
            {/* Champion Badge */}
            {isFinal && match.winner && (
                <div className="absolute -top-2 -right-2 z-10">
                    <div className="px-2 py-1 rounded-full bg-yellow-500 text-black text-xs font-bold flex items-center gap-1 shadow-lg">
                        <Trophy className="w-3 h-3" />
                        CHAMPION
                    </div>
                </div>
            )}

            {/* Match Date/Time */}
            {match.date && (
                <div className="flex items-center gap-1 text-xs text-[hsl(var(--subtle-foreground))] mb-2">
                    <Calendar className="w-3 h-3" />
                    {new Date(match.date).toLocaleDateString('pt-BR', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                    })}
                </div>
            )}

            {/* Teams */}
            <div className="space-y-1">
                <TeamRow team={match.team1} score={match.scoreTeam1} isWinner={team1Won} isLoser={team2Won} />
                <TeamRow team={match.team2} score={match.scoreTeam2} isWinner={team2Won} isLoser={team1Won} />
            </div>

            {/* Status Badges */}
            <div className="mt-2 flex items-center justify-center gap-1 flex-wrap">
                {match.format && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] uppercase">
                        {match.format}
                    </span>
                )}
                {match.status === 'live' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-red-500 text-white font-medium flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                        LIVE
                    </span>
                )}
                {match.status === 'scheduled' && (
                    <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                        UPCOMING
                    </span>
                )}
            </div>
        </div>
    );
}

interface TeamRowProps {
    team: Team;
    score: number | null;
    isWinner: boolean;
    isLoser: boolean;
}

function TeamRow({ team, score, isWinner, isLoser }: TeamRowProps) {
    return (
        <div className={`flex items-center justify-between px-2 py-1.5 rounded ${isWinner ? 'bg-green-500/10' : isLoser ? 'bg-red-500/5' : 'bg-[hsl(var(--surface))]'
            }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                <div className="relative w-6 h-6 rounded overflow-hidden bg-[hsl(var(--surface-elevated))] flex-shrink-0">
                    {team.logoUrl ? (
                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain p-0.5" unoptimized />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[hsl(var(--muted-foreground))]">
                            {team.name.charAt(0)}
                        </div>
                    )}
                </div>
                <span className={`text-sm font-semibold truncate ${isWinner ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'
                    }`}>
                    {team.name}
                </span>
            </div>
            {score !== null && (
                <span className={`text-lg font-bold tabular-nums ml-2 ${isWinner ? 'text-green-500' : 'text-[hsl(var(--muted-foreground))]'
                    }`}>
                    {score}
                </span>
            )}
        </div>
    );
}
