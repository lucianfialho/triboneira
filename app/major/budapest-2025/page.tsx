'use client';

import { EventPageTemplate, type Stream } from '@/components/templates/event-page-template';

export default function MajorPage() {
  const getMajorStreams = (isMobile: boolean): Stream[] => {
    // Major official streams - YouTube
    return [
      {
        id: 'official-stream-1',
        url: 'https://www.youtube.com/watch?v=AN195Rfh0hI',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream',
        isMuted: false,
        volume: 50,
        videoId: 'AN195Rfh0hI',
      },
      {
        id: 'official-stream-2',
        url: 'https://www.youtube.com/watch?v=LB-G45bOToo',
        platform: 'youtube',
        title: 'Major Budapest 2025 - Official Stream 2',
        isMuted: true,
        volume: 50,
        videoId: 'LB-G45bOToo',
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
