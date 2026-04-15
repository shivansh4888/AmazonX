'use client';
import { useState } from 'react';
import { ordersApi } from '@/lib/api';
import Link from 'next/link';
import { Package, Search, ChevronRight, Clock } from 'lucide-react';

const STATUS_COLORS = {
  CONFIRMED: 'bg-blue-100 text-blue-700',
  PROCESSING: 'bg-yellow-100 text-yellow-700',
  SHIPPED: 'bg-purple-100 text-purple-700',
  DELIVERED: 'bg-green-100 text-green-700',
  CANCELLED: 'bg-red-100 text-red-700',
};

const PAYMENT_LABELS = {
  CARD: '💳 Card',
  UPI: '📱 UPI',
  COD: '💰 COD',
};

export default function OrdersPage() {
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState('');

  const fetchOrders = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const { data } = await ordersApi.getByEmail(email);
      setOrders(data);
      setSearched(true);
    } catch (err) {
      setError('Failed to fetch orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amazon-dark mb-2">Your Orders</h1>
      <p className="text-gray-500 text-sm mb-6">Enter your email to view your order history</p>

      {/* Email Search */}
      <div className="bg-white rounded shadow-sm p-6 mb-6">
        <form onSubmit={fetchOrders} className="flex gap-3">
          <div className="flex-1">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="input-field"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 flex items-center gap-2"
          >
            {loading ? (
              <span className="animate-spin">⏳</span>
            ) : (
              <><Search className="w-4 h-4" /> Search</>
            )}
          </button>
        </form>
      </div>

      {/* Orders List */}
      {searched && (
        orders.length === 0 ? (
          <div className="bg-white rounded shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-700 mb-2">No orders found</h2>
            <p className="text-gray-400 text-sm mb-6">No orders found for <strong>{email}</strong></p>
            <Link href="/" className="btn-primary px-8 py-2 inline-block">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">{orders.length} order{orders.length !== 1 ? 's' : ''} found</p>

            {orders.map(order => (
              <div key={order.id} className="bg-white rounded shadow-sm overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 border-b border-gray-200 px-5 py-3 flex flex-wrap items-center gap-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Order Placed</p>
                    <p className="font-medium">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                    <p className="font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide">Payment</p>
                    <p className="font-medium">{PAYMENT_LABELS[order.paymentMethod]}</p>
                  </div>
                  <div className="ml-auto flex items-center gap-3">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_COLORS[order.status]}`}>
                      {order.status}
                    </span>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-sm flex items-center gap-1"
                    >
                      View Details <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-5">
                  {order.items?.slice(0, 3).map(item => (
                    <div key={item.id} className="flex gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        {item.product?.images?.[0] ? (
                          <img src={item.product.images[0]} alt={item.name} className="w-full h-full object-contain" />
                        ) : (
                          <Package className="w-6 h-6 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity} · ₹{item.price.toLocaleString('en-IN')} each</p>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <p className="text-sm text-gray-400 mt-2 text-center">+{order.items.length - 3} more items</p>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>Estimated delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  );
}
