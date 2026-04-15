'use client';
import { useState, useEffect } from 'react';
import { Star, ThumbsUp, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

// Hardcoded seed reviews per product category
const SEED_REVIEWS = {
  Electronics: [
    { id: 'h1', name: 'Rahul Sharma', rating: 5, title: 'Absolutely worth every rupee!', body: 'Incredible build quality. The performance blew me away — handles everything I throw at it effortlessly. Delivery was fast and packaging superb.', date: '2024-11-12', verified: true, helpful: 47 },
    { id: 'h2', name: 'Priya Mehta', rating: 4, title: 'Great product, minor issues', body: 'Really happy with the purchase overall. Battery life is phenomenal. Docked one star because the setup took longer than expected, but support was helpful.', date: '2024-10-28', verified: true, helpful: 23 },
    { id: 'h3', name: 'Aditya Nair', rating: 5, title: 'Best purchase of the year', body: 'I was skeptical at first but this exceeded all my expectations. The display quality is stunning and performance is buttery smooth.', date: '2024-09-15', verified: false, helpful: 31 },
  ],
  Books: [
    { id: 'h1', name: 'Sneha Patel', rating: 5, title: 'Changed my perspective completely', body: 'I have read hundreds of books and this is genuinely one of the best. The concepts are explained so clearly and the examples are spot on. Finished it in 2 sittings.', date: '2024-11-01', verified: true, helpful: 89 },
    { id: 'h2', name: 'Karan Joshi', rating: 4, title: 'Insightful but repetitive in parts', body: 'Core ideas are brilliant and actionable. Some chapters repeat the same point in different ways which makes it drag a bit. Still a must-read.', date: '2024-10-15', verified: true, helpful: 34 },
    { id: 'h3', name: 'Ananya Reddy', rating: 5, title: 'Gifted this to my whole team', body: 'Bought 5 copies for my startup team. The frameworks presented here transformed how we think about growth and daily habits. Highly recommended!', date: '2024-08-22', verified: true, helpful: 56 },
  ],
  Clothing: [
    { id: 'h1', name: 'Mohit Gupta', rating: 4, title: 'True to size, comfortable fit', body: 'Material quality is much better than I expected for the price. Washed it 6 times and no fading or shrinking. Would definitely buy again.', date: '2024-11-08', verified: true, helpful: 19 },
    { id: 'h2', name: 'Divya Singh', rating: 3, title: 'Good but sizing runs small', body: 'The product itself is nice quality but I had to exchange for a larger size. Sizing chart on the page is a bit off. Exchange process was smooth though.', date: '2024-10-20', verified: true, helpful: 42 },
    { id: 'h3', name: 'Rohan Kapoor', rating: 5, title: 'Premium feel at a great price', body: 'Couldn\'t believe the quality for this price point. Wearing it daily and it still looks brand new after a month. Very impressed.', date: '2024-09-30', verified: false, helpful: 27 },
  ],
  'Home & Kitchen': [
    { id: 'h1', name: 'Deepa Iyer', rating: 5, title: 'Makes cooking so much easier', body: 'This has completely changed my kitchen routine. The build quality is solid and cleanup is a breeze. Used it daily for 3 months with zero issues.', date: '2024-11-05', verified: true, helpful: 63 },
    { id: 'h2', name: 'Suresh Kumar', rating: 4, title: 'Great product, instructions unclear', body: 'The product works brilliantly once set up but the manual is a bit confusing. Watched a YouTube video and figured it out. No regrets after that!', date: '2024-10-10', verified: true, helpful: 28 },
    { id: 'h3', name: 'Meena Pillai', rating: 5, title: 'Worth every penny!', body: 'I gifted this to my mother and she calls me every week to thank me. The quality is outstanding and it has become an essential part of her daily routine.', date: '2024-09-18', verified: true, helpful: 44 },
  ],
  Sports: [
    { id: 'h1', name: 'Vikram Bose', rating: 5, title: 'Performance exceeded expectations', body: 'Used these for my half marathon training and they performed brilliantly. Lightweight, responsive, and my knees felt great even after long runs.', date: '2024-11-10', verified: true, helpful: 38 },
    { id: 'h2', name: 'Tanya Malhotra', rating: 4, title: 'Great for daily use', body: 'Comfortable right out of the box, no break-in period needed. Grip is excellent even on wet surfaces. Minor complaint — the laces loosen a bit too easily.', date: '2024-10-25', verified: true, helpful: 17 },
    { id: 'h3', name: 'Arjun Rao', rating: 5, title: 'Best in this price range', body: 'Researched for weeks before buying. This beats everything else at this price point. Materials are high quality and the design is sleek.', date: '2024-09-12', verified: false, helpful: 52 },
  ],
};

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <button key={i} type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
        >
          <Star className={`w-7 h-7 transition-colors ${i <= (hovered || value) ? 'fill-amazon-orange text-amazon-orange' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="w-12 text-blue-600 text-xs">{star} star</span>
      <div className="flex-1 bg-gray-200 rounded h-3">
        <div className="bg-amazon-orange h-3 rounded transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-xs text-gray-500">{Math.round(pct)}%</span>
    </div>
  );
}

export default function ReviewSection({ product }) {
  const [dbReviews, setDbReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [email, setEmail] = useState('');
  const [checkedEmail, setCheckedEmail] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: '', rating: 0, title: '', body: '' });

  const seedReviews = SEED_REVIEWS[product.category] || SEED_REVIEWS['Electronics'];

  // Fetch DB reviews
  useEffect(() => {
    api.get(`/reviews/${product.id}`)
      .then(r => setDbReviews(r.data))
      .catch(() => {});
  }, [product.id]);

  const allReviews = [
    ...dbReviews.map(r => ({ ...r, verified: true, helpful: 0, date: r.createdAt?.slice(0, 10) })),
    ...seedReviews
  ];

  // Rating breakdown
  const breakdown = [5,4,3,2,1].map(star => ({
    star,
    count: allReviews.filter(r => Math.round(r.rating) === star).length
  }));
  const avgRating = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;

  const checkPurchase = async () => {
    if (!email.includes('@')) { toast.error('Enter a valid email'); return; }
    try {
      const { data } = await api.get(`/reviews/can-review?productId=${product.id}&email=${email}`);
      setCheckedEmail(email);
      setCanReview(data.canReview);
      if (data.canReview) { setShowForm(true); toast.success('Purchase verified! You can review.'); }
      else toast.error('No purchase found for this email.');
    } catch { toast.error('Check failed'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please select a rating'); return; }
    if (!form.title.trim() || !form.body.trim()) { toast.error('Please fill all fields'); return; }
    setSubmitting(true);
    try {
      const { data } = await api.post('/reviews', { ...form, productId: product.id, email: checkedEmail });
      setDbReviews(prev => [data, ...prev]);
      setShowForm(false);
      setForm({ name: '', rating: 0, title: '', body: '' });
      toast.success('Review submitted! Thank you 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed');
    } finally { setSubmitting(false); }
  };

  return (
    <div className="bg-white rounded shadow-sm p-6 mt-6">
      <h2 className="section-title">Customer Reviews</h2>

      {/* Rating Summary */}
      <div className="flex flex-col sm:flex-row gap-8 mb-8">
        <div className="text-center flex-shrink-0">
          <p className="text-6xl font-bold text-gray-900">{avgRating.toFixed(1)}</p>
          <div className="flex justify-center my-1">
            {[1,2,3,4,5].map(i => (
              <Star key={i} className={`w-5 h-5 ${i <= Math.round(avgRating) ? 'fill-amazon-orange text-amazon-orange' : 'text-gray-300'}`} />
            ))}
          </div>
          <p className="text-sm text-gray-500">out of 5</p>
          <p className="text-xs text-gray-400 mt-1">{allReviews.length} reviews</p>
        </div>
        <div className="flex-1 space-y-1.5">
          {breakdown.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={allReviews.length} />
          ))}
        </div>
      </div>

      {/* Write Review Gate */}
      <div className="border border-dashed border-gray-300 rounded-lg p-5 mb-8 bg-gray-50">
        <h3 className="font-semibold mb-1">Review this product</h3>
        <p className="text-sm text-gray-500 mb-3">Share your experience with other customers. Only verified buyers can post reviews.</p>
        {!showForm ? (
          <div className="flex gap-2 flex-wrap">
            <input
              type="email" placeholder="Enter your order email"
              value={email} onChange={e => setEmail(e.target.value)}
              className="input-field flex-1 min-w-48"
            />
            <button onClick={checkPurchase} className="btn-primary px-5 whitespace-nowrap">
              Verify Purchase
            </button>
          </div>
        ) : (
          <form onSubmit={submitReview} className="space-y-3">
            <div>
              <label className="text-sm font-medium block mb-1">Your Rating *</label>
              <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Display Name *</label>
              <input className="input-field" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="John D." required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Review Title *</label>
              <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Summarise your experience" required />
            </div>
            <div>
              <label className="text-sm font-medium block mb-1">Your Review *</label>
              <textarea className="input-field h-24 resize-none" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} placeholder="What did you like or dislike?" required />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={submitting} className="btn-primary px-6">
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Review Cards */}
      <div className="space-y-5">
        {allReviews.map((review, idx) => (
          <div key={review.id || idx} className="border-b border-gray-100 pb-5 last:border-0">
            <div className="flex items-start justify-between mb-1">
              <div>
                <p className="font-semibold text-sm">{review.name}</p>
                {review.verified && (
                  <span className="text-xs text-amazon-green flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Verified Purchase
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-400">{review.date}</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-3.5 h-3.5 ${i <= review.rating ? 'fill-amazon-orange text-amazon-orange' : 'text-gray-300'}`} />
              ))}
              <span className="font-semibold text-sm">{review.title}</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{review.body}</p>
            {review.helpful > 0 && (
              <button className="mt-2 text-xs text-gray-400 flex items-center gap-1 hover:text-gray-600">
                <ThumbsUp className="w-3 h-3" /> {review.helpful} people found this helpful
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}