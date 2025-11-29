'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, AlertCircle } from 'lucide-react';

// Types based on backend API contract
interface SwissTeam {
    id: number;
    name: string;
    logoUrl: string | null;
    seed: number | null;
}

interface SwissMatch {
    id: number;
    team1: SwissTeam;
    team2: SwissTeam | null; // Can be null for TBD matches
    winner: SwissTeam | null;
    score: {
        team1: number | null;
        team2: number | null;
    };
    status: string;
    date: string | null;
    team1Record: {
        wins: number;
        losses: number;
    };
    team2Record: {
        wins: number;
        losses: number;
    };
}

interface SwissBucket {
    bucket: string;
    matches: SwissMatch[];
}

interface SwissRound {
    roundNumber: number;
    buckets: SwissBucket[];
}

interface QualifiedTeam extends SwissTeam {
    finalRecord: string;
    placement: number;
}

interface EliminatedTeam extends SwissTeam {
    finalRecord: string;
}

interface SwissResponse {
    event: {
        id: number;
        name: string;
    };
    rounds: SwissRound[];
    qualified: QualifiedTeam[];
    eliminated: EliminatedTeam[];
    currentRound: number;
    totalRounds: number;
}

interface SwissSystemViewProps {
    externalId: string;
    enabled: boolean;
}

export default function SwissSystemView({ externalId, enabled }: SwissSystemViewProps) {
    const [swissData, setSwissData] = useState<SwissResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!enabled || !externalId) {
            setLoading(false);
            return;
        }

        const fetchSwiss = async () => {
            try {
                const res = await fetch(`/api/events/${externalId}/swiss`);
                if (!res.ok) {
                    throw new Error('Failed to load Swiss data');
                }
                const data = await res.json();
                setSwissData(data);
            } catch (err) {
                console.error('Error fetching Swiss:', err);
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        };

        fetchSwiss();

        // Poll every 30 seconds
        const interval = setInterval(fetchSwiss, 30000);
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
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-500 mb-2">Failed to load Swiss System</p>
                <p className="text-sm text-[hsl(var(--muted-foreground))]">{error}</p>
            </div>
        );
    }

    if (!swissData) {
        return (
            <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
                <p className="text-[hsl(var(--muted-foreground))]">No Swiss data available</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Live Matches */}
            <LiveMatches rounds={swissData.rounds} />

            {/* Main Layout: Rounds Grid + Qualified/Eliminated Sections */}
            <div className="flex gap-6">
                {/* Rounds Grid - Horizontal Scroll */}
                <div className="flex-1 overflow-x-auto pb-4">
                    <div className="flex gap-3 min-w-max">
                        {swissData.rounds.map((round) => (
                            <RoundColumn key={round.roundNumber} round={round} />
                        ))}
                    </div>
                </div>

                {/* Right Side: Qualified & Eliminated */}
                <div className="flex-shrink-0 space-y-4 min-w-[280px]">
                    <QualifiedSection teams={swissData.qualified} />
                    <EliminatedSection teams={swissData.eliminated} />
                </div>
            </div>
        </div>
    );
}

// Round Column Component
function RoundColumn({ round }: { round: SwissRound }) {
    // Helper to determine bucket status (qualified, eliminated, or playing)
    const getBucketStyle = (bucketName: string) => {
        // Qualification buckets (green)
        if (['3:0', '3:1', '3:2'].includes(bucketName)) {
            return {
                bg: 'bg-green-500/10',
                border: 'border-green-500/30',
                text: 'text-green-400',
                label: '✓ Qualified'
            };
        }

        // Elimination buckets (red)
        if (['0:3', '1:3', '2:3'].includes(bucketName)) {
            return {
                bg: 'bg-red-500/10',
                border: 'border-red-500/30',
                text: 'text-red-400',
                label: '✗ Eliminated'
            };
        }

        // Playing buckets (default)
        return {
            bg: 'bg-[hsl(var(--surface-elevated))]',
            border: 'border-[hsl(var(--border))]',
            text: 'text-[hsl(var(--muted-foreground))]',
            label: null
        };
    };

    return (
        <div className="flex flex-col gap-2 min-w-[240px]">
            {/* Round Header */}
            <div className="text-center mb-2">
                <h4 className="text-sm font-bold text-white mb-1">Round {round.roundNumber}</h4>
                <div className="h-px bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
            </div>

            {round.buckets.map((bucket, bucketIndex) => {
                const style = getBucketStyle(bucket.bucket);

                return (
                    <div key={`${round.roundNumber}-${bucket.bucket}-${bucketIndex}`} className={`space-y-1.5 p-2 rounded border ${style.bg} ${style.border}`}>
                        <div className="text-center space-y-0.5">
                            <span className={`text-xs font-bold ${style.text} px-2 py-0.5 rounded bg-black/20`}>
                                {bucket.bucket}
                            </span>
                            {style.label && (
                                <div className={`text-[10px] font-semibold ${style.text} uppercase tracking-wide`}>
                                    {style.label}
                                </div>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            {bucket.matches.map((match, matchIndex) => (
                                <SwissMatchCard key={`${round.roundNumber}-${bucketIndex}-${match.id ?? matchIndex}`} match={match} />
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// Swiss Match Card
function SwissMatchCard({ match }: { match: SwissMatch }) {
    const team1Won = match.winner?.id === match.team1.id;
    const team2Won = match.team2 && match.winner?.id === match.team2.id;

    return (
        <div className={`p-1.5 rounded border bg-[hsl(var(--surface-elevated))]/80 ${match.status === 'live' ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-[hsl(var(--border))]/50'
            }`}>
            {/* Single row with both teams */}
            <div className="flex items-center justify-center gap-2">
                {/* Team 1 */}
                <div className={`flex items-center gap-2 p-1.5 rounded ${team1Won ? 'bg-green-500/15' : team2Won ? 'bg-red-500/10' : 'bg-[hsl(var(--surface))]/60'
                    }`}>
                    <div className="relative w-7 h-7 flex-shrink-0">
                        {match.team1.logoUrl ? (
                            <Image src={match.team1.logoUrl} alt={match.team1.name} fill className="object-contain" unoptimized />
                        ) : (
                            <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs font-bold">
                                {match.team1.name.charAt(0)}
                            </div>
                        )}
                    </div>
                    <span className={`text-base font-bold min-w-[20px] text-center ${team1Won ? 'text-green-500' : 'text-[hsl(var(--muted-foreground))]'
                        }`}>
                        {match.score.team1 ?? '-'}
                    </span>
                </div>

                {/* VS separator */}
                <span className="text-xs text-[hsl(var(--muted-foreground))] font-medium px-1">vs</span>

                {/* Team 2 */}
                <div className={`flex items-center gap-2 p-1.5 rounded ${team2Won ? 'bg-green-500/15' : team1Won ? 'bg-red-500/10' : 'bg-[hsl(var(--surface))]/60'
                    }`}>
                    <span className={`text-base font-bold min-w-[20px] text-center ${team2Won ? "text-green-500" : "text-[hsl(var(--muted-foreground))]"}`}>
                        {match.score.team2 ?? '-'}
                    </span>
                    <div className="relative w-7 h-7 flex-shrink-0">
                        {match.team2 ? (
                            match.team2.logoUrl ? (
                                <Image src={match.team2.logoUrl} alt={match.team2.name} fill className="object-contain" unoptimized />
                            ) : (
                                <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs font-bold">
                                    {match.team2.name.charAt(0)}
                                </div>
                            )
                        ) : (
                            <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-[10px] font-bold text-[hsl(var(--muted-foreground))]">
                                TBD
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div >
    );
}

// Progress Component
function Progress({ data }: { data: SwissResponse }) {
    const qualifiedPercent = (data.qualified.length / 8) * 100;
    const eliminatedPercent = (data.eliminated.length / 8) * 100;

    return (
        <div className="flex items-center gap-4">
            <div className="text-right">
                <div className="text-xs text-green-500 font-bold">✅ {data.qualified.length}/8</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Qualificados</div>
            </div>
            <div className="text-right">
                <div className="text-xs text-red-500 font-bold">❌ {data.eliminated.length}/8</div>
                <div className="text-xs text-[hsl(var(--muted-foreground))]">Eliminados</div>
            </div>
        </div>
    );
}

// Live Matches
function LiveMatches({ rounds }: { rounds: SwissRound[] }) {
    const liveMatches = rounds
        .flatMap(r => r.buckets)
        .flatMap(b => b.matches)
        .filter(m => m.status === 'live');

    if (liveMatches.length === 0) return null;

    return (
        <div className="space-y-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                Partidas ao Vivo
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {liveMatches.map(match => (
                    <SwissMatchCard key={match.id} match={match} />
                ))}
            </div>
        </div>
    );
}

// Qualified Section with sub-groups
function QualifiedSection({ teams }: { teams: QualifiedTeam[] }) {
    if (teams.length === 0) return null;

    // Group by final record
    const teams30 = teams.filter(t => t.finalRecord === '3-0').sort((a, b) => a.placement - b.placement);
    const teams31 = teams.filter(t => t.finalRecord === '3-1').sort((a, b) => a.placement - b.placement);
    const teams32 = teams.filter(t => t.finalRecord === '3-2').sort((a, b) => a.placement - b.placement);

    return (
        <div className="space-y-3">
            {/* 3-0 Teams */}
            {teams30.length > 0 && (
                <div className="glass-card p-3 border-l-4 border-green-500 bg-green-500/5">
                    <h4 className="text-xs font-bold text-green-500 mb-2 uppercase">
                        Advancing (3-0)
                    </h4>
                    <div className="space-y-1">
                        {teams30.map(team => (
                            <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                                <span className="text-xs font-bold text-yellow-500 w-5">#{team.placement}</span>
                                <div className="relative w-5 h-5 flex-shrink-0">
                                    {team.logoUrl ? (
                                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-white flex-1 truncate">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3-1 Teams */}
            {teams31.length > 0 && (
                <div className="glass-card p-3 border-l-4 border-green-400 bg-green-500/5">
                    <h4 className="text-xs font-bold text-green-400 mb-2 uppercase">
                        Advancing (3-1)
                    </h4>
                    <div className="space-y-1">
                        {teams31.map(team => (
                            <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                                <span className="text-xs font-bold text-yellow-500 w-5">#{team.placement}</span>
                                <div className="relative w-5 h-5 flex-shrink-0">
                                    {team.logoUrl ? (
                                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-white flex-1 truncate">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 3-2 Teams */}
            {teams32.length > 0 && (
                <div className="glass-card p-3 border-l-4 border-green-300 bg-green-500/5">
                    <h4 className="text-xs font-bold text-green-300 mb-2 uppercase">
                        Advancing (3-2)
                    </h4>
                    <div className="space-y-1">
                        {teams32.map(team => (
                            <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-green-500/10">
                                <span className="text-xs font-bold text-yellow-500 w-5">#{team.placement}</span>
                                <div className="relative w-5 h-5 flex-shrink-0">
                                    {team.logoUrl ? (
                                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-white flex-1 truncate">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// Eliminated Section with sub-groups
function EliminatedSection({ teams }: { teams: EliminatedTeam[] }) {
    if (teams.length === 0) return null;

    // Group by final record
    const teams03 = teams.filter(t => t.finalRecord === '0-3');
    const teams13 = teams.filter(t => t.finalRecord === '1-3');
    const teams23 = teams.filter(t => t.finalRecord === '2-3');

    return (
        <div className="space-y-3">
            {/* 0-3 Teams */}
            {teams03.length > 0 && (
                <div className="glass-card p-3 border-l-4 border-red-500 bg-red-500/5">
                    <h4 className="text-xs font-bold text-red-500 mb-2 uppercase">
                        Eliminated (0-3)
                    </h4>
                    <div className="space-y-1">
                        {teams03.map(team => (
                            <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                                <div className="relative w-5 h-5 flex-shrink-0">
                                    {team.logoUrl ? (
                                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-white flex-1 truncate">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 1-3 Teams */}
            {teams13.length > 0 && (
                <div className="glass-card p-3 border-l-4 border-red-400 bg-red-500/5">
                    <h4 className="text-xs font-bold text-red-400 mb-2 uppercase">
                        Eliminated (1-3)
                    </h4>
                    <div className="space-y-1">
                        {teams13.map(team => (
                            <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                                <div className="relative w-5 h-5 flex-shrink-0">
                                    {team.logoUrl ? (
                                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-white flex-1 truncate">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* 2-3 Teams */}
            {teams23.length > 0 && (
                <div className="glass-card p-3 border-l-4 border-red-300 bg-red-500/5">
                    <h4 className="text-xs font-bold text-red-300 mb-2 uppercase">
                        Eliminated (2-3)
                    </h4>
                    <div className="space-y-1">
                        {teams23.map(team => (
                            <div key={team.id} className="flex items-center gap-2 p-2 rounded bg-red-500/10">
                                <div className="relative w-5 h-5 flex-shrink-0">
                                    {team.logoUrl ? (
                                        <Image src={team.logoUrl} alt={team.name} fill className="object-contain" unoptimized />
                                    ) : (
                                        <div className="w-full h-full bg-[hsl(var(--surface-elevated))] rounded flex items-center justify-center text-xs">
                                            {team.name.charAt(0)}
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-white flex-1 truncate">{team.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
