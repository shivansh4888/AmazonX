'use client';
import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingCart, Search, MapPin, Menu, X } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

export default function Navbar() {
  const { cart } = useCart();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const router = useRouter();

  const categories = ['All', 'Electronics', 'Books', 'Clothing', 'Home & Kitchen', 'Sports'];

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (category !== 'All') params.set('category', category);
    router.push(`/?${params.toString()}`);
  }, [query, category, router]);

  return (
    <header className="sticky top-0 z-50">
      {/* Main nav bar */}
      <div className="bg-amazon-dark text-white">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0 mr-2">
            <span className="text-amazon-orange font-bold text-2xl tracking-tight">ShopX</span>
            <span className="text-xs text-gray-400 block -mt-1">.in</span>
          </Link>

          {/* Deliver to */}
          <div className="hidden md:flex items-center gap-1 text-xs flex-shrink-0 cursor-pointer hover:outline hover:outline-white rounded px-1">
            <MapPin className="w-4 h-4 text-gray-300" />
            <div>
              <p className="text-gray-400">Deliver to</p>
              <p className="font-bold text-sm">India</p>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 flex rounded overflow-hidden">
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="bg-gray-200 text-gray-700 text-xs px-2 border-r border-gray-300 hidden sm:block focus:outline-none"
            >
              {categories.map(c => <option key={c}>{c}</option>)}
            </select>
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search products..."
              className="flex-1 px-4 py-2 text-gray-900 text-sm focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amazon-orange hover:bg-yellow-500 px-4 flex items-center justify-center transition-colors"
            >
              <Search className="w-5 h-5 text-gray-900" />
            </button>
          </form>

          {/* Cart */}
          <Link href="/cart" className="flex items-center gap-1 hover:outline hover:outline-white rounded px-2 py-1 flex-shrink-0 relative">
            <ShoppingCart className="w-7 h-7" />
            {cart.itemCount > 0 && (
              <span className="absolute -top-1 left-5 bg-amazon-orange text-black text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                {cart.itemCount > 99 ? '99+' : cart.itemCount}
              </span>
            )}
            <span className="text-sm font-bold hidden sm:block">Cart</span>
          </Link>
        </div>
      </div>

      {/* Category Nav Strip */}
      <div className="bg-amazon-navy text-white text-sm">
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto py-1 no-scrollbar">
          {categories.map(cat => (
            <Link
              key={cat}
              href={cat === 'All' ? '/' : `/?category=${encodeURIComponent(cat)}`}
              className="flex-shrink-0 px-3 py-1 hover:outline hover:outline-white rounded text-sm whitespace-nowrap"
            >
              {cat}
            </Link>
          ))}
          <Link href="/orders" className="flex-shrink-0 px-3 py-1 hover:outline hover:outline-white rounded text-sm whitespace-nowrap">
            My Orders
          </Link>
        </div>
      </div>
    </header>
  );
}
