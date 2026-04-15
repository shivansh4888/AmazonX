'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import ProductCard from '@/components/product/ProductCard';
import { SlidersHorizontal, X } from 'lucide-react';

function ProductSkeleton() {
  return (
    <div className="bg-white rounded shadow-sm p-4 animate-pulse">
      <div className="aspect-square bg-gray-200 rounded mb-4 shimmer" />
      <div className="h-4 bg-gray-200 rounded shimmer mb-2" />
      <div className="h-4 bg-gray-200 rounded shimmer w-3/4 mb-3" />
      <div className="h-6 bg-gray-200 rounded shimmer w-1/2 mb-2" />
      <div className="h-8 bg-gray-200 rounded shimmer mt-4" />
    </div>
  );
}
function FlashTimer() {
  const [time, setTime] = useState(3 * 60 * 60 + 47 * 60 + 22); // starts at a random time
  useEffect(() => {
    const t = setInterval(() => setTime(s => s > 0 ? s - 1 : 0), 1000);
    return () => clearInterval(t);
  }, []);
  const h = String(Math.floor(time / 3600)).padStart(2, '0');
  const m = String(Math.floor((time % 3600) / 60)).padStart(2, '0');
  const s = String(time % 60).padStart(2, '0');
  return <p className="font-mono font-black text-2xl">{h}:{m}:{s}</p>;
}

function PromoCard({ title, items, cta, onClick, accent = 'blue' }) {
  const accentStyles = {
    blue: 'from-blue-50 to-white',
    orange: 'from-orange-50 to-white',
    green: 'from-emerald-50 to-white',
    slate: 'from-slate-50 to-white',
  };

  return (
    <div className={`bg-gradient-to-b ${accentStyles[accent]} rounded shadow-sm p-5 border border-gray-200`}>
      <h3 className="text-[1.7rem] leading-tight font-bold text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {items.map((item) => (
          <button key={item.label} onClick={onClick} className="text-left group">
            <div className="aspect-[1.15/1] rounded overflow-hidden bg-gray-100 mb-2">
              <img
                src={item.image}
                alt={item.label}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <p className="text-xs text-gray-700 leading-snug">{item.label}</p>
          </button>
        ))}
      </div>
      <button onClick={onClick} className="mt-4 text-sm text-blue-600 hover:text-amazon-red hover:underline">
        {cta}
      </button>
    </div>
  );
}

function SignInPromo() {
  return (
    <div className="bg-white rounded shadow-sm p-5 border border-gray-200">
      <h3 className="text-[1.7rem] leading-tight font-bold text-gray-900 mb-6">
        Sign in for your best experience
      </h3>
      <button className="w-full bg-yellow-300 hover:bg-yellow-400 text-black font-medium py-3 px-4 rounded-full transition-colors">
        Sign in securely
      </button>
      <div className="mt-5 rounded-lg bg-gray-50 p-4 border border-gray-200">
        <p className="text-sm font-semibold text-gray-900">Fresh picks, faster checkout</p>
        <p className="text-xs text-gray-600 mt-1">Get personalized offers, saved cart access, and order tracking.</p>
      </div>
    </div>
  );
}

export default function HomePage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // Filter state synced with URL params
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sortBy = searchParams.get('sortBy') || 'price_desc';
  const page = parseInt(searchParams.get('page') || '1');

  const updateParam = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.delete('page'); // Reset page on filter change
    router.push(`/?${params.toString()}`);
  };

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await productsApi.getAll({ search, category, sortBy, page, limit: 12 });

      setProducts(data.products);
      setCategories(data.categories);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [search, category, sortBy, page]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const sortOptions = [
    { value: 'createdAt', label: 'Newest First' },
    { value: 'price_asc', label: 'Price: Low to High' },
    { value: 'price_desc', label: 'Price: High to Low' },
    { value: 'rating', label: 'Avg. Customer Review' },
    { value: 'reviewCount', label: 'Most Popular' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Hero Banner */}
      {!search && !category && (
  <>
    {/* Flash Sale Banner */}
    <div className="mb-4 bg-gradient-to-r from-red-600 via-orange-500 to-yellow-400 rounded-lg p-4 text-white flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-3">
        <span className="text-3xl animate-bounce">⚡</span>
        <div>
          <p className="font-black text-xl tracking-tight">FLASH SALE — Today Only!</p>
          <p className="text-yellow-100 text-sm">Extra 20% off on Electronics & Sports</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-xs text-yellow-200">Ends in</p>
        <FlashTimer />
      </div>
    </div>

    {/* Category Pills */}
    <div className="mb-6 bg-white rounded shadow-sm p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-3">Shop by Category</p>
      <div className="flex gap-2 flex-wrap">
        {[
          { name: 'Electronics', emoji: '📱' },
          { name: 'Books', emoji: '📚' },
          { name: 'Clothing', emoji: '👗' },
          { name: 'Home & Kitchen', emoji: '🏠' },
          { name: 'Sports', emoji: '🏋️' },
          { name: 'Beauty', emoji: '💄' },
          { name: 'Toys', emoji: '🧸' },
          { name: 'Automotive', emoji: '🚗' },
          { name: 'Grocery', emoji: '🛒' },
        ].map(cat => (
          <button
            key={cat.name}
            onClick={() => updateParam('category', cat.name)}
            className="flex items-center gap-1.5 bg-gray-50 hover:bg-amazon-orange hover:text-black border border-gray-200 hover:border-amazon-orange px-4 py-2 rounded-full text-sm font-medium transition-all"
          >
            <span>{cat.emoji}</span> {cat.name}
          </button>
        ))}
      </div>
    </div>

    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
      <PromoCard
        title="Up to 50% off | Baby care & toys"
        accent="orange"
        onClick={() => updateParam('category', 'Toys')}
        cta="See all offers"
        items={[
          { label: 'Gentle baby care picks', image: 'https://images.unsplash.com/photo-1515488764276-beab7607c1e6?auto=format&fit=crop&w=500&q=80' },
          { label: 'Ride-ons for little racers', image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?auto=format&fit=crop&w=500&q=80' },
          { label: 'Remote control fun', image: 'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=500&q=80' },
          { label: 'Travel-friendly kid seats', image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?auto=format&fit=crop&w=500&q=80' },
        ]}
      />

      <PromoCard
        title="Automotive essentials | Up to 60% off"
        accent="blue"
        onClick={() => updateParam('category', 'Automotive')}
        cta="See more"
        items={[
          { label: 'Cleaning accessories', image: 'https://images.unsplash.com/photo-1607861716497-e65ab29fc7ac?auto=format&fit=crop&w=500&q=80' },
          { label: 'Tyre & rim care', image: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=500&q=80' },
          { label: 'Helmets & riding gear', image: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=500&q=80' },
          { label: 'Vacuum cleaners', image: 'https://images.unsplash.com/photo-1517677208171-0bc6725a3e60?auto=format&fit=crop&w=500&q=80' },
        ]}
      />

      <PromoCard
        title="Starting ₹199 | Amazon-style home picks"
        accent="green"
        onClick={() => updateParam('category', 'Home & Kitchen')}
        cta="See more"
        items={[
          { label: 'Bedsheets & comfort', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80' },
          { label: 'Curtains that elevate rooms', image: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=500&q=80' },
          { label: 'Iron boards & utility', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=500&q=80' },
          { label: 'Home decor accents', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=500&q=80' },
        ]}
      />

      <SignInPromo />
    </div>
  </>
)}

      <div className="flex gap-6">
        {/* ─── Sidebar Filters ──────────────────────────────────────────── */}
        <aside className={`w-56 flex-shrink-0 ${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="bg-white rounded shadow-sm p-4 sticky top-28">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Filters</h2>
              <button onClick={() => setShowFilters(false)} className="md:hidden">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Categories */}
            <div className="mb-6">
              <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">Category</h3>
              <ul className="space-y-1">
                <li>
                  <button
                    onClick={() => updateParam('category', '')}
                    className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 ${!category ? 'text-amazon-orange font-semibold' : 'text-blue-600 hover:underline'}`}
                  >
                    All Categories
                  </button>
                </li>
                {categories.map(cat => (
                  <li key={cat.name}>
                    <button
                      onClick={() => updateParam('category', cat.name)}
                      className={`text-sm w-full text-left px-2 py-1 rounded hover:bg-gray-50 flex justify-between ${category === cat.name ? 'text-amazon-orange font-semibold' : 'text-blue-600 hover:underline'}`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-gray-400">({cat.count})</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Sort (mobile) */}
            <div className="md:hidden">
              <h3 className="font-semibold text-sm text-gray-700 uppercase tracking-wide mb-3">Sort By</h3>
              <select
                value={sortBy}
                onChange={e => updateParam('sortBy', e.target.value)}
                className="input-field text-sm"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>
        </aside>

        {/* ─── Main Product Grid ─────────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 bg-white rounded shadow-sm px-4 py-2">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center gap-1 text-sm text-gray-700"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
              <p className="text-sm text-gray-600">
                {loading ? 'Searching...' : (
                  <>
                    {search && <span>Results for "<strong>{search}</strong>" · </span>}
                    {category && <span>in <strong>{category}</strong> · </span>}
                    <strong>{pagination.total || 0}</strong> results
                  </>
                )}
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="hidden md:flex items-center gap-2">
              <label className="text-sm text-gray-600 whitespace-nowrap">Sort by:</label>
              <select
                value={sortBy}
                onChange={e => updateParam('sortBy', e.target.value)}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-amazon-orange"
              >
                {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {/* Active filters */}
          {(search || category) && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {search && (
                <span className="bg-amazon-orange/10 text-amazon-dark text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  Search: "{search}"
                  <button onClick={() => updateParam('search', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
              {category && (
                <span className="bg-amazon-orange/10 text-amazon-dark text-sm px-3 py-1 rounded-full flex items-center gap-1">
                  {category}
                  <button onClick={() => updateParam('category', '')}><X className="w-3 h-3" /></button>
                </span>
              )}
            </div>
          )}

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {Array(8).fill(0).map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white rounded shadow-sm p-12 text-center">
              <p className="text-2xl mb-2">🔍</p>
              <h3 className="text-lg font-semibold mb-2">No results found</h3>
              <p className="text-gray-500 text-sm mb-4">Try different keywords or remove filters</p>
              <button onClick={() => router.push('/')} className="btn-primary">
                Clear all filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {products.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
                    <button
                      key={p}
                      onClick={() => updateParam('page', p)}
                      className={`w-9 h-9 rounded text-sm font-medium border ${p === page ? 'bg-amazon-orange border-amazon-orange text-black' : 'bg-white border-gray-300 hover:border-amazon-orange'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
