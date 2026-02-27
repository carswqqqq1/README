'use client';
import { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import BrandSidebar from '@/components/BrandSidebar';
import FilterBar, { type Filters } from '@/components/FilterBar';
import AdCard, { type Ad } from '@/components/AdCard';
import AdDetailModal from '@/components/AdDetailModal';
import AddBrandModal from '@/components/AddBrandModal';
import { Database, RefreshCw, Sparkles, ChevronDown } from 'lucide-react';

interface Brand {
  id: number;
  name: string;
  category: string;
  ad_count: number;
  last_scraped_at: string | null;
}

const PAGE_SIZE = 48;

export default function Home() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [ads, setAds] = useState<Ad[]>([]);
  const [selectedBrandId, setSelectedBrandId] = useState<number | null>(null);
  const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
  const [showAddBrand, setShowAddBrand] = useState(false);
  const [scrapingId, setScrapingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    search: '',
    media_type: '',
    bookmarked: false,
    tags: '',
  });

  const loadBrands = useCallback(async () => {
    const res = await fetch('/api/brands');
    const data = await res.json();
    setBrands(data);
  }, []);

  const loadAds = useCallback(async (reset = true) => {
    setLoading(true);
    const currentOffset = reset ? 0 : offset;
    const sp = new URLSearchParams();
    if (selectedBrandId) sp.set('brand_id', String(selectedBrandId));
    if (filters.media_type) sp.set('media_type', filters.media_type);
    if (filters.bookmarked) sp.set('bookmarked', 'true');
    if (filters.search) sp.set('search', filters.search);
    if (filters.tags) sp.set('tags', filters.tags);
    sp.set('limit', String(PAGE_SIZE + 1));
    sp.set('offset', String(currentOffset));

    const res = await fetch(`/api/ads?${sp}`);
    const data: Ad[] = await res.json();

    const hasMoreAds = data.length > PAGE_SIZE;
    const page = data.slice(0, PAGE_SIZE);

    if (reset) {
      setAds(page);
      setOffset(PAGE_SIZE);
    } else {
      setAds(prev => [...prev, ...page]);
      setOffset(o => o + PAGE_SIZE);
    }
    setHasMore(hasMoreAds);
    setLoading(false);
  }, [selectedBrandId, filters, offset]);

  // Load brands on mount
  useEffect(() => { loadBrands(); }, [loadBrands]);

  // Load ads when filters/brand change
  useEffect(() => {
    setOffset(0);
    loadAds(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBrandId, filters]);

  const handleScrape = async (brandId: number) => {
    setScrapingId(brandId);
    try {
      const res = await fetch(`/api/brands/${brandId}/scrape`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadBrands();
      await loadAds(true);
    } catch (e) {
      alert(`Scrape failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setScrapingId(null);
    }
  };

  const handleDelete = async (brandId: number) => {
    if (!confirm('Remove this brand and all its ads?')) return;
    await fetch(`/api/brands/${brandId}`, { method: 'DELETE' });
    if (selectedBrandId === brandId) setSelectedBrandId(null);
    await loadBrands();
    await loadAds(true);
  };

  const handleBookmark = async (ad: Ad) => {
    const res = await fetch(`/api/ads/${ad.id}/bookmark`, { method: 'POST' });
    const { bookmarked } = await res.json();
    setAds(prev =>
      prev.map(a => a.id === ad.id ? { ...a, is_bookmarked: bookmarked ? 1 : 0 } : a)
    );
    if (selectedAd?.id === ad.id) {
      setSelectedAd(prev => prev ? { ...prev, is_bookmarked: bookmarked ? 1 : 0 } : null);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const res = await fetch('/api/seed', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      await loadBrands();
      alert(`Seeded ${data.seeded} DTC brands! Now click the refresh icon next to any brand to scrape their ads.`);
    } catch (e) {
      alert(`Seed failed: ${e instanceof Error ? e.message : e}`);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Header onAddBrand={() => setShowAddBrand(true)} />

      <div className="flex flex-1 min-h-0">
        <BrandSidebar
          brands={brands}
          selectedBrandId={selectedBrandId}
          onSelectBrand={id => { setSelectedBrandId(id); }}
          onScrape={handleScrape}
          onDelete={handleDelete}
          scrapingId={scrapingId}
        />

        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <FilterBar
            filters={filters}
            onChange={f => setFilters(f)}
            totalAds={ads.length}
          />

          <div className="flex-1 overflow-y-auto p-4">
            {/* Empty state */}
            {!loading && ads.length === 0 && brands.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-6 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center">
                  <Database size={28} className="text-blue-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white mb-2">Welcome to Meta Ad Spy</h2>
                  <p className="text-sm text-gray-400 max-w-sm">
                    Start by seeding 50+ DTC brands, then scrape any brand to pull their top-performing ads sorted by impressions.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSeed}
                    disabled={seeding}
                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    {seeding ? <RefreshCw size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {seeding ? 'Seeding…' : 'Seed 50+ DTC Brands'}
                  </button>
                  <button
                    onClick={() => setShowAddBrand(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-medium rounded-xl transition-colors"
                  >
                    + Add Custom Brand
                  </button>
                </div>
              </div>
            )}

            {/* No ads but have brands */}
            {!loading && ads.length === 0 && brands.length > 0 && (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center">
                  <RefreshCw size={20} className="text-gray-500" />
                </div>
                <div>
                  <p className="text-sm text-gray-300 font-medium">No ads yet</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Click the <RefreshCw size={10} className="inline" /> icon next to a brand in the sidebar to scrape their top ads.
                  </p>
                </div>
              </div>
            )}

            {/* Ad grid */}
            {ads.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                  {ads.map(ad => (
                    <AdCard
                      key={ad.id}
                      ad={ad}
                      onClick={() => setSelectedAd(ad)}
                      onBookmark={() => handleBookmark(ad)}
                    />
                  ))}

                  {/* Skeleton cards while loading more */}
                  {loading && Array.from({ length: 6 }).map((_, i) => (
                    <div key={`sk-${i}`} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                      <div className="aspect-square skeleton" />
                      <div className="p-3 space-y-2">
                        <div className="h-3 skeleton rounded w-1/2" />
                        <div className="h-4 skeleton rounded w-full" />
                        <div className="h-3 skeleton rounded w-3/4" />
                      </div>
                    </div>
                  ))}
                </div>

                {hasMore && (
                  <div className="flex justify-center mt-6">
                    <button
                      onClick={() => loadAds(false)}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-sm text-gray-300 rounded-xl transition-colors disabled:opacity-50"
                    >
                      {loading ? <RefreshCw size={14} className="animate-spin" /> : <ChevronDown size={14} />}
                      Load more
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Initial loading */}
            {loading && ads.length === 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
                    <div className="aspect-square skeleton" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 skeleton rounded w-1/2" />
                      <div className="h-4 skeleton rounded w-full" />
                      <div className="h-3 skeleton rounded w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedAd && (
        <AdDetailModal
          ad={selectedAd}
          onClose={() => setSelectedAd(null)}
          onBookmark={() => handleBookmark(selectedAd)}
          onAnalysisComplete={analysis => {
            setAds(prev =>
              prev.map(a =>
                a.id === selectedAd.id
                  ? { ...a, ...analysis, ai_tags: analysis.tags, analyzed_at: new Date().toISOString() }
                  : a
              )
            );
          }}
        />
      )}

      {showAddBrand && (
        <AddBrandModal
          onClose={() => setShowAddBrand(false)}
          onAdded={loadBrands}
        />
      )}
    </div>
  );
}
