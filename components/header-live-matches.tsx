'use client';

import { useEventMatches } from '@/hooks/use-event-matches';
import Image from 'next/image';

interface HeaderLiveMatchesProps {
    externalId: string;
}

export function HeaderLiveMatches({ externalId }: HeaderLiveMatchesProps) {
    const { data: matchesData, loading } = useEventMatches(externalId);

    // Only show if there are live matches
    if (loading || matchesData.live.length === 0) {
        return null;
    }

    return (
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide animate-fade-in">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            </div>

            {/* Live matches */}
            {matchesData.live.map((match, index) => (
                <div
                    key={match.id}
                    className="flex items-center gap-3 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors flex-shrink-0 cursor-default"
                >
                    {/* Team 1 */}
                    <div className="flex items-center gap-2">
                        {match.team1?.logoUrl ? (
                            <Image
                                src={match.team1.logoUrl}
                                alt={match.team1.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                unoptimized
                            />
                        ) : (
                            <span className="text-sm font-bold text-white">{match.team1?.name?.substring(0, 3).toUpperCase() || 'TBD'}</span>
                        )}
                    </div>

                    {/* Score */}
                    <div className="flex items-center gap-2 px-1">
                        <span className={`text-sm font-bold ${match.scoreTeam1 !== null ? 'text-white' : 'text-white/50'}`}>
                            {match.scoreTeam1 ?? 0}
                        </span>
                        <span className="text-xs text-white/40">vs</span>
                        <span className={`text-sm font-bold ${match.scoreTeam2 !== null ? 'text-white' : 'text-white/50'}`}>
                            {match.scoreTeam2 ?? 0}
                        </span>
                    </div>

                    {/* Team 2 */}
                    <div className="flex items-center gap-2">
                        {match.team2?.logoUrl ? (
                            <Image
                                src={match.team2.logoUrl}
                                alt={match.team2.name}
                                width={24}
                                height={24}
                                className="w-6 h-6 object-contain"
                                unoptimized
                            />
                        ) : (
                            <span className="text-sm font-bold text-white">{match.team2?.name?.substring(0, 3).toUpperCase() || 'TBD'}</span>
                        )}
                    </div>

                    {/* Best of format */}
                    {match.format && (
                        <span className="ml-1 text-[10px] font-medium text-white/40 uppercase bg-white/5 px-1.5 py-0.5 rounded">
                            {match.format}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}
