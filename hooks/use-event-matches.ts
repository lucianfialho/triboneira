import { useState, useEffect, useCallback } from 'react';

export interface Team {
    id: number;
    externalId: string;
    name: string;
    logoUrl: string | null;
    rank: number | null;
    country: string | null;
}

export interface Match {
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

export interface MatchesData {
    live: Match[];
    scheduled: Match[];
    finished: Match[];
}

export function useEventMatches(externalId: string | null, enabled: boolean = true) {
    const [data, setData] = useState<MatchesData>({ live: [], scheduled: [], finished: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMatches = useCallback(async () => {
        if (!externalId || !enabled) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/events/${externalId}/matches`);

            if (!response.ok) {
                throw new Error('Failed to fetch matches');
            }

            const matchesData = await response.json();
            setData(matchesData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching matches:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [externalId, enabled]);

    useEffect(() => {
        if (!externalId || !enabled) return;

        fetchMatches();

        // Poll every 30 seconds for live match updates
        const interval = setInterval(fetchMatches, 30000);

        return () => clearInterval(interval);
    }, [externalId, enabled, fetchMatches]);

    return { data, loading, error, refetch: fetchMatches };
}
