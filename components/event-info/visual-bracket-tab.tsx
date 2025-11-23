'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Calendar } from 'lucide-react';

// Types based on backend API contract
interface BracketTeam {
    id: number;
    name: string;
    logoUrl: string | null;
    seed: number | null;
    isTBA: boolean;
}

interface BracketMatch {
    id: number;
    team1: BracketTeam;
    team2: BracketTeam;
    winner: BracketTeam | null;
    score: {
        team1: number | null;
        team2: number | null;
    };
    format: string | null;
    date: string | null;
    status: string;
    feeds: {
        team1From?: number;
        team2From?: number;
        feedsTo?: number;
    };
}

interface BracketRound {
    name: string;
    matches: BracketMatch[];
}

interface BracketResponse {
    currentStage: 'opening' | 'elimination' | 'playoffs';
    stageInfo: {
        format: string;
        description: string;
        totalRounds: number;
    };
    bracket: BracketRound[];
}

interface VisualBracketTabProps {
    externalId: string;
    enabled: boolean;
}

export default function VisualBracketTab({ externalId, enabled }: VisualBracketTabProps) {
    const [bracketData, setBracketData] = useState<BracketResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !externalId) {
            setLoading(false);
            return;
        }

        const fetchBracket = async () => {
            try {
                const res = await fetch(`/api/events/${externalId}/bracket`);
                if (!res.ok) {
                    throw new Error('Failed to load bracket');
                }
                const data = await res.json();
                setBracketData(data);
            } catch (err) {
                console.error('Error fetching bracket:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchBracket();

        // Poll every 30 seconds for updates
        const interval = setInterval(fetchBracket, 30000);
        return () => clearInterval(interval);
    }, [externalId, enabled]);

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="h-64 bg-[hsl(var(--border))] rounded animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-500 mb-2">Failed to load bracket</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{error}</p>
            </div>
        );
    }

    if (!bracketData) {
        return (
            <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
                <p className="text-[hsl(var(--muted-foreground))]">No bracket data available</p>
            </div>
        );
    }

    // If not in playoffs, show info message
    if (bracketData.currentStage !== 'playoffs') {
        return (
            <div className="space-y-6">
                <div className="glass-card p-6 border-l-4 border-blue-500">
                    <h3 className="text-lg font-bold text-white mb-2">🎮 {bracketData.stageInfo.format}</h3>
                    <p className="text-[hsl(var(--muted-foreground))]">
                        {bracketData.stageInfo.description}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Bracket Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-xl font-bold text-white mb-1">{bracketData.stageInfo.format}</h3>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {bracketData.stageInfo.description}
                    </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold">
                    PLAYOFFS
                </div>
            </div>

            {/* Rounds Grid */}
            <div className="overflow-x-auto pb-4">
                <div className="flex gap-12 min-w-max">
                    {bracketData.bracket.map((round, roundIdx) => (
                        <div key={roundIdx} className="flex flex-col gap-6 min-w-[320px]">
                            {/* Round Header */}
                            <div className="text-center">
                                <h4 className="text-lg font-bold text-white mb-2">{round.name}</h4>
                                <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
                            </div>

                            {/* Matches with visual spacing */}
                            <div
                                className="flex flex-col gap-6"
                                style={{ paddingTop: roundIdx > 0 ? `${roundIdx * 40}px` : '0' }}
                            >
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
                <TeamRow team={match.team1} score={match.score.team1} isWinner={team1Won} isLoser={team2Won} />
                <div className="flex items-center justify-center py-0.5">
                    <span className="text-xs text-[hsl(var(--subtle-foreground))]">vs</span>
                </div>
                <TeamRow team={match.team2} score={match.score.team2} isWinner={team2Won} isLoser={team1Won} />
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
    team: BracketTeam;
    score: number | null;
    isWinner: boolean;
    isLoser: boolean;
}

function TeamRow({ team, score, isWinner, isLoser }: TeamRowProps) {
    return (
        <div className={`flex items-center justify-between px-2 py-1.5 rounded ${isWinner ? 'bg-green-500/10' : isLoser ? 'bg-red-500/5' : 'bg-[hsl(var(--surface))]'
            }`}>
            <div className="flex items-center gap-2 flex-1 min-w-0">
                {team.isTBA ? (
                    <>
                        <div className="w-6 h-6 rounded bg-[hsl(var(--surface-elevated))] flex items-center justify-center flex-shrink-0">
                            <span className="text-xs text-[hsl(var(--muted-foreground))]">?</span>
                        </div>
                        <span className="text-sm font-semibold text-[hsl(var(--muted-foreground))] italic">
                            TBA
                        </span>
                    </>
                ) : (
                    <>
                        <div className="relative w-6 h-6 rounded overflow-hidden bg-[hsl(var(--surface-elevated))] flex-shrink-0">
                            {team.logoUrl ? (
                                <Image
                                    src={team.logoUrl}
                                    alt={team.name}
                                    fill
                                    className="object-contain p-0.5"
                                    unoptimized
                                />
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
                        {team.seed && (
                            <span className="text-xs px-1 py-0.5 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))]">
                                #{team.seed}
                            </span>
                        )}
                    </>
                )}
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
