'use client';
import { Search, Bookmark, Image, Video, LayoutGrid, SlidersHorizontal } from 'lucide-react';
import clsx from 'clsx';

export interface Filters {
  search: string;
  media_type: string;
  bookmarked: boolean;
  tags: string;
}

interface FilterBarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  totalAds: number;
}

const MEDIA_TYPES = [
  { value: '', label: 'All Media', icon: LayoutGrid },
  { value: 'image', label: 'Images', icon: Image },
  { value: 'video', label: 'Videos', icon: Video },
  { value: 'carousel', label: 'Carousel', icon: SlidersHorizontal },
];

export default function FilterBar({ filters, onChange, totalAds }: FilterBarProps) {
  const set = (partial: Partial<Filters>) => onChange({ ...filters, ...partial });

  return (
    <div className="flex flex-col sm:flex-row gap-3 px-4 py-3 border-b border-gray-800 bg-gray-900/50">
      {/* Search */}
      <div className="relative flex-1 min-w-0">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search headlines, copy…"
          value={filters.search}
          onChange={e => set({ search: e.target.value })}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-9 pr-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Media type pills */}
      <div className="flex gap-1">
        {MEDIA_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            onClick={() => set({ media_type: value })}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              filters.media_type === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            )}
          >
            <Icon size={12} />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>

      {/* AI tag search */}
      <div className="relative">
        <input
          type="text"
          placeholder="AI tag…"
          value={filters.tags}
          onChange={e => set({ tags: e.target.value })}
          className="w-28 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* Bookmarked toggle */}
      <button
        onClick={() => set({ bookmarked: !filters.bookmarked })}
        className={clsx(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap',
          filters.bookmarked
            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
        )}
      >
        <Bookmark size={12} />
        Saved
      </button>

      <span className="hidden sm:flex items-center text-xs text-gray-600 whitespace-nowrap">
        {totalAds} ads
      </span>
    </div>
  );
}
