'use client';

import { AlertTriangle } from 'lucide-react';

const severityStyles = {
  high: 'border-red-200 bg-red-50 text-red-800',
  medium: 'border-amber-200 bg-amber-50 text-amber-800',
  low: 'border-sky-200 bg-sky-50 text-sky-800',
};

export default function ConflictWarnings({ warnings }) {
  if (!warnings?.length) return null;

  return (
    <div className="mb-5 space-y-3">
      {warnings.map((warning, index) => (
        <div
          key={`${warning.type}-${index}`}
          className={`rounded-lg border px-4 py-3 ${severityStyles[warning.severity] || severityStyles.medium}`}
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold">Cart insight</p>
              <p className="text-sm">{warning.message}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
