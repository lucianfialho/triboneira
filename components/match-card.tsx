import React from 'react';

export function MatchCard({ match, isLive = false, compact = false }: { match: any; isLive?: boolean; compact?: boolean }) {
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
