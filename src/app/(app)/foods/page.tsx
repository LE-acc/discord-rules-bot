'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@/store';
import { useT } from '@/lib/i18n';
import { Hydrated } from '@/components/ui/Hydrated';
import { FOOD_DB, RESTAURANTS, searchFoods, getFoodById } from '@/lib/food-db';
import { FoodLogSheet } from '@/components/foods/FoodLogSheet';
import { BarcodeScanner } from '@/components/BarcodeScanner';
import { IconBarcode, IconChevron } from '@/components/ui/Icons';
import type { FoodDbEntry, FoodItem } from '@/types';

type Tab = 'all' | 'favorites' | 'recent' | 'restaurants';

function FoodRow({ food, onClick, fav, onFav }: { food: FoodDbEntry; onClick: () => void; fav: boolean; onFav: () => void }) {
  const { locale } = useT();
  return (
    <div className="flex items-center gap-3 border-b border-[var(--border)] py-3 last:border-0">
      <button onClick={onFav} className="text-lg" aria-label="favorite">
        {fav ? '⭐' : '☆'}
      </button>
      <button onClick={onClick} className="flex flex-1 items-center justify-between gap-3 text-start">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--bg-elev)] text-2xl">{food.emoji}</span>
          <div>
            <div className="text-sm font-semibold">{locale === 'ar' ? food.nameAr : food.name}</div>
            <div className="muted text-xs">
              {food.brand ? `${food.brand} · ` : ''}{food.macros.calories} kcal / {food.servingLabel ?? `${food.serving}g`}
            </div>
          </div>
        </div>
        <IconChevron width={16} height={16} className="muted rotate-180" />
      </button>
    </div>
  );
}

function FoodsInner() {
  const { t, locale } = useT();
  const favorites = useStore((s) => s.favorites);
  const recent = useStore((s) => s.recent);
  const toggleFavorite = useStore((s) => s.toggleFavorite);

  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<FoodDbEntry | null>(null);
  const [scanItem, setScanItem] = useState<(FoodItem & { serving: number }) | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [restaurant, setRestaurant] = useState<string | null>(null);

  const list = useMemo(() => {
    if (query.trim()) return searchFoods(query, 40);
    if (tab === 'favorites') return favorites.map(getFoodById).filter(Boolean) as FoodDbEntry[];
    if (tab === 'recent') return recent.map(getFoodById).filter(Boolean) as FoodDbEntry[];
    if (tab === 'restaurants' && restaurant) {
      return FOOD_DB.filter((f) => f.category === 'restaurant' && f.brand?.toLowerCase().includes(restaurant));
    }
    return FOOD_DB;
  }, [query, tab, favorites, recent, restaurant]);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: t('foods.all') },
    { key: 'favorites', label: t('foods.favorites') },
    { key: 'recent', label: t('foods.recent') },
    { key: 'restaurants', label: t('foods.restaurants') },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <button onClick={() => setScanOpen(true)} className="btn-primary text-sm">
          <IconBarcode width={18} height={18} /> {t('foods.scan')}
        </button>
        <h1 className="text-2xl font-extrabold">{t('foods.title')}</h1>
      </div>

      {/* Search */}
      <input
        className="input"
        placeholder={t('common.search')}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {/* Tabs */}
      {!query && (
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          {tabs.map((tb) => (
            <button
              key={tb.key}
              onClick={() => {
                setTab(tb.key);
                setRestaurant(null);
              }}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-medium transition ${
                tab === tb.key ? 'bg-brand-500 text-white' : 'bg-[var(--bg-elev)]'
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>
      )}

      {/* Restaurants grid */}
      {tab === 'restaurants' && !restaurant && !query && (
        <div className="grid grid-cols-3 gap-3">
          {RESTAURANTS.map((r) => (
            <motion.button
              key={r.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRestaurant(r.name.toLowerCase().replace(/[^a-z]/g, '').slice(0, 4))}
              className="card flex flex-col items-center gap-1 p-4"
            >
              <span className="text-3xl">{r.emoji}</span>
              <span className="text-center text-[11px] font-medium">{locale === 'ar' ? r.nameAr : r.name}</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Food list */}
      {(tab !== 'restaurants' || restaurant || query) && (
        <div className="card px-4 py-1">
          {list.length === 0 ? (
            <p className="muted py-8 text-center text-sm">
              {locale === 'ar' ? 'لا توجد نتائج' : 'No results'}
            </p>
          ) : (
            list.map((food) => (
              <FoodRow
                key={food.id}
                food={food}
                fav={favorites.includes(food.id)}
                onFav={() => toggleFavorite(food.id)}
                onClick={() => setSelected(food)}
              />
            ))
          )}
        </div>
      )}

      <FoodLogSheet entry={selected ?? scanItem} onClose={() => { setSelected(null); setScanItem(null); }} />
      <BarcodeScanner
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onFound={(item) => setScanItem({ ...item, serving: 100 })}
      />
    </div>
  );
}

export default function FoodsPage() {
  return (
    <Hydrated>
      <FoodsInner />
    </Hydrated>
  );
}
