'use client';
import { useState } from 'react';
import {
  X, Bookmark, Sparkles, Eye, ExternalLink, Play,
  Image as ImageIcon, LayoutGrid, Loader2, Tag
} from 'lucide-react';
import clsx from 'clsx';
import type { Ad } from './AdCard';

interface AdDetailModalProps {
  ad: Ad;
  onClose: () => void;
  onBookmark: () => void;
  onAnalysisComplete: (analysis: Record<string, string>) => void;
}

export default function AdDetailModal({ ad, onClose, onBookmark, onAnalysisComplete }: AdDetailModalProps) {
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [localAd, setLocalAd] = useState(ad);

  const analyze = async () => {
    setAnalyzing(true);
    setError(null);
    try {
      const res = await fetch(`/api/ads/${ad.id}/analyze`, { method: 'POST' });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? 'Analysis failed');
      }
      const data = await res.json();
      setLocalAd(prev => ({ ...prev, ...data, ai_tags: data.tags, analyzed_at: new Date().toISOString() }));
      onAnalysisComplete(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error');
    } finally {
      setAnalyzing(false);
    }
  };

  const MediaIcon = localAd.media_type === 'video' ? Play :
    localAd.media_type === 'carousel' ? LayoutGrid : ImageIcon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300">
              {localAd.brand_name[0]}
            </div>
            <span className="font-medium text-white text-sm">{localAd.brand_name}</span>
            <span className="text-xs text-gray-500">{localAd.brand_category}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onBookmark}
              className={clsx(
                'p-1.5 rounded-lg transition-colors',
                localAd.is_bookmarked
                  ? 'text-yellow-400 bg-yellow-400/10'
                  : 'text-gray-500 hover:text-yellow-400 hover:bg-gray-800'
              )}
            >
              <Bookmark size={16} fill={localAd.is_bookmarked ? 'currentColor' : 'none'} />
            </button>
            <button onClick={onClose} className="p-1.5 text-gray-500 hover:text-white rounded-lg hover:bg-gray-800 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row flex-1 min-h-0">
          {/* Left: Media */}
          <div className="md:w-72 shrink-0 bg-gray-950 flex items-center justify-center min-h-48">
            {localAd.media_url ? (
              localAd.media_type === 'video' ? (
                <video
                  src={localAd.media_url}
                  poster={localAd.thumbnail_url ?? undefined}
                  controls
                  className="w-full h-full object-contain max-h-80"
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={localAd.thumbnail_url ?? localAd.media_url}
                  alt={localAd.title ?? 'Ad'}
                  className="w-full h-full object-contain max-h-80"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              )
            ) : (
              <MediaIcon size={48} className="text-gray-700" />
            )}
          </div>

          {/* Right: Details */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Impressions */}
            {localAd.impressions_lower && (
              <div className="flex items-center gap-1.5 text-sm text-blue-400 font-medium">
                <Eye size={14} />
                {formatRange(localAd.impressions_lower, localAd.impressions_upper)} impressions
              </div>
            )}

            {/* Ad Copy */}
            <div className="space-y-2">
              {localAd.title && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Headline</label>
                  <p className="mt-1 text-sm text-gray-100 font-medium">{localAd.title}</p>
                </div>
              )}
              {localAd.body && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Ad Copy</label>
                  <p className="mt-1 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{localAd.body}</p>
                </div>
              )}
              {localAd.cta_text && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">CTA</label>
                  <span className="mt-1 inline-block px-2.5 py-1 bg-blue-600 text-white text-xs rounded font-medium">
                    {localAd.cta_text}
                  </span>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            <div className="border-t border-gray-800 pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-purple-400" />
                  AI Analysis
                </h3>
                {!localAd.analyzed_at && (
                  <button
                    onClick={analyze}
                    disabled={analyzing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {analyzing ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                    {analyzing ? 'Analyzing…' : 'Analyze with Gemini'}
                  </button>
                )}
              </div>

              {error && (
                <p className="text-xs text-red-400 bg-red-900/20 border border-red-800 rounded-lg px-3 py-2 mb-3">
                  {error}
                </p>
              )}

              {localAd.analyzed_at ? (
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Asset Type', value: localAd.asset_type },
                    { label: 'Visual Format', value: localAd.visual_format },
                    { label: 'Messaging Angle', value: localAd.messaging_angle },
                    { label: 'Hook Tactic', value: localAd.hook_tactic },
                    { label: 'Offer Type', value: localAd.offer_type },
                  ].map(({ label, value }) => value && (
                    <div key={label} className="bg-gray-800 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500 mb-0.5">{label}</p>
                      <p className="text-sm text-gray-100 font-medium">{value}</p>
                    </div>
                  ))}

                  {localAd.ai_tags && (
                    <div className="col-span-2 bg-gray-800 rounded-lg p-2.5">
                      <p className="text-xs text-gray-500 mb-1.5 flex items-center gap-1"><Tag size={10} />Tags</p>
                      <div className="flex flex-wrap gap-1">
                        {localAd.ai_tags.split(',').map(t => (
                          <span key={t.trim()} className="text-xs px-1.5 py-0.5 bg-purple-900/50 text-purple-400 rounded border border-purple-800/50">
                            {t.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                !analyzing && (
                  <p className="text-xs text-gray-600 italic">
                    Click "Analyze with Gemini" to get AI-powered insights on this ad.
                  </p>
                )
              )}
            </div>

            {/* External link */}
            {localAd.cta_link && (
              <a
                href={localAd.cta_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <ExternalLink size={11} />
                View landing page
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatRange(lower: number, upper: number | null): string {
  const fmt = (n: number) =>
    n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K` : `${n}`;
  return upper ? `${fmt(lower)}–${fmt(upper)}` : `${fmt(lower)}+`;
}
