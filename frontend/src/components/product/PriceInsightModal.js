'use client';

import { X } from 'lucide-react';

export default function PriceInsightModal({ open, insight, loading, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Price Insight</h3>
            <p className="text-sm text-gray-500">Transparent pricing, without the games.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-32 animate-pulse rounded bg-gray-100" />
          </div>
        ) : insight ? (
          <div className="space-y-5">
            <div className={`rounded-xl border p-4 ${insight.isArtificialDiscount ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <p className="text-sm font-semibold">{insight.message}</p>
              <p className="mt-2 text-sm">
                Confidence: <strong>{Math.round((insight.confidence || 0) * 100)}%</strong>
                {' '}• Volatility score: <strong>{insight.volatilityScore}</strong>
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Current price</p>
                <p className="mt-2 text-lg font-bold">₹{insight.currentPrice?.toLocaleString('en-IN')}</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">Pre-discount bump</p>
                <p className="mt-2 text-lg font-bold">{insight.priceIncreasePercent}%</p>
              </div>
              <div className="rounded-lg border border-gray-200 p-4">
                <p className="text-xs uppercase tracking-wide text-gray-500">History points</p>
                <p className="mt-2 text-lg font-bold">{insight.history?.length || 0}</p>
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 p-4">
              <p className="mb-3 text-sm font-semibold text-gray-900">Recent price timeline</p>
              <div className="space-y-2">
                {insight.history?.map((entry) => (
                  <div key={entry.timestamp} className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">
                      {new Date(entry.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="font-semibold text-gray-900">₹{entry.price.toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No pricing insight available yet.</p>
        )}
      </div>
    </div>
  );
}
