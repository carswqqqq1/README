'use client';
import { Bookmark, Eye, Sparkles, Play, Image as ImageIcon, LayoutGrid } from 'lucide-react';
import clsx from 'clsx';

export interface Ad {
  id: number;
  brand_id: number;
  brand_name: string;
  brand_category: string;
  brand_logo: string | null;
  title: string | null;
  body: string | null;
  cta_text: string | null;
  cta_link: string | null;
  media_type: 'image' | 'video' | 'carousel' | 'unknown';
  media_url: string | null;
  thumbnail_url: string | null;
  impressions_lower: number | null;
  impressions_upper: number | null;
  is_bookmarked: number;
  asset_type: string | null;
  visual_format: string | null;
  messaging_angle: string | null;
  hook_tactic: string | null;
  offer_type: string | null;
  ai_tags: string | null;
  analyzed_at: string | null;
}

interface AdCardProps {
  ad: Ad;
  onClick: () => void;
  onBookmark: () => void;
}

const MEDIA_ICON = {
  image: ImageIcon,
  video: Play,
  carousel: LayoutGrid,
  unknown: ImageIcon,
};

function formatImpressions(lower: number | null, upper: number | null): string {
  if (!lower) return '—';
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
  return upper ? `${fmt(lower)}–${fmt(upper)}` : `${fmt(lower)}+`;
}

export default function AdCard({ ad, onClick, onBookmark }: AdCardProps) {
  const Icon = MEDIA_ICON[ad.media_type] ?? ImageIcon;
  const hasAnalysis = !!ad.analyzed_at;

  return (
    <div
      className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden cursor-pointer hover:border-gray-600 hover:shadow-lg hover:shadow-black/40 transition-all"
      onClick={onClick}
    >
      {/* Media thumbnail */}
      <div className="relative aspect-square bg-gray-800 overflow-hidden">
        {ad.thumbnail_url || ad.media_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={ad.thumbnail_url ?? ad.media_url ?? ''}
            alt={ad.title ?? 'Ad creative'}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon size={32} className="text-gray-700" />
          </div>
        )}

        {/* Media type badge */}
        <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/60 backdrop-blur px-1.5 py-0.5 rounded text-xs text-gray-300">
          <Icon size={10} />
          <span className="capitalize">{ad.media_type}</span>
        </div>

        {/* AI analysis badge */}
        {hasAnalysis && (
          <div className="absolute top-2 right-8 bg-purple-600/80 backdrop-blur px-1.5 py-0.5 rounded text-xs text-white">
            <Sparkles size={9} className="inline mr-0.5" />
            AI
          </div>
        )}

        {/* Bookmark button */}
        <button
          onClick={e => { e.stopPropagation(); onBookmark(); }}
          className={clsx(
            'absolute top-2 right-2 p-1 rounded transition-colors',
            ad.is_bookmarked
              ? 'text-yellow-400 bg-yellow-400/20'
              : 'text-gray-400 bg-black/40 opacity-0 group-hover:opacity-100 hover:text-yellow-400'
          )}
        >
          <Bookmark size={12} fill={ad.is_bookmarked ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Brand */}
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
            {ad.brand_name[0]}
          </div>
          <span className="text-xs text-gray-400 truncate">{ad.brand_name}</span>
        </div>

        {/* Title */}
        {ad.title && (
          <p className="text-sm font-medium text-gray-100 line-clamp-2 mb-1">{ad.title}</p>
        )}

        {/* Body snippet */}
        {ad.body && (
          <p className="text-xs text-gray-500 line-clamp-2">{ad.body}</p>
        )}

        {/* Impressions & CTA */}
        <div className="flex items-center justify-between mt-2">
          {ad.impressions_lower ? (
            <div className="flex items-center gap-1 text-xs text-blue-400">
              <Eye size={10} />
              {formatImpressions(ad.impressions_lower, ad.impressions_upper)}
            </div>
          ) : <span />}

          {ad.cta_text && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-800 text-gray-400 rounded border border-gray-700">
              {ad.cta_text}
            </span>
          )}
        </div>

        {/* AI Tags */}
        {ad.ai_tags && (
          <div className="flex flex-wrap gap-1 mt-2">
            {ad.ai_tags.split(',').slice(0, 3).map(tag => (
              <span key={tag.trim()} className="text-xs px-1.5 py-0.5 bg-purple-900/40 text-purple-400 rounded">
                {tag.trim()}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
