'use client';
import { useCart } from '@/lib/cartContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';

function CartItemRow({ item, onUpdate, onRemove }) {
  const product = item.product;
  const subtotal = product.price * item.quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-gray-100 last:border-0">
      {/* Image */}
      <Link href={`/products/${product.id}`} className="flex-shrink-0">
        <img
          src={product.images?.[0] || 'https://via.placeholder.com/120'}
          alt={product.name}
          className="w-28 h-28 object-contain bg-white rounded border border-gray-100"
          onError={e => { e.target.src = 'https://via.placeholder.com/120'; }}
        />
      </Link>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-medium text-gray-900 hover:text-blue-600 line-clamp-2 mb-1">
            {product.name}
          </h3>
        </Link>

        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-amazon-red mb-1">Only {product.stock} left in stock</p>
        )}
        {product.stock === 0 && (
          <p className="text-xs text-amazon-red font-semibold mb-1">Out of Stock</p>
        )}

        <p className="text-xs text-amazon-green mb-2">✓ Eligible for FREE Delivery</p>

        {/* Quantity Controls + Delete */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => item.quantity > 1 ? onUpdate(item.id, item.quantity - 1) : onRemove(item.id)}
              className="px-2 py-1 hover:bg-gray-100 transition-colors"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="px-3 py-1 text-sm font-medium border-x border-gray-300 min-w-[36px] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onUpdate(item.id, item.quantity + 1)}
              disabled={item.quantity >= product.stock}
              className="px-2 py-1 hover:bg-gray-100 transition-colors disabled:opacity-40"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>

          <button
            onClick={() => onRemove(item.id)}
            className="text-sm text-blue-600 hover:text-amazon-red flex items-center gap-1 hover:underline"
          >
            <Trash2 className="w-3 h-3" />
            Delete
          </button>

          <span className="text-gray-300">|</span>
          <button className="text-sm text-blue-600 hover:underline">Save for later</button>
        </div>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-lg">₹{subtotal.toLocaleString('en-IN')}</p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-500">₹{product.price.toLocaleString('en-IN')} each</p>
        )}
      </div>
    </div>
  );
}

export default function CartPage() {
  const { cart, updateQuantity, removeItem } = useCart();
  const router = useRouter();

  const tax = parseFloat((cart.subtotal * 0.18).toFixed(2));
  const shipping = cart.subtotal >= 500 ? 0 : 49;
  const total = cart.subtotal + tax + shipping;

  if (cart.items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="w-20 h-20 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Your Shopping Cart is empty</h2>
        <p className="text-gray-500 mb-6">Add items to get started</p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2 px-8 py-3 text-base">
          <ShoppingBag className="w-5 h-5" />
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-6 text-amazon-dark">Shopping Cart</h1>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Cart Items ───────────────────────────────────────────────────── */}
        <div className="flex-1">
          <div className="bg-white rounded shadow-sm p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-200">
              <h2 className="font-semibold text-gray-700">
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}
              </h2>
              <p className="text-right text-sm text-gray-500">Price</p>
            </div>

            {cart.items.map(item => (
              <CartItemRow
                key={item.id}
                item={item}
                onUpdate={updateQuantity}
                onRemove={removeItem}
              />
            ))}

            {/* Subtotal at bottom */}
            <div className="text-right mt-4 pt-4 border-t border-gray-100">
              <p className="text-lg">
                Subtotal ({cart.itemCount} items):{' '}
                <span className="font-bold text-xl">₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </p>
            </div>
          </div>
        </div>

        {/* ─── Order Summary (Sticky Panel) ──────────────────────────────────── */}
        <div className="w-full lg:w-80 flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-5 sticky top-28">
            {/* Free delivery notice */}
            {shipping === 0 ? (
              <div className="bg-green-50 border border-green-200 rounded p-2 mb-4 text-sm text-green-700">
                ✓ Your order qualifies for <strong>FREE Delivery</strong>
              </div>
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded p-2 mb-4 text-sm text-yellow-700">
                Add ₹{(500 - cart.subtotal).toLocaleString('en-IN')} more to get FREE Delivery
              </div>
            )}

            <h2 className="text-lg font-bold mb-4">Order Summary</h2>

            <div className="space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Items ({cart.itemCount})</span>
                <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Delivery</span>
                <span className={shipping === 0 ? 'text-amazon-green font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-bold text-lg">
                <span>Order Total</span>
                <span className="text-amazon-red">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Coupon field */}
            <div className="flex gap-2 mb-4">
              <div className="flex-1 flex items-center border border-gray-300 rounded px-2">
                <Tag className="w-4 h-4 text-gray-400 mr-1" />
                <input placeholder="Coupon code" className="text-sm flex-1 py-1.5 focus:outline-none" />
              </div>
              <button className="text-sm px-3 py-1.5 border border-gray-300 rounded hover:bg-gray-50">Apply</button>
            </div>

            <button
              onClick={() => router.push('/checkout')}
              className="btn-primary w-full py-3 text-base font-semibold flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Trust signals */}
            <div className="mt-4 pt-4 border-t border-gray-100 space-y-1">
              <p className="text-xs text-gray-500 flex items-center gap-1">🔒 Secure checkout</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">↩️ Easy 10-day returns</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">✅ 100% authentic products</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
