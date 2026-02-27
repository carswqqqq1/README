'use client';
import { useState } from 'react';
import { RefreshCw, Trash2, ChevronDown, Tag } from 'lucide-react';
import clsx from 'clsx';

interface Brand {
  id: number;
  name: string;
  category: string;
  ad_count: number;
  last_scraped_at: string | null;
}

interface BrandSidebarProps {
  brands: Brand[];
  selectedBrandId: number | null;
  onSelectBrand: (id: number | null) => void;
  onScrape: (id: number) => void;
  onDelete: (id: number) => void;
  scrapingId: number | null;
}

export default function BrandSidebar({
  brands,
  selectedBrandId,
  onSelectBrand,
  onScrape,
  onDelete,
  scrapingId,
}: BrandSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Group by category
  const categories = brands.reduce<Record<string, Brand[]>>((acc, b) => {
    const cat = b.category || 'Other';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(b);
    return acc;
  }, {});

  const toggleCategory = (cat: string) =>
    setCollapsed(prev => ({ ...prev, [cat]: !prev[cat] }));

  return (
    <aside className="w-64 shrink-0 border-r border-gray-800 bg-gray-900 overflow-y-auto flex flex-col">
      {/* All brands shortcut */}
      <button
        onClick={() => onSelectBrand(null)}
        className={clsx(
          'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b border-gray-800 transition-colors',
          selectedBrandId === null
            ? 'bg-blue-600/20 text-blue-400'
            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
        )}
      >
        <Tag size={14} />
        All Brands
        <span className="ml-auto text-xs text-gray-600">{brands.reduce((s, b) => s + b.ad_count, 0)}</span>
      </button>

      {/* Category groups */}
      {Object.entries(categories).sort(([a], [b]) => a.localeCompare(b)).map(([cat, list]) => (
        <div key={cat}>
          <button
            onClick={() => toggleCategory(cat)}
            className="w-full flex items-center gap-1 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors"
          >
            <ChevronDown
              size={12}
              className={clsx('transition-transform', collapsed[cat] && '-rotate-90')}
            />
            {cat}
          </button>

          {!collapsed[cat] && list.map(brand => (
            <div
              key={brand.id}
              className={clsx(
                'group flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors',
                selectedBrandId === brand.id
                  ? 'bg-blue-600/20 text-blue-400 border-r-2 border-blue-500'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              )}
              onClick={() => onSelectBrand(brand.id)}
            >
              <div className="w-5 h-5 rounded bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                {brand.name[0]}
              </div>
              <span className="text-sm truncate flex-1">{brand.name}</span>
              <span className="text-xs text-gray-600 shrink-0">{brand.ad_count}</span>

              {/* Action buttons (visible on hover) */}
              <div className="hidden group-hover:flex items-center gap-1 ml-1">
                <button
                  title="Scrape ads"
                  onClick={e => { e.stopPropagation(); onScrape(brand.id); }}
                  className="p-0.5 text-gray-500 hover:text-blue-400 transition-colors"
                >
                  <RefreshCw size={11} className={clsx(scrapingId === brand.id && 'animate-spin')} />
                </button>
                <button
                  title="Remove brand"
                  onClick={e => { e.stopPropagation(); onDelete(brand.id); }}
                  className="p-0.5 text-gray-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ))}

      {brands.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6 text-center">
          <p className="text-xs text-gray-600">No brands yet. Add one or seed the database.</p>
        </div>
      )}
    </aside>
  );
}
