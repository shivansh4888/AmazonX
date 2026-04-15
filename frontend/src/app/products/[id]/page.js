'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { productsApi } from '@/lib/api';
import { useCart } from '@/lib/cartContext';
import { Star, ShoppingCart, Zap, Check, Shield, Truck, RotateCcw } from 'lucide-react';

import ImageZoom from '@/components/product/ImageZoom';
import AlsoBought from '@/components/product/AlsoBought';
import ReviewSection from '@/components/product/ReviewSection';

function StarRating({ rating, count }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex">
        {[1, 2, 3, 4, 5].map(i => (
          <Star key={i} className={`w-4 h-4 ${i <= Math.round(rating) ? 'fill-amazon-orange text-amazon-orange' : 'text-gray-300'}`} />
        ))}
      </div>
      <span className="text-amazon-orange text-sm font-medium">{rating}</span>
      <span className="text-blue-600 text-sm cursor-pointer hover:underline">{count?.toLocaleString()} ratings</span>
    </div>
  );
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart, loading } = useCart();

  const [product, setProduct] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await productsApi.getById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    const success = await addToCart(product.id, quantity, product.name);
    if (success) {
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, quantity, product.name);
    router.push('/checkout');
  };

  if (fetching) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 animate-pulse">
          <div className="aspect-square bg-gray-200 rounded shimmer" />
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-6 bg-gray-200 rounded shimmer" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button onClick={() => router.push('/')} className="btn-primary">Back to Home</button>
      </div>
    );
  }

  const originalPrice = Math.round(product.price * 1.2);
  const discount = Math.round((1 - product.price / originalPrice) * 100);
  const inStock = product.stock > 0;
  const maxQuantity = Math.min(product.stock, 10);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      <nav className="text-sm text-gray-500 mb-4 flex gap-1">
        <button onClick={() => router.push('/')} className="hover:text-amazon-orange">Home</button>
        <span>›</span>
        <button onClick={() => router.push(`/?category=${product.category}`)} className="hover:text-amazon-orange">{product.category}</button>
        <span>›</span>
        <span className="text-gray-900 truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_420px] gap-8 mb-8">

        <div>
          <ImageZoom src={product.images?.[activeImage]} alt={product.name} />

          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto mt-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`flex-shrink-0 w-16 h-16 bg-white rounded border-2 p-1 ${idx === activeImage ? 'border-amazon-orange' : 'border-gray-200 hover:border-gray-400'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded shadow-sm p-6 h-fit">
          <h1 className="text-xl font-medium text-gray-900 mb-2">{product.name}</h1>

          {product.brand && (
            <p className="text-sm mb-2">
              Brand: <span className="text-blue-600 hover:underline cursor-pointer">{product.brand}</span>
            </p>
          )}

          <StarRating rating={product.rating} count={product.reviewCount} />
          <hr className="my-3" />

          <div className="mb-4">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-3xl font-bold">₹{product.price.toLocaleString('en-IN')}</span>
              <span className="text-gray-500 line-through text-lg">₹{originalPrice.toLocaleString('en-IN')}</span>
              <span className="text-amazon-red font-semibold">({discount}% off)</span>
            </div>

            {product.stock <= 10 && product.stock > 0 && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded px-3 py-2 mb-3 animate-pulse">
                <span className="text-lg">⚡</span>
                <div>
                  <p className="text-xs font-bold text-red-600 uppercase tracking-wide">Lightning Deal</p>
                  <p className="text-xs text-red-500">Only {product.stock} left at this price!</p>
                </div>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-1">Inclusive of all taxes</p>
          </div>

          <div className="space-y-4">
            <div>
              <p className={`text-sm font-semibold ${inStock ? 'text-amazon-green' : 'text-amazon-red'}`}>
                {inStock ? 'In Stock' : 'Currently unavailable'}
              </p>
              {inStock && (
                <p className="text-xs text-gray-500 mt-1">
                  Ships in 1-2 business days. Free delivery on orders above ₹500.
                </p>
              )}
            </div>

            {inStock && (
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity
                </label>
                <select
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  className="w-24 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange"
                >
                  {Array.from({ length: maxQuantity }, (_, index) => index + 1).map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                {loading ? 'Adding...' : addedToCart ? 'Added to Cart' : 'Add to Cart'}
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock || loading}
                className="btn-secondary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-4 h-4" />
                Buy Now
              </button>
            </div>

            {addedToCart && (
              <div className="flex items-center gap-2 rounded border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                <Check className="w-4 h-4" />
                Item added to your cart.
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-3 pt-2">
              <div className="rounded border border-gray-200 p-3">
                <Truck className="w-4 h-4 text-amazon-orange mb-2" />
                <p className="text-sm font-medium">Fast delivery</p>
                <p className="text-xs text-gray-500 mt-1">Tracked shipping on every order.</p>
              </div>
              <div className="rounded border border-gray-200 p-3">
                <RotateCcw className="w-4 h-4 text-amazon-orange mb-2" />
                <p className="text-sm font-medium">Easy returns</p>
                <p className="text-xs text-gray-500 mt-1">7-day return window on eligible items.</p>
              </div>
              <div className="rounded border border-gray-200 p-3">
                <Shield className="w-4 h-4 text-amazon-orange mb-2" />
                <p className="text-sm font-medium">Secure checkout</p>
                <p className="text-xs text-gray-500 mt-1">Protected payment and order details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded shadow-sm p-6">
          <h2 className="section-title">Product Description</h2>
          <p className="text-gray-700 text-sm">{product.description}</p>
        </div>

        <aside className="bg-white rounded shadow-sm p-6 h-fit">
          <h2 className="section-title">Order Summary</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Unit price</span>
              <span className="font-medium">₹{product.price.toLocaleString('en-IN')}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quantity</span>
              <span className="font-medium">{quantity}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Subtotal</span>
              <span className="font-semibold">₹{(product.price * quantity).toLocaleString('en-IN')}</span>
            </div>
            <div className="border-t pt-3">
              <p className="text-xs text-gray-500">
                Final taxes and shipping are calculated at checkout.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <AlsoBought product={product} />
      <ReviewSection product={product} />

    </div>
  );
}
