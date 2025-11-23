'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Trophy, Calendar } from 'lucide-react';

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
}

interface BracketRound {
    name: string;
    matches: BracketMatch[];
}

interface BracketTabProps {
    externalId: string;
    enabled: boolean;
}

export default function BracketTab({ externalId, enabled }: BracketTabProps) {
    const [matches, setMatches] = useState<BracketMatch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!enabled || !externalId) {
            setLoading(false);
            return;
        }

        const fetchMatches = async () => {
            try {
                // Fetch ALL matches (live, scheduled, finished) to build the bracket
                const response = await fetch(`/api/events/${externalId}/matches`);
                const data = await response.json();

                // Combine all matches and sort by date
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

    const organizeIntoRounds = (matches: BracketMatch[]): BracketRound[] => {
        if (matches.length === 0) return [];

        // Sort by date (oldest first)
        const sorted = [...matches].sort((a, b) => {
            if (!a.date || !b.date) return 0;
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        });

        const rounds: BracketRound[] = [];
        const totalMatches = sorted.length;

        // Simple heuristic: group matches by proximity in time
        // Typical playoff structure: 8→4→2→1 or 4→2→1
        if (totalMatches >= 7) {
            // Likely has quarterfinals (4 matches)
            rounds.push({ name: 'Quarterfinals', matches: sorted.slice(0, 4) });
            rounds.push({ name: 'Semifinals', matches: sorted.slice(4, 6) });
            rounds.push({ name: 'Grand Final', matches: sorted.slice(6) });
        } else if (totalMatches >= 3) {
            // Semifinals + Final
            rounds.push({ name: 'Semifinals', matches: sorted.slice(0, 2) });
            rounds.push({ name: 'Grand Final', matches: sorted.slice(2) });
        } else if (totalMatches >= 1) {
            // Just finals
            rounds.push({ name: 'Playoffs', matches: sorted });
        }

        return rounds;
    };

    const rounds = organizeIntoRounds(matches);

    if (loading) {
        return (
            <div className="space-y-6">
                {[1, 2].map((i) => (
                    <div key={i} className="space-y-3">
                        <div className="h-6 bg-[hsl(var(--border))] rounded w-48 animate-pulse mb-3" />
                        {[1, 2].map((j) => (
                            <div key={j} className="glass-card p-4 animate-pulse">
                                <div className="h-16 bg-[hsl(var(--border))] rounded" />
                            </div>
                        ))}
                    </div>
                ))}
            </div>
        );
    }

    if (rounds.length === 0) {
        return (
            <div className="text-center py-12">
                <Trophy className="w-16 h-16 text-[hsl(var(--muted-foreground))] mx-auto mb-4 opacity-50" />
                <p className="text-[hsl(var(--muted-foreground))]">No matches scheduled yet</p>
                <p className="text-sm text-[hsl(var(--subtle-foreground))] mt-2">
                    The tournament bracket will appear here when matches are scheduled
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {rounds.map((round, roundIndex) => (
                <div key={round.name} className="space-y-3">
                    {/* Round Title */}
                    <div className="flex items-center gap-2">
                        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                        <h3 className="text-lg font-bold text-white px-4 flex items-center gap-2">
                            {roundIndex === rounds.length - 1 && <Trophy className="w-5 h-5 text-yellow-500" />}
                            {round.name}
                            <span className="text-xs text-[hsl(var(--muted-foreground))] font-normal">
                                ({round.matches.length} {round.matches.length === 1 ? 'match' : 'matches'})
                            </span>
                        </h3>
                        <div className="flex-1 h-px bg-[hsl(var(--border))]" />
                    </div>

                    {/* Matches */}
                    <div className="grid gap-3 md:grid-cols-2">
                        {round.matches.map((match) => (
                            <BracketMatchCard key={match.id} match={match} isFinal={roundIndex === rounds.length - 1} />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function BracketMatchCard({ match, isFinal }: { match: BracketMatch; isFinal: boolean }) {
    const team1Won = match.winner?.id === match.team1.id;
    const team2Won = match.winner?.id === match.team2.id;

    return (
        <div className="glass-card p-4 hover:bg-[hsl(var(--surface-elevated))] transition-all relative overflow-hidden">
            {/* Champion Badge */}
            {isFinal && match.winner && (
                <div className="absolute top-2 right-2">
                    <div className="px-2 py-1 rounded-full bg-yellow-500/20 text-yellow-500 text-xs font-bold flex items-center gap-1">
                        <Trophy className="w-3 h-3" />
                        CHAMPION
                    </div>
                </div>
            )}

            {/* Match Date */}
            {match.date && (
                <div className="flex items-center gap-1 text-xs text-[hsl(var(--subtle-foreground))] mb-3">
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
            <div className="space-y-2">
                {/* Team 1 */}
                <div
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${team1Won
                        ? 'bg-green-500/10 border-green-500/50'
                        : team2Won
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-[hsl(var(--surface))] border-[hsl(var(--border))]'
                        }`}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[hsl(var(--surface-elevated))] flex-shrink-0">
                            {match.team1.logoUrl ? (
                                <Image src={match.team1.logoUrl} alt={match.team1.name} fill className="object-contain p-1" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[hsl(var(--muted-foreground))]">
                                    {match.team1.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        {/* Name */}
                        <span className={`font-semibold truncate ${team1Won ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {match.team1.name}
                        </span>
                    </div>
                    {/* Score */}
                    {match.scoreTeam1 !== null && (
                        <span className={`text-2xl font-bold tabular-nums ${team1Won ? 'text-green-500' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {match.scoreTeam1}
                        </span>
                    )}
                </div>

                {/* VS Divider */}
                <div className="flex items-center justify-center">
                    <span className="text-xs text-[hsl(var(--muted-foreground))] px-2">vs</span>
                </div>

                {/* Team 2 */}
                <div
                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${team2Won
                        ? 'bg-green-500/10 border-green-500/50'
                        : team1Won
                            ? 'bg-red-500/5 border-red-500/20'
                            : 'bg-[hsl(var(--surface))] border-[hsl(var(--border))]'
                        }`}
                >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Logo */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-[hsl(var(--surface-elevated))] flex-shrink-0">
                            {match.team2.logoUrl ? (
                                <Image src={match.team2.logoUrl} alt={match.team2.name} fill className="object-contain p-1" unoptimized />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-lg font-bold text-[hsl(var(--muted-foreground))]">
                                    {match.team2.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        {/* Name */}
                        <span className={`font-semibold truncate ${team2Won ? 'text-white' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {match.team2.name}
                        </span>
                    </div>
                    {/* Score */}
                    {match.scoreTeam2 !== null && (
                        <span className={`text-2xl font-bold tabular-nums ${team2Won ? 'text-green-500' : 'text-[hsl(var(--muted-foreground))]'}`}>
                            {match.scoreTeam2}
                        </span>
                    )}
                </div>
            </div>

            {/* Match Info - Format & Status */}
            <div className="mt-3 flex items-center justify-center gap-2">
                {match.format && (
                    <span className="text-xs px-2 py-1 rounded bg-[hsl(var(--surface-elevated))] text-[hsl(var(--muted-foreground))] uppercase">
                        {match.format}
                    </span>
                )}
                {match.status === 'live' && (
                    <span className="text-xs px-2 py-1 rounded bg-red-500 text-white font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        LIVE
                    </span>
                )}
                {match.status === 'scheduled' && (
                    <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 font-medium border border-blue-500/30">
                        SCHEDULED
                    </span>
                )}
            </div>
        </div>
    );
}
