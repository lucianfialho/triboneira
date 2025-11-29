export interface Bullet {
    type: 'who' | 'what' | 'when' | 'where' | 'why' | 'key_fact';
    text: string;
}

export interface NewsItem {
    id: number;
    externalId: string;
    title: string;
    imageUrl: string | null;
    publishedAt: Date | null;
    link: string;
    isTranslated: boolean;
    summaryBullets?: Bullet[];
}

export interface NewsDetail extends NewsItem {
    originalTitle: string;
    translatedTitle?: string;
    translatedContent?: string;
    originalContent?: string;
    content?: string; // Helper for the final content to display
}
