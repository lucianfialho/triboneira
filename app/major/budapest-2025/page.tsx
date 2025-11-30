'use client';

import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';

export default function MajorPage() {
  const getMajorStreams = (isMobile: boolean): Stream[] => {
    // Major official streams - YouTube
    return [
      {
        id: 'official-stream-1',
        url: 'https://www.youtube.com/watch?v=qHOMDDpVpgc',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream',
        isMuted: false,
        videoId: 'qHOMDDpVpgc',
      },
      {
        id: 'official-stream-2',
        url: 'https://www.youtube.com/watch?v=bqzmCh08wLU',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream 2',
        isMuted: true,
        videoId: 'bqzmCh08wLU',
      },
    ];
  };

  return (
    <EventPageTemplate
      eventId={15}
      initialStreams={getMajorStreams}
      eventLogo="/major-budapest-2025.png"
    />
  );
}
