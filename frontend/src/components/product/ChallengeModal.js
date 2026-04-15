'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export default function ChallengeModal({ open, challenge, loading, onClose, onSubmit }) {
  const [answer, setAnswer] = useState('');

  if (!open) return null;

  const handleSubmit = async () => {
    const success = await onSubmit(answer);
    if (success) {
      setAnswer('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Unlock Discount</h3>
            <p className="text-sm text-gray-500">Solve a quick {challenge?.type || 'challenge'} to earn a smarter deal.</p>
          </div>
          <button onClick={onClose} className="rounded-full p-2 text-gray-500 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </button>
        </div>

        {loading ? (
          <div className="space-y-3">
            <div className="h-4 animate-pulse rounded bg-gray-200" />
            <div className="h-24 animate-pulse rounded bg-gray-100" />
          </div>
        ) : challenge ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                {challenge.type} • {challenge.discountPercent}% off
              </p>
              <p className="mt-2 text-sm text-gray-800">{challenge.prompt}</p>
            </div>

            <textarea
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-amazon-orange"
              placeholder="Type your answer"
            />

            <button
              onClick={handleSubmit}
              disabled={!answer.trim()}
              className="btn-primary w-full disabled:opacity-50"
            >
              Submit Answer
            </button>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No challenge is live for this product yet.</p>
        )}
      </div>
    </div>
  );
}
