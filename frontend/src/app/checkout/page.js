'use client';
// Checkout Page - Multi-step checkout with simulated payment
// Step 1: Shipping Address
// Step 2: Payment Selection (Card / UPI / COD)
// Step 3: Order Review + Place Order

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/lib/cartContext';
import { ordersApi } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  CreditCard, Smartphone, Banknote,
  CheckCircle, Lock, ChevronRight,
  Loader2, AlertCircle, Clock
} from 'lucide-react';

// ─── Step Indicator ─────────────────────────────────────────────────────────
function StepIndicator({ step }) {
  const steps = ['Shipping', 'Payment', 'Review'];
  return (
    <div className="flex items-center justify-center mb-8">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${i + 1 <= step ? 'bg-amazon-orange text-black' : 'bg-gray-200 text-gray-500'}`}>
            {i + 1 < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          <span className={`ml-2 text-sm font-medium ${i + 1 <= step ? 'text-amazon-dark' : 'text-gray-400'}`}>{s}</span>
          {i < steps.length - 1 && <div className={`w-16 h-0.5 mx-3 ${i + 1 < step ? 'bg-amazon-orange' : 'bg-gray-200'}`} />}
        </div>
      ))}
    </div>
  );
}

// ─── Card Payment Form ───────────────────────────────────────────────────────
function CardPaymentForm({ cardData, onChange }) {
  const formatCardNumber = (val) => {
    return val.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (val) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    return cleaned.length > 2 ? `${cleaned.slice(0, 2)}/${cleaned.slice(2)}` : cleaned;
  };

  const detectCardType = (num) => {
    const n = num.replace(/\s/g, '');
    if (n.startsWith('4')) return '💳 Visa';
    if (n.startsWith('5') || n.startsWith('2')) return '💳 Mastercard';
    if (n.startsWith('6')) return '💳 RuPay';
    if (n.startsWith('3')) return '💳 Amex';
    return '💳';
  };

  return (
    <div className="space-y-4">
      {/* Card number preview */}
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-5 text-white mb-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-4 right-4 w-24 h-24 rounded-full bg-white" />
          <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-white" />
        </div>
        <p className="text-xs text-gray-400 mb-3">{detectCardType(cardData.cardNumber || '')}</p>
        <p className="text-xl font-mono tracking-widest mb-4">
          {cardData.cardNumber || '•••• •••• •••• ••••'}
        </p>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-gray-400 text-xs">CARDHOLDER</p>
            <p className="font-medium uppercase">{cardData.cardName || 'YOUR NAME'}</p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-xs">EXPIRES</p>
            <p className="font-medium">{cardData.expiryDate || 'MM/YY'}</p>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Card Number *</label>
        <input
          type="text"
          value={cardData.cardNumber || ''}
          onChange={e => onChange('cardNumber', formatCardNumber(e.target.value))}
          placeholder="1234 5678 9012 3456"
          className="input-field font-mono"
          maxLength={19}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name on Card *</label>
        <input
          type="text"
          value={cardData.cardName || ''}
          onChange={e => onChange('cardName', e.target.value.toUpperCase())}
          placeholder="JOHN DOE"
          className="input-field uppercase"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date *</label>
          <input
            type="text"
            value={cardData.expiryDate || ''}
            onChange={e => onChange('expiryDate', formatExpiry(e.target.value))}
            placeholder="MM/YY"
            className="input-field"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">CVV *</label>
          <input
            type="password"
            value={cardData.cvv || ''}
            onChange={e => onChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="•••"
            className="input-field"
            maxLength={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <Lock className="w-3 h-3 text-green-600" />
        <span>Your card details are 100% safe. This is a <strong>demo payment</strong> — no real charges.</span>
      </div>
    </div>
  );
}

// ─── UPI Payment (QR Code) ───────────────────────────────────────────────────
function UPIPaymentForm({ total, onPaymentSuccess }) {
  const [timeLeft, setTimeLeft] = useState(30);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [upiId, setUpiId] = useState('');
  const [upiMethod, setUpiMethod] = useState('qr'); // 'qr' or 'id'
  const timerRef = useRef(null);

  // Generate QR code using qrcode library (server-side via API would be ideal,
  // but for demo we'll create a fake QR-looking visual)
  useEffect(() => {
    // Simulate QR generation - in real app use qrcode npm package
    const upiString = `upi://pay?pa=shopx@paytm&pn=ShopX+Store&am=${total}&cu=INR&tn=ShopX+Order`;
    // We'll show a placeholder QR since we can't run qrcode library client-side easily
    setQrDataUrl(upiString);

    // Start countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Auto-mark as paid after timer expires
          onPaymentSuccess();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const progressPercent = ((30 - timeLeft) / 30) * 100;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setUpiMethod('qr')}
          className={`flex-1 py-2 text-sm rounded border font-medium ${upiMethod === 'qr' ? 'border-amazon-orange bg-orange-50 text-amazon-orange' : 'border-gray-300'}`}
        >
          QR Code
        </button>
        <button
          onClick={() => setUpiMethod('id')}
          className={`flex-1 py-2 text-sm rounded border font-medium ${upiMethod === 'id' ? 'border-amazon-orange bg-orange-50 text-amazon-orange' : 'border-gray-300'}`}
        >
          UPI ID
        </button>
      </div>

      {upiMethod === 'qr' ? (
        <div className="text-center">
          <p className="text-sm text-gray-600 mb-4">Scan the QR code with any UPI app to pay</p>

          {/* QR Code - Fake but realistic looking */}
          <div className="inline-block bg-white border-2 border-gray-200 rounded-xl p-4 mb-3 shadow-sm relative">
            <div className="w-48 h-48 relative mx-auto">
              {/* Fake QR pattern using grid */}
              <svg viewBox="0 0 200 200" className="w-full h-full">
                {/* QR corners */}
                <rect x="10" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="8" />
                <rect x="18" y="18" width="34" height="34" fill="#000" />
                <rect x="140" y="10" width="50" height="50" fill="none" stroke="#000" strokeWidth="8" />
                <rect x="148" y="18" width="34" height="34" fill="#000" />
                <rect x="10" y="140" width="50" height="50" fill="none" stroke="#000" strokeWidth="8" />
                <rect x="18" y="148" width="34" height="34" fill="#000" />
                {/* Random dots for QR body */}
                {[...Array(15)].map((_, i) => [
                  <rect key={`a${i}`} x={70 + (i * 7) % 80} y={20 + (i * 11) % 170} width="6" height="6" fill="#000" />,
                  <rect key={`b${i}`} x={75 + (i * 13) % 60} y={30 + (i * 7) % 140} width="6" height="6" fill="#000" />,
                  <rect key={`c${i}`} x={80 + (i * 11) % 70} y={70 + (i * 9) % 80} width="6" height="6" fill="#000" />
                ])}
                {/* UPI logo in center */}
                <rect x="82" y="82" width="36" height="36" fill="white" />
                <text x="100" y="104" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6B21A8">UPI</text>
              </svg>
            </div>

            {/* Brand logos */}
            <div className="flex justify-center gap-2 mt-2">
              {['GPay', 'PhonePe', 'Paytm', 'BHIM'].map(app => (
                <span key={app} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{app}</span>
              ))}
            </div>
          </div>

          {/* Timer */}
          <div className="mb-3">
            <div className="flex items-center justify-center gap-2 text-sm font-medium mb-1">
              <Clock className="w-4 h-4 text-amazon-orange" />
              <span>QR expires in <span className={`font-bold ${timeLeft <= 10 ? 'text-amazon-red' : 'text-amazon-orange'}`}>{timeLeft}s</span></span>
            </div>
            <div className="w-48 mx-auto bg-gray-200 rounded-full h-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-1000 ${timeLeft <= 10 ? 'bg-amazon-red' : 'bg-amazon-orange'}`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-gray-500">Amount: <strong className="text-gray-800">₹{total.toLocaleString('en-IN')}</strong></p>
          <p className="text-xs text-gray-400 mt-1">UPI ID: shopx@paytm</p>

          <button onClick={onPaymentSuccess} className="mt-4 text-sm text-blue-600 hover:underline">
            ✅ I have paid (simulate success)
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Enter UPI ID *</label>
            <input
              type="text"
              value={upiId}
              onChange={e => setUpiId(e.target.value)}
              placeholder="yourname@paytm"
              className="input-field"
            />
            <p className="text-xs text-gray-400 mt-1">e.g. 9876543210@upi, name@okicici</p>
          </div>
          <p className="text-sm text-gray-500">Amount to pay: <strong>₹{total.toLocaleString('en-IN')}</strong></p>
          <button
            onClick={onPaymentSuccess}
            disabled={!upiId.includes('@')}
            className="btn-primary w-full py-3 disabled:opacity-50"
          >
            Send Payment Request
          </button>
        </div>
      )}

      <p className="text-xs text-center text-gray-400">
        🔒 Demo only — No real payment processed
      </p>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { cart } = useCart();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [processing, setProcessing] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [cardData, setCardData] = useState({});
  const [upiVerified, setUpiVerified] = useState(false);

  const [address, setAddress] = useState({
    name: '', phone: '', email: '', address: '',
    city: '', state: '', pincode: '', country: 'India'
  });

  const [errors, setErrors] = useState({});

  const tax = cart.tax;
  const shipping = cart.shipping;
  const total = cart.total;

  // Validate shipping form
  const validateAddress = () => {
    const newErrors = {};
    if (!address.name.trim()) newErrors.name = 'Full name required';
    if (!address.phone.match(/^\d{10}$/)) newErrors.phone = 'Valid 10-digit phone required';
    if (!address.email.includes('@')) newErrors.email = 'Valid email required';
    if (!address.address.trim()) newErrors.address = 'Street address required';
    if (!address.city.trim()) newErrors.city = 'City required';
    if (!address.state.trim()) newErrors.state = 'State required';
    if (!address.pincode.match(/^\d{6}$/)) newErrors.pincode = 'Valid 6-digit PIN code required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateCard = () => {
    if (!cardData.cardNumber?.replace(/\s/g, '').match(/^\d{15,16}$/)) {
      toast.error('Enter a valid card number'); return false;
    }
    if (!cardData.cardName?.trim()) {
      toast.error('Enter name on card'); return false;
    }
    if (!cardData.expiryDate?.match(/^\d{2}\/\d{2}$/)) {
      toast.error('Enter valid expiry date (MM/YY)'); return false;
    }
    if (!cardData.cvv?.match(/^\d{3,4}$/)) {
      toast.error('Enter valid CVV'); return false;
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    // Final payment validation for card
    if (paymentMethod === 'CARD' && !validateCard()) return;

    setProcessing(true);
    setPlacingOrder(true);

    try {
      const orderData = {
        items: cart.items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity
        })),
        shippingAddress: address,
        customerEmail: address.email,
        customerName: address.name,
        paymentMethod,
        paymentData: paymentMethod === 'CARD' ? {
          cardNumber: cardData.cardNumber?.replace(/\s/g, ''),
          expiryDate: cardData.expiryDate,
          cvv: cardData.cvv
        } : {}
      };

      const { data } = await ordersApi.create(orderData);

      // Show email preview link (Ethereal) in dev
      if (data.emailPreview) {
        console.log('📧 Email preview:', data.emailPreview);
      }

      router.replace(`/orders/${data.order.id}?new=true`);
    } catch (error) {
      const msg = error.response?.data?.error || 'Order placement failed. Please try again.';
      toast.error(msg);
      setProcessing(false);
      setPlacingOrder(false);
    }
  };

  if (cart.items.length === 0 && !processing && !placingOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <p className="text-xl font-semibold mb-4">Your cart is empty</p>
        <button onClick={() => router.push('/')} className="btn-primary px-8 py-3">Shop Now</button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-amazon-dark mb-6 text-center">Checkout</h1>
      <StepIndicator step={step} />

      <div className="flex flex-col lg:flex-row gap-6">
        {/* ─── Left: Step Content ─────────────────────────────────────────── */}
        <div className="flex-1">

          {/* ── STEP 1: Shipping Address ────────────────────────────────── */}
          {step === 1 && (
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="section-title flex items-center gap-2">
                <span className="bg-amazon-orange text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">1</span>
                Shipping Address
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    className={`input-field ${errors.name ? 'border-red-400' : ''}`}
                    value={address.name}
                    onChange={e => setAddress(a => ({ ...a, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                  {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    className={`input-field ${errors.phone ? 'border-red-400' : ''}`}
                    value={address.phone}
                    onChange={e => setAddress(a => ({ ...a, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                    placeholder="9876543210"
                    maxLength={10}
                  />
                  {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    className={`input-field ${errors.email ? 'border-red-400' : ''}`}
                    value={address.email}
                    onChange={e => setAddress(a => ({ ...a, email: e.target.value }))}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
                  <p className="text-xs text-gray-400 mt-1">Order confirmation will be sent here</p>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    className={`input-field ${errors.address ? 'border-red-400' : ''}`}
                    value={address.address}
                    onChange={e => setAddress(a => ({ ...a, address: e.target.value }))}
                    placeholder="123, MG Road, Near Central Mall"
                  />
                  {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                  <input
                    className={`input-field ${errors.city ? 'border-red-400' : ''}`}
                    value={address.city}
                    onChange={e => setAddress(a => ({ ...a, city: e.target.value }))}
                    placeholder="Mumbai"
                  />
                  {errors.city && <p className="text-xs text-red-500 mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                  <select
                    className={`input-field ${errors.state ? 'border-red-400' : ''}`}
                    value={address.state}
                    onChange={e => setAddress(a => ({ ...a, state: e.target.value }))}
                  >
                    <option value="">Select State</option>
                    {['Andhra Pradesh','Delhi','Goa','Gujarat','Haryana','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Punjab','Rajasthan','Tamil Nadu','Telangana','Uttar Pradesh','West Bengal'].map(s => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <p className="text-xs text-red-500 mt-1">{errors.state}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">PIN Code *</label>
                  <input
                    className={`input-field ${errors.pincode ? 'border-red-400' : ''}`}
                    value={address.pincode}
                    onChange={e => setAddress(a => ({ ...a, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) }))}
                    placeholder="400001"
                    maxLength={6}
                  />
                  {errors.pincode && <p className="text-xs text-red-500 mt-1">{errors.pincode}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input className="input-field bg-gray-50" value="India" readOnly />
                </div>
              </div>

              <button
                onClick={() => { if (validateAddress()) setStep(2); }}
                className="btn-primary mt-6 px-8 py-3 flex items-center gap-2"
              >
                Continue to Payment <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* ── STEP 2: Payment ─────────────────────────────────────────── */}
          {step === 2 && (
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="section-title flex items-center gap-2">
                <span className="bg-amazon-orange text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">2</span>
                Payment Method
              </h2>

              {/* Payment method selector */}
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'CARD', icon: CreditCard, label: 'Card', sub: 'Credit / Debit' },
                  { id: 'UPI', icon: Smartphone, label: 'UPI', sub: 'QR / UPI ID' },
                  { id: 'COD', icon: Banknote, label: 'Cash', sub: 'On Delivery' },
                ].map(({ id, icon: Icon, label, sub }) => (
                  <button
                    key={id}
                    onClick={() => { setPaymentMethod(id); setUpiVerified(false); }}
                    className={`border-2 rounded-lg p-3 text-center transition-all ${paymentMethod === id ? 'border-amazon-orange bg-orange-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-1 ${paymentMethod === id ? 'text-amazon-orange' : 'text-gray-500'}`} />
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs text-gray-500">{sub}</p>
                  </button>
                ))}
              </div>

              {/* Payment form based on selection */}
              <div className="border border-gray-200 rounded-lg p-4 mb-6">
                {paymentMethod === 'CARD' && (
                  <CardPaymentForm
                    cardData={cardData}
                    onChange={(key, val) => setCardData(d => ({ ...d, [key]: val }))}
                  />
                )}

                {paymentMethod === 'UPI' && (
                  <UPIPaymentForm
                    total={total}
                    onPaymentSuccess={() => {
                      setUpiVerified(true);
                      toast.success('Payment verified!', { icon: '✅' });
                    }}
                  />
                )}

                {paymentMethod === 'COD' && (
                  <div className="text-center py-6">
                    <Banknote className="w-16 h-16 text-amazon-green mx-auto mb-3" />
                    <h3 className="font-semibold text-lg mb-2">Cash on Delivery</h3>
                    <p className="text-gray-500 text-sm mb-4">Pay ₹{total.toLocaleString('en-IN')} when your order arrives</p>
                    <div className="text-left bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                      <p className="font-medium mb-1">Important notes:</p>
                      <ul className="text-gray-600 space-y-1 text-xs list-disc list-inside">
                        <li>Keep exact change ready if possible</li>
                        <li>COD available for orders up to ₹50,000</li>
                        <li>Delivery in 5-7 business days</li>
                      </ul>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  ← Back
                </button>
                <button
                  onClick={() => {
                    if (paymentMethod === 'UPI' && !upiVerified) {
                      toast.error('Please complete UPI payment first');
                      return;
                    }
                    setStep(3);
                  }}
                  className="btn-primary px-8 py-2 flex items-center gap-2"
                >
                  Review Order <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Review & Place ───────────────────────────────────── */}
          {step === 3 && (
            <div className="bg-white rounded shadow-sm p-6">
              <h2 className="section-title flex items-center gap-2">
                <span className="bg-amazon-orange text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">3</span>
                Review Your Order
              </h2>

              {/* Address summary */}
              <div className="border rounded p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-sm">Delivering to</h3>
                  <button onClick={() => setStep(1)} className="text-xs text-blue-600 hover:underline">Change</button>
                </div>
                <p className="font-semibold">{address.name}</p>
                <p className="text-sm text-gray-600">{address.address}, {address.city}, {address.state} {address.pincode}</p>
                <p className="text-sm text-gray-600">📞 {address.phone}</p>
                <p className="text-sm text-gray-600">📧 {address.email}</p>
              </div>

              {/* Payment summary */}
              <div className="border rounded p-4 mb-4">
                <div className="flex justify-between mb-2">
                  <h3 className="font-medium text-sm">Payment</h3>
                  <button onClick={() => setStep(2)} className="text-xs text-blue-600 hover:underline">Change</button>
                </div>
                <p className="text-sm font-medium">
                  {paymentMethod === 'CARD' && `💳 Card ending in ${cardData.cardNumber?.replace(/\s/g, '').slice(-4) || '****'}`}
                  {paymentMethod === 'UPI' && '📱 UPI Payment (Verified ✅)'}
                  {paymentMethod === 'COD' && '💰 Cash on Delivery'}
                </p>
              </div>

              {/* Items */}
              <div className="border rounded p-4 mb-6">
                <h3 className="font-medium text-sm mb-3">Items ({cart.itemCount})</h3>
                {cart.items.map(item => (
                  <div key={item.id} className="flex gap-3 py-2 border-b border-gray-100 last:border-0">
                    <img src={item.product.images?.[0]} alt={item.product.name}
                      className="w-12 h-12 object-contain bg-gray-50 rounded" />
                    <div className="flex-1 text-sm">
                      <p className="font-medium line-clamp-1">{item.product.name}</p>
                      <p className="text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-sm">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50 text-sm">
                  ← Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={processing || placingOrder}
                  className="btn-primary flex-1 py-3 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {processing || placingOrder ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {placingOrder ? 'Opening confirmation...' : 'Processing Payment...'}</>
                  ) : (
                    <><Lock className="w-4 h-4" /> Place Order · ₹{total.toLocaleString('en-IN')}</>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Right: Order Summary ────────────────────────────────────────── */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white rounded shadow-sm p-5 sticky top-28">
            <h2 className="font-bold text-lg mb-4">Order Summary</h2>

            {/* Items list */}
            <div className="max-h-48 overflow-y-auto mb-4 space-y-2">
              {cart.items.map(item => (
                <div key={item.id} className="flex gap-2 text-sm">
                  <img src={item.product.images?.[0]} alt="" className="w-10 h-10 object-contain bg-gray-50 rounded flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-xs font-medium">₹{(item.product.price * item.quantity).toLocaleString('en-IN')}</p>
                </div>
              ))}
            </div>

            <hr className="mb-3" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>₹{cart.subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Tax (18% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? 'text-amazon-green font-medium' : ''}>
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <hr />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span className="text-amazon-red">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-400 flex items-center gap-1"><Lock className="w-3 h-3" /> SSL Encrypted & Secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
