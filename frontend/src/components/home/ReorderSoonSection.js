'use client';

import Link from 'next/link';
import { RotateCcw } from 'lucide-react';

export default function ReorderSoonSection({ suggestions }) {
  if (!suggestions?.length) return null;

  return (
    <section className="mb-6 rounded-xl border border-orange-200 bg-gradient-to-r from-orange-50 via-white to-amber-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-3">
        <div className="rounded-full bg-orange-100 p-2 text-orange-600">
          <RotateCcw className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reorder Soon</h2>
          <p className="text-sm text-gray-600">Predictions based on your actual buying rhythm.</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {suggestions.map((suggestion) => (
          <Link
            key={suggestion.productId}
            href={`/products/${suggestion.productId}`}
            className="rounded-lg border border-gray-200 bg-white p-4 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-3 flex items-center gap-3">
              <img
                src={suggestion.product.images?.[0] || 'https://via.placeholder.com/80'}
                alt={suggestion.product.name}
                className="h-16 w-16 rounded border border-gray-100 object-contain"
              />
              <div>
                <p className="line-clamp-2 text-sm font-semibold text-gray-900">{suggestion.product.name}</p>
                <p className="mt-1 text-xs text-gray-500">{suggestion.product.category}</p>
              </div>
            </div>
            <p className="text-sm font-medium text-orange-700">{suggestion.message}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
