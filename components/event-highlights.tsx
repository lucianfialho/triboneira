'use client'

import Image from 'next/image'
import { ExternalLink, Play } from 'lucide-react'

interface Highlight {
  title: string
  url: string
  embed_url?: string
  thumbnail: string
  video_id?: string
  duration?: string
  platform: 'twitch' | 'youtube' | 'other'
  view_count?: number
}

interface EventHighlightsProps {
  highlights: Highlight[]
}

export function EventHighlights({ highlights }: EventHighlightsProps) {
  if (!highlights || highlights.length === 0) {
    return null
  }

  const formatViews = (count?: number) => {
    if (!count) return null
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k views`
    }
    return `${count} views`
  }

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        🎬 Highlights
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((highlight, index) => (
          <a
            key={index}
            href={highlight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card overflow-hidden hover:scale-105 transition-transform group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-black/20">
              {highlight.thumbnail ? (
                <Image
                  src={highlight.thumbnail}
                  alt={highlight.title || 'Highlight'}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                  <Play className="w-16 h-16 text-white/50" />
                </div>
              )}

              {/* Duration badge */}
              {highlight.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {highlight.duration}
                </div>
              )}

              {/* Platform badge */}
              <div className="absolute top-2 left-2 bg-black/80 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                {highlight.platform === 'twitch' && (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                    </svg>
                    <span>Twitch</span>
                  </>
                )}
                {highlight.platform === 'youtube' && (
                  <>
                    <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                    <span>YouTube</span>
                  </>
                )}
              </div>

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
                <div className="w-16 h-16 bg-red-600/90 rounded-full flex items-center justify-center">
                  <Play className="w-8 h-8 text-white ml-1 fill-white" />
                </div>
              </div>

              {/* External link icon */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="bg-black/80 text-white p-1.5 rounded">
                  <ExternalLink className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Title and info */}
            <div className="p-4">
              <h3 className="font-semibold line-clamp-2 mb-2 min-h-[3rem]">
                {highlight.title || 'Highlight'}
              </h3>
              {highlight.view_count && (
                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                  {formatViews(highlight.view_count)}
                </p>
              )}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
