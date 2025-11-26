'use client';

import { useEventMatches } from '@/hooks/use-event-matches';
import { MatchCard } from '@/components/match-card';
import { Gamepad2 } from 'lucide-react';

interface LiveMatchesCarouselProps {
    externalId: string;
}

export function LiveMatchesCarousel({ externalId }: LiveMatchesCarouselProps) {
    const { data: matchesData, loading } = useEventMatches(externalId);

    // Only show if there are live matches
    if (loading || matchesData.live.length === 0) {
        return null;
    }

    return (
        <div className="w-full mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    Partidas ao Vivo
                </h3>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {matchesData.live.map((match) => (
                    <div key={match.id} className="min-w-[300px] max-w-[350px]">
                        <MatchCard match={match} isLive compact />
                    </div>
                ))}
            </div>
        </div>
    );
}
