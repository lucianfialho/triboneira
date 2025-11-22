'use client';

import { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

interface NewsItem {
    id: number;
    externalId: string;
    title: string;
    description: string | null;
    link: string;
    publishedAt: string | null;
    country: string | null;
}

interface NewsTabProps {
    externalId: string;
    enabled: boolean;
}

export default function NewsTab({ externalId, enabled }: NewsTabProps) {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!enabled || !externalId) {
            setLoading(false);
            return;
        }

        const fetchNews = async () => {
            try {
                const response = await fetch(`/api/events/${externalId}/news?limit=20`);
                const data = await response.json();
                setNews(data.news || []);
            } catch (error) {
                console.error('Error fetching news:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, [externalId, enabled]);

    const formatRelativeTime = (date: string | null) => {
        if (!date) return '';
        const now = new Date();
        const published = new Date(date);
        const diffInHours = Math.floor((now.getTime() - published.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Agora mesmo';
        if (diffInHours < 24) return `${diffInHours}h atrás`;
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) return '1 dia atrás';
        if (diffInDays < 7) return `${diffInDays} dias atrás`;
        return published.toLocaleDateString('pt-BR');
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="glass-card p-4 animate-pulse">
                        <div className="h-5 bg-[hsl(var(--border))] rounded w-3/4 mb-2" />
                        <div className="h-4 bg-[hsl(var(--border))] rounded w-full mb-2" />
                        <div className="h-3 bg-[hsl(var(--border))] rounded w-1/4" />
                    </div>
                ))}
            </div>
        );
    }

    if (news.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-[hsl(var(--muted-foreground))]">No news found for this event</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {news.map((item) => (
                <a
                    key={item.id}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass-card p-4 hover:bg-[hsl(var(--surface-elevated))] transition-all block group"
                >
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1 group-hover:text-[hsl(var(--primary))] transition-colors">
                                {item.title}
                            </h4>
                            {item.description && (
                                <p className="text-sm text-[hsl(var(--muted-foreground))] line-clamp-2 mb-2">
                                    {item.description}
                                </p>
                            )}
                            {item.publishedAt && (
                                <p className="text-xs text-[hsl(var(--subtle-foreground))]">
                                    {formatRelativeTime(item.publishedAt)}
                                </p>
                            )}
                        </div>
                        <ExternalLink className="w-4 h-4 text-[hsl(var(--muted-foreground))] group-hover:text-[hsl(var(--primary))] transition-colors flex-shrink-0" />
                    </div>
                </a>
            ))}
        </div>
    );
}
