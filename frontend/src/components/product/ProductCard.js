'use client';
import Link from 'next/link';
import Image from 'next/image';
import { Star, ShoppingCart, Zap } from 'lucide-react';
import { useCart } from '@/lib/cartContext';

function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <Star
            key={i}
            className={`w-3 h-3 ${i <= Math.round(rating) ? 'fill-amazon-orange text-amazon-orange' : 'text-gray-300'}`}
          />
        ))}
      </div>
      <span className="text-xs text-blue-600 hover:text-amazon-red cursor-pointer">
        {rating.toFixed(1)}
      </span>
    </div>
  );
}

export default function ProductCard({ product }) {
  const { addToCart, loading } = useCart();

  const stockBadge = () => {
    if (product.stock === 0) return <span className="text-xs text-amazon-red font-medium">Out of Stock</span>;
    if (product.stock <= 5) return <span className="text-xs text-amazon-red font-medium">Only {product.stock} left in stock!</span>;
    if (product.stock <= 20) return <span className="text-xs text-orange-600 font-medium">Only {product.stock} left</span>;
    return <span className="text-xs text-amazon-green font-medium">In Stock</span>;
  };

  const discountedPrice = product.price;
  const originalPrice = Math.round(product.price * 1.2); // Fake MRP for UI

  return (
    <div className="card flex flex-col h-full group">
      {/* Image */}
      {product.stock > 0 && product.stock <= 10 && (
  <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded flex items-center gap-0.5 z-10 animate-pulse">
    ⚡ DEAL
  </div>
)}
      <Link href={`/products/${product.id}`} className="block overflow-hidden bg-white p-4 rounded-t">
        <div className="relative w-full aspect-square">
          <img
            src={product.images?.[0] || 'https://via.placeholder.com/400x400?text=Product'}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
            onError={e => { e.target.src = 'https://via.placeholder.com/400x400?text=No+Image'; }}
          />
        </div>
      </Link>

      {/* Content */}
      <div className="p-3 flex flex-col flex-1">
        {/* Category badge */}
        <span className="text-xs text-gray-500 mb-1">{product.category}</span>

        {/* Title */}
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 mb-1 leading-snug">
            {product.name}
          </h3>
        </Link>

        {/* Brand */}
        {product.brand && (
          <p className="text-xs text-gray-500 mb-1">by <span className="text-blue-600">{product.brand}</span></p>
        )}

        {/* Stars */}
        <div className="mb-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-gray-500">{product.reviewCount?.toLocaleString()} reviews</span>
        </div>

        {/* Price */}
        <div className="mb-2">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">
              ₹{discountedPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-gray-500 line-through">
              ₹{originalPrice.toLocaleString('en-IN')}
            </span>
            <span className="text-sm text-amazon-red font-medium">
              {Math.round((1 - discountedPrice / originalPrice) * 100)}% off
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">Inclusive of all taxes</p>
        </div>

        {/* Stock */}
        <div className="mb-3">{stockBadge()}</div>

        {/* Free shipping badge */}
        <p className="text-xs text-amazon-green mb-3">✓ FREE Delivery above ₹500</p>

        {/* Actions */}
        <div className="mt-auto flex flex-col gap-2">
          <button
            onClick={() => addToCart(product.id, 1, product.name)}
            disabled={product.stock === 0 || loading}
            className="btn-primary w-full flex items-center justify-center gap-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="w-4 h-4" />
            Add to Cart
          </button>
          <Link
            href={`/products/${product.id}`}
            className="btn-secondary w-full flex items-center justify-center gap-2 text-sm text-center"
          >
            <Zap className="w-4 h-4" />
            Buy Now
          </Link>
        </div>
      </div>
    </div>
  );
}
