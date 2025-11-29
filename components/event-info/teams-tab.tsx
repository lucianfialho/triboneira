'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Team {
    id: number;
    externalId: string;
    name: string;
    rank: number | null;
    logoUrl: string | null;
    country: string | null;
    seed: number | null;
    placement: string | null;
}

interface TeamsTabProps {
    externalId: string;
    enabled: boolean;
}

export default function TeamsTab({ externalId, enabled }: TeamsTabProps) {
    const [teams, setTeams] = useState<Team[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!enabled || !externalId) {
            setLoading(false);
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
                setLoading(false);
            }
        };

        fetchTeams();
    }, [externalId, enabled]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                    <div key={i} className="glass-card p-4 animate-pulse">
                        <div className="w-16 h-16 bg-[hsl(var(--border))] rounded-lg mx-auto mb-3" />
                        <div className="h-4 bg-[hsl(var(--border))] rounded w-3/4 mx-auto" />
                    </div>
                ))}
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[hsl(var(--muted-foreground))]">No teams found for this event</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {teams.map((team) => (
                <div
                    key={team.id}
                    className="glass-card p-4 hover:bg-[hsl(var(--surface-elevated))] transition-all text-center group"
                >
                    {/* Team Logo */}
                    <div className="relative w-16 h-16 mx-auto mb-3 rounded-lg overflow-hidden bg-[hsl(var(--surface))]">
                        {team.logoUrl ? (
                            <Image
                                src={team.logoUrl}
                                alt={team.name}
                                fill
                                className="object-contain p-2"
                                unoptimized
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-[hsl(var(--muted-foreground))]">
                                {team.name.charAt(0)}
                            </div>
                        )}

                        {/* Rank Badge */}
                        {team.rank && team.rank <= 30 && (
                            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[hsl(var(--primary))] flex items-center justify-center text-xs font-bold text-white border-2 border-[hsl(var(--background))]">
                                #{team.rank}
                            </div>
                        )}
                    </div>

                    {/* Team Name */}
                    <h4 className="text-white font-semibold text-sm mb-1 truncate group-hover:text-[hsl(var(--primary))] transition-colors">
                        {team.name}
                    </h4>

                    {/* Team Info */}
                    <div className="flex items-center justify-center gap-2 text-xs text-[hsl(var(--muted-foreground))]">
                        {team.country && (
                            <span className="flex items-center gap-1">
                                <span className="text-base">{getFlagEmoji(team.country)}</span>
                                {team.country}
                            </span>
                        )}
                        {team.seed && (
                            <span className="px-2 py-0.5 rounded bg-[hsl(var(--surface-elevated))]">
                                Seed {team.seed}
                            </span>
                        )}
                    </div>

                    {/* Placement */}
                    {team.placement && (
                        <div className="mt-2 px-2 py-1 rounded bg-yellow-500/20 text-yellow-500 text-xs font-medium">
                            {team.placement}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

function getFlagEmoji(countryCode: string): string {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
}
