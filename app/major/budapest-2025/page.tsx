'use client';

import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';

export default function MajorPage() {
  const getMajorStreams = (isMobile: boolean): Stream[] => {
    // Major official streams - YouTube
    return [
      {
        id: 'official-stream-1',
        url: 'https://www.youtube.com/watch?v=nQcHGCNuVMk',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream',
        isMuted: false,
        videoId: 'nQcHGCNuVMk',
      },
      {
        id: 'official-stream-2',
        url: 'https://www.youtube.com/watch?v=qIkVpLktGms',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream 2',
        isMuted: true,
        videoId: 'qIkVpLktGms',
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
