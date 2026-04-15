'use client';
import { useState, useEffect } from 'react';
import { productsApi } from '@/lib/api';
import { useCart } from '@/lib/cartContext';
import Link from 'next/link';
import { ShoppingCart, Star } from 'lucide-react';

// Rule-based recommendation engine:
// 1. Same category first
// 2. Similar price range (±40%)
// 3. Shuffle for variety, cap at 4
function selectRecommendations(allProducts, currentProduct) {
  const sameCategory = allProducts.filter(p =>
    p.id !== currentProduct.id &&
    p.category === currentProduct.category &&
    p.stock > 0
  );
  const priceLow = currentProduct.price * 0.6;
  const priceHigh = currentProduct.price * 1.4;
  const similarPrice = sameCategory.filter(p => p.price >= priceLow && p.price <= priceHigh);
  const pool = similarPrice.length >= 2 ? similarPrice : sameCategory;
  return pool.sort(() => Math.random() - 0.5).slice(0, 4);
}

export default function AlsoBought({ product }) {
  const [recs, setRecs] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    productsApi.getAll({ category: product.category, limit: 20 })
      .then(({ data }) => setRecs(selectRecommendations(data.products, product)))
      .catch(() => {});
  }, [product.id, product.category]);

  if (!recs.length) return null;

  return (
    <div className="bg-white rounded shadow-sm p-6 mt-4">
      <h2 className="section-title">Customers Also Bought</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {recs.map(rec => {
          const originalPrice = Math.round(rec.price * 1.2);
          const discount = Math.round((1 - rec.price / originalPrice) * 100);
          return (
            <div key={rec.id} className="text-center group">
              <Link href={`/products/${rec.id}`} className="block">
                <div className="bg-gray-50 rounded p-3 mb-2 aspect-square flex items-center justify-center overflow-hidden">
                  <img
                    src={rec.images?.[0]}
                    alt={rec.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={e => { e.target.src = 'https://via.placeholder.com/200'; }}
                  />
                </div>
                <p className="text-xs text-gray-800 line-clamp-2 mb-1 font-medium hover:text-blue-600">{rec.name}</p>
                <div className="flex justify-center items-center gap-1 mb-1">
                  {[1,2,3,4,5].map(i => (
                    <Star key={i} className={`w-3 h-3 ${i <= Math.round(rec.rating) ? 'fill-amazon-orange text-amazon-orange' : 'text-gray-200'}`} />
                  ))}
                </div>
                <p className="text-sm font-bold">₹{rec.price.toLocaleString('en-IN')}</p>
                <p className="text-xs text-amazon-red">{discount}% off</p>
              </Link>
              <button
                onClick={() => addToCart(rec.id)}
                className="mt-2 w-full text-xs bg-amazon-orange hover:bg-yellow-500 text-black font-medium py-1.5 rounded-sm transition-colors flex items-center justify-center gap-1"
              >
                <ShoppingCart className="w-3 h-3" /> Add to Cart
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}