'use client';
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { ordersApi } from '@/lib/api';
import {
  CheckCircle, Package, Truck, MapPin,
  CreditCard, Smartphone, Banknote,
  ArrowRight, Copy, Check, Mail
} from 'lucide-react';
import Link from 'next/link';

const STATUS_STEPS = ['Confirmed', 'Processing', 'Shipped', 'Delivered'];

function OrderTracker({ status }) {
  const currentStep = { CONFIRMED: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3 }[status] ?? 0;

  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0">
        <div
          className="h-full bg-amazon-orange transition-all duration-500"
          style={{ width: `${(currentStep / 3) * 100}%` }}
        />
      </div>
      {STATUS_STEPS.map((s, i) => {
        const done = i <= currentStep;
        return (
          <div key={s} className="flex flex-col items-center z-10">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${done ? 'bg-amazon-orange border-amazon-orange' : 'bg-white border-gray-300'}`}>
              {done ? <Check className="w-4 h-4 text-black" /> : <span className="text-xs text-gray-400">{i + 1}</span>}
            </div>
            <p className={`text-xs mt-2 font-medium ${done ? 'text-amazon-orange' : 'text-gray-400'}`}>{s}</p>
          </div>
        );
      })}
    </div>
  );
}

export default function OrderConfirmationPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isNew = searchParams.get('new') === 'true';

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await ordersApi.getById(id);
        setOrder(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="animate-pulse space-y-4">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto shimmer" />
          <div className="h-6 bg-gray-200 rounded shimmer max-w-sm mx-auto" />
          <div className="h-4 bg-gray-200 rounded shimmer max-w-xs mx-auto" />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold mb-4">Order not found</p>
        <Link href="/orders" className="btn-primary">View My Orders</Link>
      </div>
    );
  }

  const paymentLabel = { CARD: '💳 Card', UPI: '📱 UPI', COD: '💰 Cash on Delivery' }[order.paymentMethod];
  const deliveryDate = new Date(order.estimatedDelivery).toLocaleDateString('en-IN', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
  const address = order.shippingAddress;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* ─── Success Header ────────────────────────────────────────────────── */}
      {isNew && (
        <div className="bg-amazon-dark text-white rounded-lg p-8 text-center mb-6 relative overflow-hidden">
          {/* Celebration dots */}
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-amazon-orange opacity-60"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animation: `ping ${1 + Math.random()}s ease-in-out ${Math.random()}s infinite`
                }}
              />
            ))}
          </div>

          <CheckCircle className="w-16 h-16 text-amazon-orange mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Order Placed Successfully! 🎉</h1>
          <p className="text-gray-300">Thank you, <strong>{address.name}</strong>! Your order is confirmed.</p>
          <p className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-1">
            <Mail className="w-4 h-4" />
            Confirmation email sent to <strong>{order.customerEmail}</strong>
          </p>
        </div>
      )}

      {/* ─── Order ID Banner ───────────────────────────────────────────────── */}
      <div className="bg-white rounded shadow-sm p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Order ID</p>
          <p className="font-mono font-bold text-gray-900">{order.id.toUpperCase()}</p>
          <p className="text-xs text-gray-400 mt-0.5">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <button
          onClick={copyOrderId}
          className="flex items-center gap-1 text-sm text-blue-600 hover:bg-gray-50 px-3 py-2 rounded"
        >
          {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy ID'}
        </button>
      </div>

      {/* ─── Order Tracker ─────────────────────────────────────────────────── */}
      <div className="bg-white rounded shadow-sm p-6 mb-4">
        <div className="flex items-center gap-2 mb-1">
          <Truck className="w-5 h-5 text-amazon-orange" />
          <h2 className="font-bold">Estimated Delivery</h2>
        </div>
        <p className="text-xl font-bold text-amazon-green mb-5">{deliveryDate}</p>
        <OrderTracker status={order.status} />
      </div>

      {/* ─── Items ─────────────────────────────────────────────────────────── */}
      <div className="bg-white rounded shadow-sm p-6 mb-4">
        <h2 className="section-title flex items-center gap-2">
          <Package className="w-5 h-5" /> Items Ordered ({order.items.length})
        </h2>
        {order.items.map(item => (
          <div key={item.id} className="flex gap-4 py-3 border-b border-gray-100 last:border-0">
            <div className="w-16 h-16 bg-gray-50 rounded flex-shrink-0 flex items-center justify-center">
              <Package className="w-8 h-8 text-gray-300" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{item.name}</p>
              <p className="text-xs text-gray-500 mt-0.5">Qty: {item.quantity} × ₹{item.price.toLocaleString('en-IN')}</p>
            </div>
            <p className="font-bold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
          </div>
        ))}

        {/* Totals */}
        <div className="mt-4 pt-3 border-t border-gray-200 space-y-2 text-sm">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>₹{order.subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (18% GST)</span>
            <span>₹{order.tax.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span className={order.shippingCost === 0 ? 'text-amazon-green font-medium' : ''}>
              {order.shippingCost === 0 ? 'FREE' : `₹${order.shippingCost}`}
            </span>
          </div>
          <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
            <span>Order Total</span>
            <span className="text-amazon-red">₹{order.total.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      {/* ─── Shipping & Payment Details ────────────────────────────────────── */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <MapPin className="w-4 h-4 text-amazon-orange" />
            <h3 className="font-semibold">Shipping Address</h3>
          </div>
          <p className="font-medium">{address.name}</p>
          <p className="text-sm text-gray-600 leading-relaxed mt-1">
            {address.address}<br />
            {address.city}, {address.state} {address.pincode}<br />
            {address.country}
          </p>
          <p className="text-sm text-gray-600 mt-1">📞 {address.phone}</p>
        </div>

        <div className="bg-white rounded shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-amazon-orange" />
            <h3 className="font-semibold">Payment Info</h3>
          </div>
          <p className="font-medium">{paymentLabel}</p>
          <p className={`text-sm mt-1 font-medium ${order.paymentStatus === 'PAID' ? 'text-amazon-green' : 'text-orange-500'}`}>
            {order.paymentStatus === 'PAID' ? '✅ Payment Successful' : '⏳ Payment due on delivery'}
          </p>
          <p className="text-xs text-gray-400 mt-2">Transaction processed securely</p>
        </div>
      </div>

      {/* ─── Actions ────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className="btn-primary flex-1 text-center py-3 font-semibold flex items-center justify-center gap-2">
          Continue Shopping <ArrowRight className="w-4 h-4" />
        </Link>
        <Link href="/orders" className="btn-secondary flex-1 text-center py-3 font-semibold flex items-center justify-center gap-2">
          View All Orders
        </Link>
      </div>
    </div>
  );
}
