import { useState, useEffect, useCallback } from 'react';

export interface EventInfo {
    id: number;
    externalId: string;
    name: string;
    dateStart: string | null;
    dateEnd: string | null;
    prizePool: string | null;
    location: string | null;
    status: string;
    championshipMode: boolean;
    totalTeams: number;
}

export function useEventInfo(externalId: string | null) {
    const [data, setData] = useState<EventInfo | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEventInfo = useCallback(async () => {
        if (!externalId) {
            setLoading(false);
            return;
        }

        try {
            const response = await fetch(`/api/events/${externalId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch event info');
            }

            const eventData = await response.json();
            setData(eventData);
            setError(null);
        } catch (err: any) {
            console.error('Error fetching event info:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [externalId]);

    useEffect(() => {
        if (!externalId) return;

        fetchEventInfo();

        // Poll every 60 seconds (event info doesn't change that often)
        const interval = setInterval(fetchEventInfo, 60000);

        return () => clearInterval(interval);
    }, [externalId, fetchEventInfo]);

    return { data, loading, error, refetch: fetchEventInfo };
}
