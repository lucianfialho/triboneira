'use client'

import { ExternalLink, Play, Eye } from 'lucide-react'

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
      return `${(count / 1000).toFixed(1)}k`
    }
    return `${count}`
  }

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Play className="w-6 h-6 text-purple-500" />
          <h2 className="text-2xl font-bold">Melhores Jogadas</h2>
        </div>
        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/50 to-transparent" />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {highlights.slice(0, 8).map((highlight, index) => (
          <a
            key={index}
            href={highlight.url}
            target="_blank"
            rel="noopener noreferrer"
            className="glass-card overflow-hidden hover:border-purple-500/50 transition-all group"
          >
            {/* Thumbnail */}
            <div className="relative aspect-video bg-gradient-to-br from-purple-900/20 to-pink-900/20">
              {highlight.thumbnail ? (
                <img
                  src={highlight.thumbnail}
                  alt={highlight.title || 'Highlight'}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Play className="w-12 h-12 text-white/30" />
                </div>
              )}

              {/* Play button overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all bg-black/50">
                <div className="w-14 h-14 bg-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
                  <Play className="w-6 h-6 text-white ml-0.5 fill-white" />
                </div>
              </div>

              {/* View count badge */}
              {highlight.view_count && (
                <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{formatViews(highlight.view_count)}</span>
                </div>
              )}

              {/* Platform icon */}
              <div className="absolute bottom-2 left-2">
                {highlight.platform === 'twitch' && (
                  <div className="bg-purple-600 p-1.5 rounded">
                    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div className="p-3">
              <h3 className="text-sm font-medium line-clamp-2 leading-tight">
                {highlight.title || 'Highlight'}
              </h3>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
