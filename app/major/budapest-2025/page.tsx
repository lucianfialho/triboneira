'use client';

import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';

export default function MajorPage() {
  const getMajorStreams = (isMobile: boolean): Stream[] => {
    // Major official stream - YouTube
    return [
      {
        id: 'official-stream',
        url: 'https://www.youtube.com/watch?v=TQwIfQqwP_M',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream',
        isMuted: false,
        volume: 50,
        videoId: 'TQwIfQqwP_M',
      },
    ];
  };

  return (
    <EventPageTemplate
      eventId={16}
      initialStreams={getMajorStreams}
      eventLogo="/major-budapest-2025.png"
    />
  );
}
